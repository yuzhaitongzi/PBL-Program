import type { ChatMessage } from "@/lib/agent";

const MAX_HISTORY = 12;

function sse(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

function resolveModels(): string[] {
  const primary = (process.env.LLM_MODEL ?? "glm-4.7-flash").trim();
  const fallbacks = (process.env.LLM_MODEL_FALLBACKS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([primary, ...fallbacks])];
}

/**
 * 调用大模型并把结果以统一的 SSE 协议流式返回。
 *
 * 统一协议：
 *   {"t":"meta","model":"...","sources":[...]}
 *   {"t":"delta","v":"..."}
 *   {"t":"done"}
 *   {"t":"error","message":"..."}
 *
 * 免费模型高峰期会返回 429，这里会自动降级到备用模型。
 */
export async function streamChat(options: {
  system: string;
  messages: ChatMessage[];
  sources?: string[];
}): Promise<Response> {
  const { system, messages, sources = [] } = options;

  const apiKey = process.env.LLM_API_KEY?.trim();
  const baseUrl = (process.env.LLM_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (!apiKey || !baseUrl) {
    return Response.json(
      { error: "尚未配置模型，请在 .env.local 中填写 LLM_API_KEY" },
      { status: 500 },
    );
  }

  const chatMessages = [
    { role: "system" as const, content: system },
    ...messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  let lastError = "";

  for (const model of resolveModels()) {
    for (const withThinkingFlag of [true, false]) {
      const payload: Record<string, unknown> = {
        model,
        messages: chatMessages,
        stream: true,
        temperature: 0.6,
        max_tokens: 1200,
      };
      if (withThinkingFlag) payload.thinking = { type: "disabled" };

      let upstream: Response;
      try {
        upstream = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        lastError = `${model}：网络错误 ${String(e)}`;
        continue;
      }

      if (!upstream.ok || !upstream.body) {
        const text = await upstream.text().catch(() => "");
        lastError = `${model}（${upstream.status}）：${text.slice(0, 300)}`;
        if (withThinkingFlag && upstream.status === 400) continue;
        break;
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          controller.enqueue(sse({ t: "meta", model, sources }));
          let buffer = "";
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payloadText = trimmed.slice(5).trim();
                if (!payloadText || payloadText === "[DONE]") continue;
                try {
                  const json = JSON.parse(payloadText);
                  const delta = json?.choices?.[0]?.delta?.content;
                  if (typeof delta === "string" && delta.length > 0) {
                    controller.enqueue(sse({ t: "delta", v: delta }));
                  }
                } catch {
                  // 忽略无法解析的分片
                }
              }
            }
            controller.enqueue(sse({ t: "done" }));
          } catch (e) {
            controller.enqueue(
              sse({ t: "error", message: `读取模型响应失败：${String(e)}` }),
            );
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
        cancel() {
          reader.cancel().catch(() => {});
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }
  }

  return Response.json(
    {
      error:
        "模型暂时不可用（免费模型高峰期可能限流），请稍后重试。" +
        (lastError ? `\n${lastError}` : ""),
    },
    { status: 502 },
  );
}

import { NextRequest } from "next/server";
import { buildSystemPrompt, type ChatMessage } from "@/lib/agent";
import { retrieve } from "@/lib/knowledge";
import { streamChat } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 大模型回答通常是流式的，耗时可能超过 20 秒；
// Vercel 默认的函数超时较短，这里显式放宽到 60 秒。
export const maxDuration = 60;

/** 学生端智能体：先检索课程资料，再交给模型回答 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { messages?: ChatMessage[] }
    | null;

  const messages = (body?.messages ?? []).filter(
    (m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );

  if (messages.length === 0) {
    return Response.json({ error: "没有收到消息内容" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const hits = lastUser ? retrieve(lastUser.content, 5) : [];

  return streamChat({
    system: buildSystemPrompt(hits),
    messages,
    sources: [...new Set(hits.map((h) => h.source))],
  });
}

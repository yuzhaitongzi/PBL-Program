"use client";

import { useEffect, useRef, useState } from "react";

export type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  title: string;
  greeting: string;
  hint: string;
  suggestionsPool: string[];
  accent: "blue" | "slate";
  endpoint: string;
  buildBody?: (messages: Msg[]) => unknown;
  onAsk?: (text: string) => void;
};

const ACCENT = {
  blue: {
    fab: "bg-blue-600 hover:bg-blue-700",
    avatar: "bg-blue-600",
    bubble: "bg-blue-600 text-white",
    send: "bg-blue-600 hover:bg-blue-700",
    chip: "hover:border-blue-300 hover:text-blue-700",
  },
  slate: {
    fab: "bg-slate-900 hover:bg-slate-700",
    avatar: "bg-slate-900",
    bubble: "bg-slate-900 text-white",
    send: "bg-slate-900 hover:bg-slate-700",
    chip: "hover:border-slate-400 hover:text-slate-800",
  },
} as const;

function pickThree(pool: string[]): string[] {
  const rest = [...pool];
  const out: string[] = [];
  while (out.length < 3 && rest.length > 0) {
    out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  }
  return out;
}

function renderContent(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function AgentPanel({
  title,
  greeting,
  hint,
  suggestionsPool,
  accent,
  endpoint,
  buildBody,
  onAsk,
}: Props) {
  const c = ACCENT[accent];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(pickThree(suggestionsPool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) setSuggestions(pickThree(suggestionsPool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    onAsk?.(question);
    setError("");
    setSources([]);
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildBody ? buildBody(history) : { messages: history },
        ),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `请求失败（${res.status}）`);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          let payload: {
            t: string;
            v?: string;
            model?: string;
            sources?: string[];
            message?: string;
          };
          try {
            payload = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (payload.t === "meta") {
            setModel(payload.model ?? "");
            setSources(payload.sources ?? []);
          } else if (payload.t === "delta" && payload.v) {
            const chunk = payload.v;
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = { ...last, content: last.content + chunk };
              }
              return copy;
            });
          } else if (payload.t === "error") {
            setError(payload.message ?? "模型返回出错");
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(`连接失败：${String(e)}`);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg transition ${c.fab}`}
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[11px]">
            问
          </span>
          {title}
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[620px] sm:w-[440px] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-2xl">
          <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-medium text-white ${c.avatar}`}
            >
              问
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="truncate text-[11px] text-slate-400">
                {model ? `${model} · ${hint}` : hint}
              </p>
            </div>
            <button
              onClick={() => {
                if (messages.length > 0 && !confirm("清空当前对话？")) return;
                setMessages([]);
                setSources([]);
                setError("");
              }}
              className="rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              清空
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="关闭"
            >
              ×
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{greeting}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
              </div>
            ) : null}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    m.role === "user" ? c.bubble : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.role === "assistant" && m.content === "" ? (
                    <span className="text-slate-400">正在思考…</span>
                  ) : (
                    renderContent(m.content)
                  )}
                </div>
              </div>
            ))}

            {error ? (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                {error}
              </div>
            ) : null}

            {sources.length > 0 ? (
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] font-medium text-slate-500">
                  本次参考
                </p>
                <ul className="mt-1 space-y-0.5">
                  {sources.map((s) => (
                    <li key={s} className="text-[11px] leading-5 text-slate-500">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="mb-2 flex items-start gap-2">
              <div className="flex flex-1 flex-wrap gap-1.5">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={loading}
                    className={`rounded-full border border-slate-200 px-2.5 py-1 text-[11px] leading-4 text-slate-600 transition disabled:opacity-50 ${c.chip}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSuggestions(pickThree(suggestionsPool))}
                title="换一批问题"
                className="shrink-0 rounded-md px-1.5 py-1 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                换一批
              </button>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={2}
                placeholder="输入问题，回车发送"
                className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-slate-400"
              />
              {loading ? (
                <button
                  onClick={() => {
                    abortRef.current?.abort();
                    setLoading(false);
                  }}
                  className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim()}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${c.send}`}
                >
                  发送
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

import { NextRequest } from "next/server";
import { buildTeacherSystemPrompt, type ChatMessage } from "@/lib/agent";
import { digestToText, type TeachingDigest } from "@/lib/teaching-digest";
import { streamChat } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 教师端智能体：学情数据存在浏览器本地，
 * 由前端把聚合后的摘要一并发来，服务端拼进系统提示词。
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { messages?: ChatMessage[]; digest?: TeachingDigest }
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

  const digestText = body?.digest ? digestToText(body.digest) : "";

  return streamChat({
    system: buildTeacherSystemPrompt(digestText),
    messages,
    sources: ["本机学情数据"],
  });
}

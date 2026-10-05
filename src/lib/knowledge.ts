import { chapters } from "@/content/course";
import { defaultQuestions } from "@/content/questions";
import { defaultResources } from "@/content/resources";

export type KnowledgeChunk = {
  id: string;
  /** 显示给学生看的出处，例如「第 1 章 1.5 直流电路的分析方法」 */
  source: string;
  text: string;
};

export type RetrievedSource = { source: string; text: string; score: number };

const clean = (s: string) => s.replace(/[\s\p{P}]/gu, "");

function bigrams(s: string): string[] {
  const t = clean(s);
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i += 1) out.push(t.slice(i, i + 2));
  if (t.length === 1) out.push(t);
  return out;
}

let cached: KnowledgeChunk[] | null = null;

/**
 * 知识库：把 44 节的四类资源与 87 道题切成条目。
 * 数据来自内置内容；教师端的编辑保存在浏览器本地，服务端暂不感知。
 */
export function getKnowledgeBase(): KnowledgeChunk[] {
  if (cached) return cached;

  const chunks: KnowledgeChunk[] = [];
  const sectionLabel = new Map<string, string>();

  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      const label = `第 ${chapter.no} 章 ${section.id.replace(/^s/, "")} ${section.title}`;
      sectionLabel.set(section.id, label);
      const r = defaultResources[section.id];
      if (!r) continue;

      if (r.points.length > 0) {
        chunks.push({
          id: `${section.id}-points`,
          source: label,
          text: `本节知识点：${r.points.join("、")}`,
        });
      }
      if (r.example.title) {
        chunks.push({
          id: `${section.id}-example`,
          source: label,
          text: `典型例题：${r.example.title}\n解析：${r.example.solution}`,
        });
      }
      if (r.pitfalls.length > 0) {
        chunks.push({
          id: `${section.id}-pitfall`,
          source: label,
          text: `常见易错点：\n${r.pitfalls.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
        });
      }
      if (r.case.title) {
        chunks.push({
          id: `${section.id}-case`,
          source: label,
          text: `工程案例：${r.case.title}\n${r.case.body}`,
        });
      }
    }
  }

  for (const q of defaultQuestions) {
    const label = sectionLabel.get(q.sectionId) ?? "课程题库";
    const typeName =
      q.type === "single"
        ? "单选题"
        : q.type === "judge"
          ? "判断题"
          : q.type === "multiple"
            ? "多选题"
            : "计算题";
    const options = q.options?.length
      ? `\n选项：${q.options.map((o, i) => `${"ABCDEF"[i] ?? i + 1}. ${o}`).join("；")}`
      : "";
    chunks.push({
      id: q.id,
      source: `${label}（${typeName}）`,
      text: `题目：${q.stem}${options}\n答案：${q.answer}\n解析：${q.explanation}\n涉及知识点：${q.points.join("、")}`,
    });
  }

  cached = chunks;
  return chunks;
}

export function scoreChunk(query: string, chunk: KnowledgeChunk): number {
  const grams = [...new Set(bigrams(query))];
  const text = clean(chunk.source + chunk.text);
  let score = 0;
  for (const g of grams) if (text.includes(g)) score += 1;
  // 标题命中额外加权
  const title = clean(chunk.source);
  for (const g of grams) if (title.includes(g)) score += 2;
  return score;
}

export function retrieve(query: string, k = 5): RetrievedSource[] {
  const base = getKnowledgeBase();
  const scored = base
    .map((chunk) => ({ chunk, score: scoreChunk(query, chunk) }))
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored.map(({ chunk, score }) => ({
    source: chunk.source,
    text: chunk.text.slice(0, 700),
    score,
  }));
}

import type { Question, QuestionType } from "@/content/questions";

export type DiagnosticItem = {
  questionId: string;
  chapterId: string;
  sectionId: string;
  points: string[];
  type: QuestionType;
  stem: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
};

export type DiagnosticRecord = {
  id: string;
  at: number;
  majorId: string;
  majorName: string;
  chapterIds: string[];
  items: DiagnosticItem[];
  score: number;
  total: number;
};

/** 诊断测评只抽可自动判分的客观题 */
export const DIAGNOSTIC_TYPES: QuestionType[] = ["single", "judge"];

export function isAutoGradable(q: Question): boolean {
  return q.type === "single" || q.type === "judge";
}

export function pickDiagnosticQuestions(
  pool: Question[],
  chapterIds: string[],
  count: number,
): Question[] {
  const candidates = pool.filter(
    (q) => isAutoGradable(q) && chapterIds.includes(q.chapterId),
  );
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function gradeAnswer(q: Question, answer: string): boolean {
  if (!answer) return false;
  return answer.trim().toUpperCase() === (q.answer ?? "").trim().toUpperCase();
}

export function buildItems(
  paper: Question[],
  answers: Record<string, string>,
): DiagnosticItem[] {
  return paper.map((q) => {
    const userAnswer = answers[q.id] ?? "";
    return {
      questionId: q.id,
      chapterId: q.chapterId,
      sectionId: q.sectionId,
      points: q.points,
      type: q.type,
      stem: q.stem,
      userAnswer,
      correctAnswer: q.answer,
      correct: gradeAnswer(q, userAnswer),
    };
  });
}

export type MasteryRow = {
  key: string;
  label: string;
  correct: number;
  total: number;
  rate: number;
};

function aggregate(
  items: DiagnosticItem[],
  pick: (item: DiagnosticItem) => string[],
  labelOf: (key: string) => string,
): MasteryRow[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const item of items) {
    for (const key of pick(item)) {
      const cur = map.get(key) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (item.correct) cur.correct += 1;
      map.set(key, cur);
    }
  }
  return [...map.entries()]
    .map(([key, v]) => ({
      key,
      label: labelOf(key),
      correct: v.correct,
      total: v.total,
      rate: v.total === 0 ? 0 : v.correct / v.total,
    }))
    .sort((a, b) => a.rate - b.rate);
}

/** 按知识点汇总掌握度，掌握度低的排在前面 */
export function masteryByPoint(items: DiagnosticItem[]): MasteryRow[] {
  return aggregate(items, (i) => i.points, (k) => k);
}

/** 按章节汇总掌握度 */
export function masteryByChapter(
  items: DiagnosticItem[],
  labelOf: (chapterId: string) => string,
): MasteryRow[] {
  return aggregate(
    items,
    (i) => [i.chapterId],
    labelOf,
  );
}

export function masteryLevel(rate: number): {
  label: string;
  className: string;
  bar: string;
} {
  if (rate < 0.6) {
    return {
      label: "待加强",
      className: "bg-red-50 text-red-700",
      bar: "bg-red-400",
    };
  }
  if (rate < 0.85) {
    return {
      label: "基本掌握",
      className: "bg-amber-50 text-amber-700",
      bar: "bg-amber-400",
    };
  }
  return {
    label: "掌握良好",
    className: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  };
}

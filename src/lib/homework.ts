"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Difficulty, Question, QuestionType } from "@/content/questions";
import { isAutoGradable, masteryByPoint, type DiagnosticItem } from "@/lib/diagnostic";

export const HOMEWORK_KEY = "et.homework.v1";

export type HomeworkItem = {
  questionId: string;
  chapterId: string;
  sectionId: string;
  points: string[];
  type: QuestionType;
  stem: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: Difficulty;
  images?: string[];
};

export type Homework = {
  id: string;
  title: string;
  chapterIds: string[];
  items: HomeworkItem[];
  dueAt: number | null;
  createdAt: number;
  closed: boolean;
};

export type ErrorKind = "knowledge" | "method" | "careless";

export const ERROR_LABEL: Record<
  ErrorKind,
  { name: string; desc: string; className: string }
> = {
  knowledge: {
    name: "知识性",
    desc: "该知识点掌握度偏低，属于概念或方法没有真正掌握",
    className: "bg-red-50 text-red-700",
  },
  method: {
    name: "方法性",
    desc: "知识点基本掌握但本题仍答错，属于分析或计算过程的问题",
    className: "bg-amber-50 text-amber-700",
  },
  careless: {
    name: "粗心",
    desc: "题目难度较低且同知识点其他题答对，属于审题或计算疏忽",
    className: "bg-slate-100 text-slate-600",
  },
};

export type GradedResult = {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  errorKind: ErrorKind | null;
};

export type HomeworkSubmission = {
  id: string;
  homeworkId: string;
  student: string;
  answers: Record<string, string>;
  results: GradedResult[];
  submittedAt: number;
  score: number;
  total: number;
};

export type PracticeTask = {
  id: string;
  point: string;
  createdAt: number;
  questionIds: string[];
  answers: Record<string, string>;
  completedAt: number | null;
  score: number | null;
  total: number;
};

export type HomeworkBoard = {
  homeworks: Homework[];
  submissions: HomeworkSubmission[];
  practice: PracticeTask[];
};

export const EMPTY_HOMEWORK_BOARD: HomeworkBoard = {
  homeworks: [],
  submissions: [],
  practice: [],
};

export function loadHomeworkBoard(): HomeworkBoard {
  if (typeof window === "undefined") return EMPTY_HOMEWORK_BOARD;
  try {
    const raw = window.localStorage.getItem(HOMEWORK_KEY);
    if (!raw) return EMPTY_HOMEWORK_BOARD;
    const parsed = JSON.parse(raw) as HomeworkBoard;
    return {
      homeworks: Array.isArray(parsed.homeworks) ? parsed.homeworks : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      practice: Array.isArray(parsed.practice) ? parsed.practice : [],
    };
  } catch {
    return EMPTY_HOMEWORK_BOARD;
  }
}

export function saveHomeworkBoard(board: HomeworkBoard): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HOMEWORK_KEY, JSON.stringify(board));
}

export function useHomeworkBoard() {
  const [board, setBoard] = useState<HomeworkBoard>(EMPTY_HOMEWORK_BOARD);
  const [ready, setReady] = useState(false);
  const ref = useRef<HomeworkBoard>(EMPTY_HOMEWORK_BOARD);

  useEffect(() => {
    const initial = loadHomeworkBoard();
    ref.current = initial;
    setBoard(initial);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === HOMEWORK_KEY || e.key === null) {
        const next = loadHomeworkBoard();
        ref.current = next;
        setBoard(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const mutate = useCallback((fn: (b: HomeworkBoard) => HomeworkBoard) => {
    const next = fn(ref.current);
    ref.current = next;
    saveHomeworkBoard(next);
    setBoard(next);
  }, []);

  const resetAll = useCallback(() => {
    ref.current = EMPTY_HOMEWORK_BOARD;
    window.localStorage.removeItem(HOMEWORK_KEY);
    setBoard(EMPTY_HOMEWORK_BOARD);
  }, []);

  return { board, ready, mutate, resetAll };
}

export function snapshotItem(q: Question): HomeworkItem {
  return {
    questionId: q.id,
    chapterId: q.chapterId,
    sectionId: q.sectionId,
    points: [...q.points],
    type: q.type,
    stem: q.stem,
    options: q.options ? [...q.options] : undefined,
    answer: q.answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    images: q.images ? [...q.images] : undefined,
  };
}

export function buildHomeworkItems(
  pool: Question[],
  chapterIds: string[],
  count: number,
): HomeworkItem[] {
  const candidates = pool.filter(
    (q) => isAutoGradable(q) && chapterIds.includes(q.chapterId),
  );
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(snapshotItem);
}

export function gradeItem(item: HomeworkItem, answer: string): boolean {
  if (!answer) return false;
  return answer.trim().toUpperCase() === item.answer.trim().toUpperCase();
}

/** 按知识点历史掌握度与题目难度推导错因，规则可解释、可复核 */
export function attributeError(args: {
  item: HomeworkItem;
  mastery: Record<string, number>;
  basicThreshold: number;
  othersCorrect: boolean;
}): ErrorKind {
  const { item, mastery, basicThreshold, othersCorrect } = args;
  const rates = item.points
    .map((p) => mastery[p])
    .filter((r): r is number => typeof r === "number");
  const avg =
    rates.length === 0 ? null : rates.reduce((a, b) => a + b, 0) / rates.length;

  if (avg !== null && avg < basicThreshold) return "knowledge";
  if (item.difficulty === "易" && othersCorrect) return "careless";
  if (item.difficulty === "易") return "careless";
  return "method";
}

export function gradeSubmission(args: {
  homework: Homework;
  student: string;
  answers: Record<string, string>;
  mastery: Record<string, number>;
  basicThreshold: number;
}): HomeworkSubmission {
  const { homework, student, answers, mastery, basicThreshold } = args;

  const byPoint = new Map<string, { correct: number; total: number }>();
  homework.items.forEach((item) => {
    const ok = gradeItem(item, answers[item.questionId] ?? "");
    item.points.forEach((p) => {
      const cur = byPoint.get(p) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (ok) cur.correct += 1;
      byPoint.set(p, cur);
    });
  });

  const results: GradedResult[] = homework.items.map((item) => {
    const userAnswer = answers[item.questionId] ?? "";
    const correct = gradeItem(item, userAnswer);
    if (correct) {
      return { questionId: item.questionId, userAnswer, correct, errorKind: null };
    }
    const stats = item.points
      .map((p) => byPoint.get(p))
      .filter((v): v is { correct: number; total: number } => Boolean(v));
    const othersCorrect =
      stats.length > 0 && stats.every((s) => s.correct >= Math.max(1, s.total - 1));
    return {
      questionId: item.questionId,
      userAnswer,
      correct,
      errorKind: attributeError({ item, mastery, basicThreshold, othersCorrect }),
    };
  });

  return {
    id: `s-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    homeworkId: homework.id,
    student,
    answers,
    results,
    submittedAt: Date.now(),
    score: results.filter((r) => r.correct).length,
    total: results.length,
  };
}

/** 从诊断记录汇总知识点掌握度：point -> rate */
export function masteryRateMap(items: DiagnosticItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  masteryByPoint(items).forEach((row) => {
    map[row.label] = row.rate;
  });
  return map;
}

export function pointsMatchLoose(a: string, b: string): boolean {
  const x = a.trim();
  const y = b.trim();
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/** 为某个知识点生成补练题：排除已出现过的题目 */
export function generatePracticeIds(
  point: string,
  questions: Question[],
  excludeIds: string[],
  count = 3,
): string[] {
  return questions
    .filter(
      (q) =>
        isAutoGradable(q) &&
        !excludeIds.includes(q.id) &&
        q.points.some((p) => pointsMatchLoose(p, point)),
    )
    .slice(0, count)
    .map((q) => q.id);
}

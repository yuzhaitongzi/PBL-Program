"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Question, QuestionType } from "@/content/questions";
import { isAutoGradable } from "@/lib/diagnostic";

export const QUIZ_KEY = "et.quiz.session.v1";

export type QuizQuestion = {
  questionId: string;
  chapterId: string;
  sectionId: string;
  points: string[];
  type: QuestionType;
  stem: string;
  options?: string[];
  answer: string;
  explanation: string;
  images?: string[];
};

export type QuizResponse = {
  id: string;
  student: string;
  answers: Record<string, string>;
  submittedAt: number;
  score: number;
  total: number;
};

export type QuizSession = {
  code: string;
  createdAt: number;
  title: string;
  chapterIds: string[];
  questions: QuizQuestion[];
  status: "open" | "closed";
  responses: QuizResponse[];
};

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function snapshotQuestion(q: Question): QuizQuestion {
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
    images: q.images ? [...q.images] : undefined,
  };
}

export function buildQuizQuestions(
  pool: Question[],
  chapterIds: string[],
  count: number,
): QuizQuestion[] {
  const candidates = pool.filter(
    (q) => isAutoGradable(q) && chapterIds.includes(q.chapterId),
  );
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(snapshotQuestion);
}

export function gradeQuestion(q: QuizQuestion, answer: string): boolean {
  if (!answer) return false;
  return answer.trim().toUpperCase() === q.answer.trim().toUpperCase();
}

export function loadQuizSession(): QuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizSession;
    if (!parsed || !Array.isArray(parsed.questions)) return null;
    return { ...parsed, responses: parsed.responses ?? [] };
  } catch {
    return null;
  }
}

export function saveQuizSession(session: QuizSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUIZ_KEY, JSON.stringify(session));
}

export function clearQuizSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(QUIZ_KEY);
}

/** 统计某题各选项的作答人数 */
export function optionDistribution(
  session: QuizSession,
  question: QuizQuestion,
): { label: string; count: number }[] {
  const labels =
    question.type === "judge"
      ? ["对", "错"]
      : (question.options ?? []).map((_, i) => "ABCDEF"[i] ?? String(i + 1));

  return labels.map((label) => ({
    label,
    count: session.responses.filter(
      (r) => (r.answers[question.questionId] ?? "").toUpperCase() === label,
    ).length,
  }));
}

export function questionAccuracy(
  session: QuizSession,
  question: QuizQuestion,
): { correct: number; total: number; rate: number } {
  const submitted = session.responses.length;
  const correct = session.responses.filter((r) =>
    gradeQuestion(question, r.answers[question.questionId] ?? ""),
  ).length;
  return {
    correct,
    total: submitted,
    rate: submitted === 0 ? 0 : correct / submitted,
  };
}

const SURNAMES = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴"];
const GIVEN = ["同学", "同学", "同学", "同学"];

export function randomStudentName(): string {
  const s = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const g = GIVEN[Math.floor(Math.random() * GIVEN.length)];
  return `${s}${g}${Math.floor(10 + Math.random() * 90)}`;
}

/** 生成一份随机的模拟作答，用于课堂演示 */
export function randomResponse(session: QuizSession): QuizResponse {
  const answers: Record<string, string> = {};
  session.questions.forEach((q) => {
    const labels =
      q.type === "judge"
        ? ["对", "错"]
        : (q.options ?? []).map((_, i) => "ABCDEF"[i] ?? String(i + 1));
    // 七成概率答对
    const pick = Math.random() < 0.7 ? q.answer : labels[Math.floor(Math.random() * labels.length)];
    answers[q.questionId] = pick;
  });
  const score = session.questions.filter((q) => gradeQuestion(q, answers[q.questionId])).length;
  return {
    id: `r-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    student: randomStudentName(),
    answers,
    submittedAt: Date.now(),
    score,
    total: session.questions.length,
  };
}

/**
 * 课堂快测会话。
 *
 * 当前实现：数据存在浏览器本地，并通过 storage 事件在标签页之间同步，
 * 因此同一台电脑上开两个标签页就能演示「教师大屏 + 学生答题」的实时效果。
 * 换成真实课堂时，把 load/save 替换为服务端接口 + WebSocket 即可，
 * 页面组件无需改动。
 */
export function useQuizSession() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [ready, setReady] = useState(false);
  const ref = useRef<QuizSession | null>(null);

  useEffect(() => {
    const initial = loadQuizSession();
    ref.current = initial;
    setSession(initial);
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === QUIZ_KEY || e.key === null) {
        const next = loadQuizSession();
        ref.current = next;
        setSession(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const mutate = useCallback((fn: (s: QuizSession) => QuizSession) => {
    const cur = ref.current;
    if (!cur) return;
    const next = fn(cur);
    ref.current = next;
    saveQuizSession(next);
    setSession(next);
  }, []);

  const start = useCallback((s: QuizSession) => {
    ref.current = s;
    saveQuizSession(s);
    setSession(s);
  }, []);

  const stop = useCallback(() => {
    const cur = ref.current;
    if (!cur) return;
    const next: QuizSession = { ...cur, status: "closed" };
    ref.current = next;
    saveQuizSession(next);
    setSession(next);
  }, []);

  const reset = useCallback(() => {
    ref.current = null;
    clearQuizSession();
    setSession(null);
  }, []);

  return { session, ready, mutate, start, stop, reset };
}

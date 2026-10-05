"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Chapter, SectionResource } from "@/content/course";
import type { Question } from "@/content/questions";

export const TASK_KEY = "et.tasks.v1";

export type PreviewTask = {
  id: string;
  title: string;
  chapterIds: string[];
  sectionIds: string[];
  goals: string[];
  requirement: string;
  dueAt: number | null;
  createdAt: number;
  closed: boolean;
};

export type TaskQuestion = {
  id: string;
  taskId: string;
  text: string;
  at: number;
};

export type TaskBoard = {
  tasks: PreviewTask[];
  /** 本机学生标记完成的节：taskId -> sectionIds */
  completions: Record<string, string[]>;
  /** 学生预习疑问 */
  questions: TaskQuestion[];
};

export const EMPTY_BOARD: TaskBoard = { tasks: [], completions: {}, questions: [] };

export function loadTaskBoard(): TaskBoard {
  if (typeof window === "undefined") return EMPTY_BOARD;
  try {
    const raw = window.localStorage.getItem(TASK_KEY);
    if (!raw) return EMPTY_BOARD;
    const parsed = JSON.parse(raw) as TaskBoard;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      completions: parsed.completions ?? {},
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    };
  } catch {
    return EMPTY_BOARD;
  }
}

export function saveTaskBoard(board: TaskBoard): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASK_KEY, JSON.stringify(board));
}

export function clearTaskBoard(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TASK_KEY);
}

export type SectionRef = {
  chapterId: string;
  chapterNo: number;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
};

export function sectionsOf(task: PreviewTask, chapters: Chapter[]): SectionRef[] {
  const out: SectionRef[] = [];
  for (const c of chapters) {
    for (const s of c.sections) {
      if (!task.sectionIds.includes(s.id)) continue;
      out.push({
        chapterId: c.id,
        chapterNo: c.no,
        chapterTitle: c.title,
        sectionId: s.id,
        sectionTitle: s.title,
      });
    }
  }
  return out;
}

export function completionOf(board: TaskBoard, taskId: string, total: number) {
  const done = (board.completions[taskId] ?? []).length;
  return { done, total, rate: total === 0 ? 0 : done / total };
}

export function formatDue(dueAt: number | null): string {
  if (!dueAt) return "不设截止";
  const d = new Date(dueAt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export function remainingText(dueAt: number | null): string {
  if (!dueAt) return "不设截止";
  const diff = dueAt - Date.now();
  if (diff <= 0) return "已截止";
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `剩余 ${hours} 小时`;
  return `剩余 ${Math.floor(hours / 24)} 天`;
}

/** 一键生成导学单：把任务范围、知识点、例题与相关题目拼成一份可打印的文档 */
export function buildGuide(args: {
  task: PreviewTask;
  chapters: Chapter[];
  resources: Record<string, SectionResource>;
  questions: Question[];
}): string {
  const { task, chapters, resources, questions } = args;
  const refs = sectionsOf(task, chapters);
  const lines: string[] = [];

  lines.push("《电工技术》预习导学单");
  lines.push("");
  lines.push(`任务：${task.title}`);
  lines.push(`截止时间：${formatDue(task.dueAt)}`);
  lines.push(
    `预习范围：${refs
      .map((r) => `第 ${r.chapterNo} 章 ${r.sectionId.replace(/^s/, "")} ${r.sectionTitle}`)
      .join("；")}`,
  );
  lines.push("");
  lines.push("一、学习目标");
  if (task.goals.length === 0) {
    lines.push("（未设置）");
  } else {
    task.goals.forEach((g, i) => lines.push(`${i + 1}. ${g}`));
  }
  if (task.requirement.trim()) {
    lines.push("");
    lines.push("二、预习要求");
    lines.push(task.requirement.trim());
  }

  lines.push("");
  lines.push("三、各节要点");
  for (const ref of refs) {
    const r = resources[ref.sectionId];
    lines.push("");
    lines.push(`${ref.sectionId.replace(/^s/, "")}　${ref.sectionTitle}`);
    if (r?.points.length) {
      lines.push(`  知识点：${r.points.join("、")}`);
    }
    if (r?.example.title) {
      lines.push(`  例题：${r.example.title}`);
    }
    if (r?.pitfalls.length) {
      lines.push(`  易错点：${r.pitfalls[0]}`);
    }
  }

  const related = questions
    .filter((q) => task.sectionIds.includes(q.sectionId))
    .slice(0, 3);
  lines.push("");
  lines.push("四、预习思考题");
  if (related.length === 0) {
    lines.push("（暂无）");
  } else {
    related.forEach((q, i) => {
      lines.push(`${i + 1}. ${q.stem}`);
    });
  }

  lines.push("");
  lines.push("五、预习疑问记录");
  lines.push("（把不确定的问题写下来，带入课堂讨论）");

  return lines.join("\n");
}

/** 任务看板：数据存本地并通过 storage 事件在标签页之间同步 */
export function useTaskBoard() {
  const [board, setBoard] = useState<TaskBoard>(EMPTY_BOARD);
  const [ready, setReady] = useState(false);
  const ref = useRef<TaskBoard>(EMPTY_BOARD);

  useEffect(() => {
    const initial = loadTaskBoard();
    ref.current = initial;
    setBoard(initial);
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === TASK_KEY || e.key === null) {
        const next = loadTaskBoard();
        ref.current = next;
        setBoard(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const mutate = useCallback((fn: (b: TaskBoard) => TaskBoard) => {
    const next = fn(ref.current);
    ref.current = next;
    saveTaskBoard(next);
    setBoard(next);
  }, []);

  const resetAll = useCallback(() => {
    ref.current = EMPTY_BOARD;
    clearTaskBoard();
    setBoard(EMPTY_BOARD);
  }, []);

  return { board, ready, mutate, resetAll };
}

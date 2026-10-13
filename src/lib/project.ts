"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const PROJECT_KEY = "et.projects.v1";

export type Milestone = {
  id: string;
  title: string;
  desc: string;
  dueAt: number | null;
};

export type ProjectTriWing = {
  design: string;
  engineering: string;
  management: string;
};

export type Project = {
  id: string;
  title: string;
  /** 驱动性问题，整个项目的锚点 */
  drivingQuestion: string;
  /** 真实情境 */
  scenario: string;
  chapterIds: string[];
  triWing: ProjectTriWing;
  deliverable: "report" | "slides" | "both";
  milestones: Milestone[];
  startAt: number | null;
  endAt: number | null;
  published: boolean;
  templateId?: string;
  createdAt: number;
};

export type MilestoneProgress = {
  done: boolean;
  /** 探究记录：查了什么、发现了什么、卡在哪里、怎么解决 */
  inquiry: string;
  /** 反思日志 */
  reflection: string;
  updatedAt: number;
};

export type ProjectSubmission = {
  id: string;
  projectId: string;
  deliverable: "report" | "slides";
  title: string;
  summary: string;
  /** 大文件放不下，用外链 */
  link: string;
  images: string[];
  submittedAt: number;
};

export type ProjectBoard = {
  projects: Project[];
  /** projectId -> milestoneId -> 进度 */
  progress: Record<string, Record<string, MilestoneProgress>>;
  submissions: ProjectSubmission[];
};

export const EMPTY_PROJECT_BOARD: ProjectBoard = {
  projects: [],
  progress: {},
  submissions: [],
};

export const DELIVERABLE_LABEL: Record<Project["deliverable"], string> = {
  report: "设计报告",
  slides: "汇报 PPT",
  both: "设计报告 + 汇报 PPT",
};

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

export function loadProjectBoard(): ProjectBoard {
  if (typeof window === "undefined") return EMPTY_PROJECT_BOARD;
  try {
    const raw = window.localStorage.getItem(PROJECT_KEY);
    if (!raw) return EMPTY_PROJECT_BOARD;
    const parsed = JSON.parse(raw) as ProjectBoard;
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      progress: parsed.progress ?? {},
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch {
    return EMPTY_PROJECT_BOARD;
  }
}

export function saveProjectBoard(board: ProjectBoard): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECT_KEY, JSON.stringify(board));
}

export function useProjectBoard() {
  const [board, setBoard] = useState<ProjectBoard>(EMPTY_PROJECT_BOARD);
  const [ready, setReady] = useState(false);
  const ref = useRef<ProjectBoard>(EMPTY_PROJECT_BOARD);

  useEffect(() => {
    const initial = loadProjectBoard();
    ref.current = initial;
    setBoard(initial);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROJECT_KEY || e.key === null) {
        const next = loadProjectBoard();
        ref.current = next;
        setBoard(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const mutate = useCallback((fn: (b: ProjectBoard) => ProjectBoard) => {
    const next = fn(ref.current);
    ref.current = next;
    saveProjectBoard(next);
    setBoard(next);
  }, []);

  const resetAll = useCallback(() => {
    ref.current = EMPTY_PROJECT_BOARD;
    window.localStorage.removeItem(PROJECT_KEY);
    setBoard(EMPTY_PROJECT_BOARD);
  }, []);

  return { board, ready, mutate, resetAll };
}

export function projectProgress(board: ProjectBoard, project: Project) {
  const done = project.milestones.filter(
    (m) => board.progress[project.id]?.[m.id]?.done,
  ).length;
  const total = project.milestones.length;
  return { done, total, rate: total === 0 ? 0 : done / total };
}

export function currentMilestone(board: ProjectBoard, project: Project): Milestone | null {
  const found = project.milestones.find(
    (m) => !board.progress[project.id]?.[m.id]?.done,
  );
  return found ?? null;
}

export function formatDate(t: number | null): string {
  if (!t) return "未设置";
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** 从模板生成项目；里程碑按"第 n 天"自动排期 */
export function projectFromTemplate(
  template: {
    id: string;
    title: string;
    drivingQuestion: string;
    scenario: string;
    chapterIds: string[];
    triWing: ProjectTriWing;
    deliverable: Project["deliverable"];
    milestones: { title: string; desc: string; offsetDays: number }[];
  },
  startAt: number | null,
): Project {
  const base = startAt ?? Date.now();
  return {
    id: uid("pj"),
    title: template.title,
    drivingQuestion: template.drivingQuestion,
    scenario: template.scenario,
    chapterIds: [...template.chapterIds],
    triWing: { ...template.triWing },
    deliverable: template.deliverable,
    milestones: template.milestones.map((m) => ({
      id: uid("ms"),
      title: m.title,
      desc: m.desc,
      dueAt: base + m.offsetDays * 86400000,
    })),
    startAt: base,
    endAt: startAt
      ? base + Math.max(...template.milestones.map((m) => m.offsetDays)) * 86400000
      : null,
    published: false,
    templateId: template.id,
    createdAt: Date.now(),
  };
}

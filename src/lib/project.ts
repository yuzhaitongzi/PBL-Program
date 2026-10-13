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

export type WingKey = "design" | "engineering" | "management";

export const WING_INFO: { key: WingKey; name: string; desc: string }[] = [
  { key: "design", name: "设计翼", desc: "问题识别与方案构想" },
  { key: "engineering", name: "工程翼", desc: "分析建模与实验验证" },
  { key: "management", name: "管理翼", desc: "流程组织、规范表达与团队协作" },
];

/** 评价量规的一个评分点 */
export type RubricCriterion = {
  id: string;
  wing: WingKey;
  name: string;
  desc: string;
  weight: number;
};

/** 默认量规：三翼共 6 个评分点，权重合计 100 */
export const DEFAULT_RUBRIC: Omit<RubricCriterion, "id">[] = [
  {
    wing: "design",
    name: "问题识别",
    desc: "能准确界定问题的核心、边界与约束条件",
    weight: 15,
  },
  {
    wing: "design",
    name: "方案构想",
    desc: "提出合理可行的解决思路，并说明方案取舍的理由",
    weight: 20,
  },
  {
    wing: "engineering",
    name: "分析计算",
    desc: "参数计算正确、公式与依据充分，过程可追溯",
    weight: 20,
  },
  {
    wing: "engineering",
    name: "实验验证",
    desc: "方案经过仿真或实测验证，数据记录真实可靠",
    weight: 20,
  },
  {
    wing: "management",
    name: "流程组织",
    desc: "按里程碑推进，过程完整，任务按时完成",
    weight: 15,
  },
  {
    wing: "management",
    name: "规范表达",
    desc: "报告结构清晰、图表规范、术语与引用准确",
    weight: 10,
  },
];

export function makeDefaultRubric(): RubricCriterion[] {
  return DEFAULT_RUBRIC.map((c) => ({ ...c, id: uid("rc") }));
}

/** 四档评分，避免教师在分数上纠结 */
export const SCORE_LEVELS = [
  { label: "优秀", value: 95, className: "bg-emerald-50 text-emerald-700 ring-emerald-300" },
  { label: "良好", value: 85, className: "bg-blue-50 text-blue-700 ring-blue-300" },
  { label: "合格", value: 70, className: "bg-amber-50 text-amber-700 ring-amber-300" },
  { label: "待改进", value: 50, className: "bg-red-50 text-red-700 ring-red-300" },
] as const;

export type Evaluation = {
  id: string;
  projectId: string;
  role: "self" | "teacher";
  /** criterionId -> 分值 */
  scores: Record<string, number>;
  comment: string;
  evaluatedAt: number;
};

export type WingScores = {
  design: number;
  engineering: number;
  management: number;
  total: number;
  answered: number;
};

/** 按量规权重把评分点汇总到三翼与总评 */
export function scoredWings(
  scores: Record<string, number>,
  rubric: RubricCriterion[],
): WingScores {
  const acc: Record<WingKey, { sum: number; weight: number }> = {
    design: { sum: 0, weight: 0 },
    engineering: { sum: 0, weight: 0 },
    management: { sum: 0, weight: 0 },
  };
  let totalSum = 0;
  let totalWeight = 0;
  let answered = 0;

  for (const c of rubric) {
    const score = scores[c.id];
    if (typeof score !== "number") continue;
    answered += 1;
    acc[c.wing].sum += score * c.weight;
    acc[c.wing].weight += c.weight;
    totalSum += score * c.weight;
    totalWeight += c.weight;
  }

  const wing = (k: WingKey) =>
    acc[k].weight === 0 ? 0 : acc[k].sum / acc[k].weight;

  return {
    design: Math.round(wing("design")),
    engineering: Math.round(wing("engineering")),
    management: Math.round(wing("management")),
    total: totalWeight === 0 ? 0 : Math.round(totalSum / totalWeight),
    answered,
  };
}

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
  /** 评价量规 */
  rubric: RubricCriterion[];
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
  /** 自评与教师评价 */
  evaluations: Evaluation[];
};

export const EMPTY_PROJECT_BOARD: ProjectBoard = {
  projects: [],
  progress: {},
  submissions: [],
  evaluations: [],
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
    const projects = (Array.isArray(parsed.projects) ? parsed.projects : []).map(
      (p) => ({
        ...p,
        rubric:
          Array.isArray(p.rubric) && p.rubric.length > 0
            ? p.rubric
            : makeDefaultRubric(),
      }),
    );
    return {
      projects,
      progress: parsed.progress ?? {},
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : [],
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
    rubric: makeDefaultRubric(),
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

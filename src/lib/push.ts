import type { Chapter, SectionResource } from "@/content/course";
import type { Question } from "@/content/questions";
import type { DiagnosticItem } from "@/lib/diagnostic";
import { masteryByPoint } from "@/lib/diagnostic";

export type PushLayer = "basic" | "improve" | "extend";

export const LAYER_META: Record<
  PushLayer,
  { name: string; desc: string; className: string; bar: string }
> = {
  basic: {
    name: "巩固层",
    desc: "先看知识点回顾、例题与易错点，把概念和方法补牢",
    className: "bg-red-50 text-red-700",
    bar: "bg-red-400",
  },
  improve: {
    name: "提升层",
    desc: "基本掌握，用例题与配套练习巩固方法",
    className: "bg-amber-50 text-amber-700",
    bar: "bg-amber-400",
  },
  extend: {
    name: "拓展层",
    desc: "掌握良好，转向工程案例与综合应用",
    className: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  },
};

export const LAYER_ORDER: PushLayer[] = ["basic", "improve", "extend"];

export type PushRule = {
  /** 巩固线：低于此值进入巩固层 */
  basicThreshold: number;
  /** 掌握线：高于此值进入拓展层 */
  masterThreshold: number;
  /** A 型专业（要求较高）在上两条线上的上浮幅度 */
  levelAAdjust: number;
};

export const DEFAULT_PUSH_RULE: PushRule = {
  basicThreshold: 0.6,
  masterThreshold: 0.85,
  levelAAdjust: 0.1,
};

export function thresholdsFor(rule: PushRule, level: "A" | "B") {
  const adjust = level === "A" ? rule.levelAAdjust : 0;
  return {
    basic: Math.min(0.95, rule.basicThreshold + adjust),
    master: Math.min(0.98, rule.masterThreshold + adjust),
  };
}

export function layerOf(
  rate: number,
  thresholds: { basic: number; master: number },
): PushLayer {
  if (rate < thresholds.basic) return "basic";
  if (rate < thresholds.master) return "improve";
  return "extend";
}

/** 知识点标签匹配：完全相等或互相包含都算命中 */
export function pointsMatch(a: string, b: string): boolean {
  const x = a.trim();
  const y = b.trim();
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

export type SectionRef = {
  chapterId: string;
  chapterNo: number;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
};

export type PushItem = {
  point: string;
  rate: number;
  correct: number;
  total: number;
  layer: PushLayer;
  sections: SectionRef[];
  questions: Question[];
};

export function buildSectionIndex(
  chapters: Chapter[],
  resources: Record<string, SectionResource>,
): { refs: SectionRef[]; points: string[] }[] {
  const out: { refs: SectionRef[]; points: string[] }[] = [];
  for (const c of chapters) {
    for (const s of c.sections) {
      out.push({
        refs: [
          {
            chapterId: c.id,
            chapterNo: c.no,
            chapterTitle: c.title,
            sectionId: s.id,
            sectionTitle: s.title,
          },
        ],
        points: resources[s.id]?.points ?? [],
      });
    }
  }
  return out;
}

export function buildPushItems(args: {
  diagnosticItems: DiagnosticItem[];
  questions: Question[];
  chapters: Chapter[];
  resources: Record<string, SectionResource>;
  rule: PushRule;
  majorLevel: "A" | "B";
}): PushItem[] {
  const { diagnosticItems, questions, chapters, resources, rule, majorLevel } = args;
  const thresholds = thresholdsFor(rule, majorLevel);
  const rows = masteryByPoint(diagnosticItems);

  return rows.map((row) => {
    const sections: SectionRef[] = [];
    for (const c of chapters) {
      for (const s of c.sections) {
        const tags = resources[s.id]?.points ?? [];
        if (tags.some((t) => pointsMatch(t, row.label))) {
          sections.push({
            chapterId: c.id,
            chapterNo: c.no,
            chapterTitle: c.title,
            sectionId: s.id,
            sectionTitle: s.title,
          });
        }
      }
    }

    const related = questions.filter((q) =>
      q.points.some((p) => pointsMatch(p, row.label)),
    );

    return {
      point: row.label,
      rate: row.rate,
      correct: row.correct,
      total: row.total,
      layer: layerOf(row.rate, thresholds),
      sections,
      questions: related,
    };
  });
}

export function groupByLayer(items: PushItem[]): Record<PushLayer, PushItem[]> {
  const out: Record<PushLayer, PushItem[]> = { basic: [], improve: [], extend: [] };
  for (const item of items) out[item.layer].push(item);
  for (const key of LAYER_ORDER) out[key].sort((a, b) => a.rate - b.rate);
  return out;
}

/** 统计资源与题目的覆盖情况 */
export function coverageStats(
  questions: Question[],
  resources: Record<string, SectionResource>,
) {
  const allPoints = new Set<string>();
  Object.values(resources).forEach((r) => r.points.forEach((p) => allPoints.add(p)));
  questions.forEach((q) => q.points.forEach((p) => allPoints.add(p)));

  let withSection = 0;
  let withQuestion = 0;
  for (const point of allPoints) {
    const hasSection = Object.values(resources).some((r) =>
      r.points.some((t) => pointsMatch(t, point)),
    );
    const hasQuestion = questions.some((q) =>
      q.points.some((t) => pointsMatch(t, point)),
    );
    if (hasSection) withSection += 1;
    if (hasQuestion) withQuestion += 1;
  }

  return {
    totalPoints: allPoints.size,
    withSection,
    withQuestion,
    both: [...allPoints].filter(
      (point) =>
        Object.values(resources).some((r) =>
          r.points.some((t) => pointsMatch(t, point)),
        ) && questions.some((q) => q.points.some((t) => pointsMatch(t, point))),
    ).length,
  };
}

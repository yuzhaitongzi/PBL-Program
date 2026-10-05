/**
 * 教师端学情摘要。
 *
 * 学生数据存在浏览器本地，教师端智能体无法直接查库，
 * 因此由前端把数据聚合成一份紧凑摘要，随请求一起发给服务端。
 */

export type ErrorKindKey = "knowledge" | "method" | "careless";

export type DigestInput = {
  major: string;
  chatQuestions: { at: number; text: string }[];
  previewQuestions: { at: number; text: string }[];
  homeworks: {
    title: string;
    items: { questionId: string; stem: string; points: string[] }[];
  }[];
  submissions: {
    homeworkId: string;
    homeworkTitle: string;
    submittedAt: number;
    score: number;
    total: number;
    results: {
      questionId: string;
      correct: boolean;
      errorKind: ErrorKindKey | null;
    }[];
  }[];
  diagnosticItems: {
    points: string[];
    correct: boolean;
  }[];
  practice: { point: string; score: number | null; total: number }[];
};

export type TeachingDigest = {
  generatedAt: number;
  major: string;
  chatQuestionCount: number;
  chatQuestions: { at: number; text: string }[];
  previewQuestions: { at: number; text: string }[];
  errorKindCounts: Record<ErrorKindKey, number>;
  pointRows: { point: string; correct: number; total: number; rate: number }[];
  hardestQuestions: {
    stem: string;
    points: string[];
    correct: number;
    total: number;
    rate: number;
  }[];
  homeworkSummaries: { title: string; submissions: number; avgRate: number }[];
  diagnosticWeak: { point: string; correct: number; total: number; rate: number }[];
  practiceSummary: { point: string; rate: number | null }[];
};

export function buildTeachingDigest(input: DigestInput): TeachingDigest {
  const errorKindCounts: Record<ErrorKindKey, number> = {
    knowledge: 0,
    method: 0,
    careless: 0,
  };

  const pointMap = new Map<string, { correct: number; total: number }>();
  const questionMap = new Map<
    string,
    { stem: string; points: string[]; correct: number; total: number }
  >();

  for (const hw of input.homeworks) {
    for (const item of hw.items) {
      if (!questionMap.has(item.questionId)) {
        questionMap.set(item.questionId, {
          stem: item.stem,
          points: item.points,
          correct: 0,
          total: 0,
        });
      }
    }
  }

  for (const sub of input.submissions) {
    for (const r of sub.results) {
      if (r.errorKind) errorKindCounts[r.errorKind] += 1;
      const q = questionMap.get(r.questionId);
      if (q) {
        q.total += 1;
        if (r.correct) q.correct += 1;
        for (const p of q.points) {
          const cur = pointMap.get(p) ?? { correct: 0, total: 0 };
          cur.total += 1;
          if (r.correct) cur.correct += 1;
          pointMap.set(p, cur);
        }
      }
    }
  }

  const pointRows = [...pointMap.entries()]
    .map(([point, v]) => ({
      point,
      correct: v.correct,
      total: v.total,
      rate: v.total === 0 ? 0 : v.correct / v.total,
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 12);

  const hardestQuestions = [...questionMap.values()]
    .filter((q) => q.total > 0)
    .map((q) => ({
      stem: q.stem.slice(0, 60),
      points: q.points,
      correct: q.correct,
      total: q.total,
      rate: q.correct / q.total,
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 8);

  const homeworkSummaries = input.homeworks.map((hw) => {
    const subs = input.submissions.filter((s) => s.homeworkTitle === hw.title);
    const avgRate =
      subs.length === 0
        ? 0
        : subs.reduce((a, s) => a + s.score / Math.max(1, s.total), 0) / subs.length;
    return { title: hw.title, submissions: subs.length, avgRate };
  });

  const diagMap = new Map<string, { correct: number; total: number }>();
  for (const item of input.diagnosticItems) {
    for (const p of item.points) {
      const cur = diagMap.get(p) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (item.correct) cur.correct += 1;
      diagMap.set(p, cur);
    }
  }
  const diagnosticWeak = [...diagMap.entries()]
    .map(([point, v]) => ({
      point,
      correct: v.correct,
      total: v.total,
      rate: v.total === 0 ? 0 : v.correct / v.total,
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 12);

  return {
    generatedAt: Date.now(),
    major: input.major,
    chatQuestionCount: input.chatQuestions.length,
    chatQuestions: [...input.chatQuestions]
      .sort((a, b) => b.at - a.at)
      .slice(0, 15),
    previewQuestions: [...input.previewQuestions]
      .sort((a, b) => b.at - a.at)
      .slice(0, 10),
    errorKindCounts,
    pointRows,
    hardestQuestions,
    homeworkSummaries,
    diagnosticWeak,
    practiceSummary: input.practice.map((p) => ({
      point: p.point,
      rate: p.score === null ? null : p.score / Math.max(1, p.total),
    })),
  };
}

const fmtTime = (t: number) => {
  const d = new Date(t);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
};

const pct = (r: number) => `${Math.round(r * 100)}%`;

export function digestToText(d: TeachingDigest): string {
  const lines: string[] = [];
  lines.push(`统计时间：${fmtTime(d.generatedAt)}`);
  lines.push(`当前专业视角：${d.major}`);
  lines.push(`数据口径：与教师端同一浏览器中产生的记录（非全班真实汇总）`);
  lines.push("");

  lines.push(`【一、学生提问】共 ${d.chatQuestionCount} 条，最近若干条：`);
  if (d.chatQuestions.length === 0) {
    lines.push("（暂无学生向智能体提问的记录）");
  } else {
    d.chatQuestions.forEach((q) => lines.push(`- ${fmtTime(q.at)} ${q.text}`));
  }

  lines.push("");
  lines.push("【二、预习疑问】");
  if (d.previewQuestions.length === 0) {
    lines.push("（暂无预习疑问）");
  } else {
    d.previewQuestions.forEach((q) => lines.push(`- ${fmtTime(q.at)} ${q.text}`));
  }

  lines.push("");
  lines.push("【三、作业错因分布】");
  lines.push(
    `知识性 ${d.errorKindCounts.knowledge} 次、方法性 ${d.errorKindCounts.method} 次、粗心 ${d.errorKindCounts.careless} 次`,
  );

  lines.push("");
  lines.push("【四、各知识点作业正确率（由低到高）】");
  if (d.pointRows.length === 0) {
    lines.push("（暂无作业数据）");
  } else {
    d.pointRows.forEach((r) =>
      lines.push(`- ${r.point}：${pct(r.rate)}（${r.correct}/${r.total}）`),
    );
  }

  lines.push("");
  lines.push("【五、错误率最高的题目】");
  if (d.hardestQuestions.length === 0) {
    lines.push("（暂无题目作答数据）");
  } else {
    d.hardestQuestions.forEach((q, i) =>
      lines.push(
        `${i + 1}. 「${q.stem}…」正确率 ${pct(q.rate)}（${q.correct}/${q.total}），知识点：${q.points.join("、")}`,
      ),
    );
  }

  lines.push("");
  lines.push("【六、诊断测评中的薄弱知识点（由低到高）】");
  if (d.diagnosticWeak.length === 0) {
    lines.push("（暂无诊断数据）");
  } else {
    d.diagnosticWeak.forEach((r) =>
      lines.push(`- ${r.point}：${pct(r.rate)}（${r.correct}/${r.total}）`),
    );
  }

  lines.push("");
  lines.push("【七、作业概况】");
  if (d.homeworkSummaries.length === 0) {
    lines.push("（还没有布置作业）");
  } else {
    d.homeworkSummaries.forEach((h) =>
      lines.push(
        `- ${h.title}：提交 ${h.submissions} 份，平均正确率 ${pct(h.avgRate)}`,
      ),
    );
  }

  lines.push("");
  lines.push("【八、补练情况】");
  if (d.practiceSummary.length === 0) {
    lines.push("（暂无补练记录）");
  } else {
    d.practiceSummary.forEach((p) =>
      lines.push(
        `- ${p.point}：${p.rate === null ? "未完成" : `正确率 ${pct(p.rate)}`}`,
      ),
    );
  }

  return lines.join("\n");
}

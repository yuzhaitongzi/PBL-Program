"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { chapterById } from "@/content/course";
import { readImageFiles } from "@/lib/image";
import {
  DELIVERABLE_LABEL,
  SCORE_LEVELS,
  WING_INFO,
  formatDate,
  projectProgress,
  scoredWings,
  uid,
  useProjectBoard,
  type MilestoneProgress,
  type ProjectSubmission,
} from "@/lib/project";
import { WingRadar, type RadarSeries } from "@/components/wing-radar";

const WINGS = [
  { key: "design", name: "设计翼", desc: "问题识别与方案构想" },
  { key: "engineering", name: "工程翼", desc: "分析建模与实验验证" },
  { key: "management", name: "管理翼", desc: "流程组织、规范表达与团队协作" },
] as const;

export default function ProjectWorkbenchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { board, mutate } = useProjectBoard();

  const [draft, setDraft] = useState({
    deliverable: "report" as ProjectSubmission["deliverable"],
    title: "",
    summary: "",
    link: "",
    images: [] as string[],
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [selfComment, setSelfComment] = useState("");

  const project = board.projects.find((p) => p.id === id);

  useEffect(() => {
    const e = board.evaluations.find(
      (x) => x.projectId === id && x.role === "self",
    );
    setSelfScores(e?.scores ?? {});
    setSelfComment(e?.comment ?? "");
  }, [id, board.evaluations]);

  if (!project) {
    return (
      <div className="space-y-4">
        <Link href="/student/projects" className="text-sm text-blue-600 hover:underline">
          ← 返回项目列表
        </Link>
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          没有找到这个项目，可能已被删除。
        </p>
      </div>
    );
  }

  const prog = projectProgress(board, project);
  const submissions = board.submissions.filter((s) => s.projectId === project.id);

  function setMilestone(msId: string, patch: Partial<MilestoneProgress>) {
    if (!project) return;
    mutate((b) => {
      const cur = b.progress[project.id]?.[msId] ?? {
        done: false,
        inquiry: "",
        reflection: "",
        updatedAt: 0,
      };
      return {
        ...b,
        progress: {
          ...b.progress,
          [project.id]: {
            ...(b.progress[project.id] ?? {}),
            [msId]: { ...cur, ...patch, updatedAt: Date.now() },
          },
        },
      };
    });
  }

  function submitWork() {
    if (!project || !draft.title.trim()) return;
    const sub: ProjectSubmission = {
      id: uid("sub"),
      projectId: project.id,
      deliverable: draft.deliverable,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      link: draft.link.trim(),
      images: draft.images,
      submittedAt: Date.now(),
    };
    mutate((b) => ({ ...b, submissions: [sub, ...b.submissions] }));
    setDraft({
      deliverable: "report",
      title: "",
      summary: "",
      link: "",
      images: [],
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/student/projects" className="text-sm text-blue-600 hover:underline">
        ← 返回项目列表
      </Link>

      {/* 项目头部 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">{project.title}</h1>
        <div className="mt-4 rounded-xl bg-blue-50 p-5">
          <p className="text-xs font-medium text-blue-700">驱动性问题</p>
          <p className="mt-1.5 text-lg font-medium leading-8 text-blue-900">
            {project.drivingQuestion || "（未填写）"}
          </p>
        </div>
        {project.scenario ? (
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">真实情境</p>
            <p className="mt-1 text-sm leading-7 text-slate-700">
              {project.scenario}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
          <span>
            涉及章节：
            {project.chapterIds.length === 0
              ? "未指定"
              : project.chapterIds
                  .map((c) => `第 ${chapterById.get(c)?.no ?? "?"} 章`)
                  .join("、")}
          </span>
          <span>成果形式：{DELIVERABLE_LABEL[project.deliverable]}</span>
          <span>
            项目周期：{formatDate(project.startAt)} ~ {formatDate(project.endAt)}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>项目进度</span>
            <span>
              {prog.done} / {prog.total} 个里程碑
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                prog.rate >= 1 ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${Math.round(prog.rate * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 三翼目标 */}
      <section className="grid gap-4 sm:grid-cols-3">
        {WINGS.map((w) => (
          <div
            key={w.key}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-semibold text-slate-900">{w.name}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{w.desc}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {project.triWing[w.key] || "（未设置）"}
            </p>
          </div>
        ))}
      </section>

      {/* 里程碑 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          项目里程碑（{project.milestones.length}）
        </h2>
        {project.milestones.map((m, i) => {
          const p = board.progress[project.id]?.[m.id];
          const done = p?.done ?? false;
          const overdue =
            !done && m.dueAt !== null && m.dueAt < Date.now();
          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-6 ${
                done
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">
                      {m.title || "未命名阶段"}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    截止 {formatDate(m.dueAt)}
                    {overdue ? (
                      <span className="ml-2 text-red-600">已逾期</span>
                    ) : null}
                  </p>
                </div>
                <button
                  onClick={() => setMilestone(m.id, { done: !done })}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                    done
                      ? "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {done ? "取消完成" : "标记完成"}
                </button>
              </div>

              {m.desc ? (
                <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm leading-6 text-slate-700">
                  {m.desc}
                </p>
              ) : null}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">
                    探究记录
                    <span className="ml-1 font-normal text-slate-400">
                      查了什么、发现了什么、卡在哪里、怎么解决
                    </span>
                  </span>
                  <textarea
                    value={p?.inquiry ?? ""}
                    onChange={(e) =>
                      setMilestone(m.id, { inquiry: e.target.value })
                    }
                    rows={4}
                    placeholder="记下这一阶段的探究过程"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">
                    反思日志
                    <span className="ml-1 font-normal text-slate-400">
                      这一阶段哪里做得好、哪里要改进
                    </span>
                  </span>
                  <textarea
                    value={p?.reflection ?? ""}
                    onChange={(e) =>
                      setMilestone(m.id, { reflection: e.target.value })
                    }
                    rows={4}
                    placeholder="写下你的反思"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                  />
                </label>
              </div>
            </div>
          );
        })}
        {project.milestones.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-400">
            老师还没有为这个项目设置里程碑
          </p>
        ) : null}
      </section>

      {/* 作品提交 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">提交作品</h2>
        <p className="mt-1 text-xs text-slate-500">
          成果形式为{DELIVERABLE_LABEL[project.deliverable]}。
          报告和 PPT 文件通常较大，请上传到网盘或课程平台后，把链接粘贴在下面；
          图表、实物照片可以直接上传。
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">成果类型</span>
            <select
              value={draft.deliverable}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  deliverable: e.target.value as ProjectSubmission["deliverable"],
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="report">设计报告</option>
              <option value="slides">汇报 PPT</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">标题</span>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="例如：直流稳压电源设计报告（终稿）"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-xs text-slate-500">摘要 / 说明</span>
          <textarea
            value={draft.summary}
            onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
            rows={3}
            placeholder="简述你的方案、主要结论与遇到的问题"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-xs text-slate-500">作品链接（可选）</span>
          <input
            value={draft.link}
            onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
            placeholder="粘贴网盘或在线文档链接"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </label>

        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              上传图片附件
            </button>
            <span className="text-xs text-slate-400">
              可上传电路图、波形截图、实物照片
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={async (e) => {
                const urls = await readImageFiles(e.target.files);
                if (urls.length > 0) {
                  setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
                }
                e.target.value = "";
              }}
            />
          </div>
          {draft.images.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {draft.images.map((src, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`附件 ${i + 1}`}
                    className="h-24 w-32 rounded-lg border border-slate-200 object-cover"
                  />
                  <button
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        images: d.images.filter((_, j) => j !== i),
                      }))
                    }
                    className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs text-slate-500 shadow ring-1 ring-slate-200 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          onClick={submitWork}
          disabled={!draft.title.trim()}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          提交作品
        </button>

        {submissions.length > 0 ? (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500">
              已提交（{submissions.length}）
            </p>
            <ul className="mt-2 divide-y divide-slate-100">
              {submissions.map((s) => (
                <li key={s.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {DELIVERABLE_LABEL[s.deliverable]}
                    </span>
                    <span className="text-sm text-slate-800">{s.title}</span>
                    <span className="ml-auto text-xs text-slate-400">
                      {new Date(s.submittedAt).toLocaleString("zh-CN")}
                    </span>
                    <button
                      onClick={() =>
                        mutate((b) => ({
                          ...b,
                          submissions: b.submissions.filter((x) => x.id !== s.id),
                        }))
                      }
                      className="text-xs text-slate-400 transition hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                  {s.summary ? (
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {s.summary}
                    </p>
                  ) : null}
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-blue-600 underline"
                    >
                      {s.link}
                    </a>
                  ) : null}
                  {s.images.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.images.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={src}
                          alt={`附件 ${i + 1}`}
                          className="h-24 w-32 rounded-lg border border-slate-200 object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* 自评 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">项目自评</h2>
        <p className="mt-1 text-xs text-slate-500">
          对照量规给自己打分，系统会按权重汇总成三翼能力值。教师评分后可以对照看差距。
        </p>
        {(() => {
          const selfEval = board.evaluations.find(
            (e) => e.projectId === project.id && e.role === "self",
          );
          const teacherEval = board.evaluations.find(
            (e) => e.projectId === project.id && e.role === "teacher",
          );
          const series: RadarSeries[] = [];
          if (selfEval) {
            const s = scoredWings(selfEval.scores, project.rubric);
            series.push({
              name: `我的自评（${s.total}）`,
              color: "#3b82f6",
              values: [s.design, s.engineering, s.management],
            });
          }
          if (teacherEval) {
            const s = scoredWings(teacherEval.scores, project.rubric);
            series.push({
              name: `教师评分（${s.total}）`,
              color: "#0f172a",
              values: [s.design, s.engineering, s.management],
            });
          }
          return (
            <div className="mt-4 grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="rounded-xl bg-slate-50 p-4">
                {series.length === 0 ? (
                  <p className="py-12 text-center text-xs text-slate-400">
                    打完分并保存后，这里会出现你的能力雷达图
                  </p>
                ) : (
                  <>
                    <WingRadar series={series} />
                    <div className="mt-3 space-y-1">
                      {WING_INFO.map((w) => {
                        const idx = ["design", "engineering", "management"].indexOf(
                          w.key,
                        );
                        const mine = series[0]?.values[idx] ?? 0;
                        return (
                          <p
                            key={w.key}
                            className="flex justify-between text-[11px] text-slate-500"
                          >
                            <span>{w.name}</span>
                            <span>{mine}</span>
                          </p>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="space-y-2">
                  {project.rubric.map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center gap-2">
                      <span className="w-40 shrink-0 text-xs text-slate-600">
                        {c.name}
                        <span className="ml-1 text-[10px] text-slate-400">
                          {c.weight}
                        </span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {SCORE_LEVELS.map((l) => (
                          <button
                            key={l.label}
                            onClick={() =>
                              setSelfScores((s) => ({ ...s, [c.id]: l.value }))
                            }
                            className={`rounded-md px-2.5 py-1 text-[11px] ring-1 transition ${
                              selfScores[c.id] === l.value
                                ? l.className
                                : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300"
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {project.rubric.map((c) =>
                  c.desc ? (
                    <p key={`${c.id}-d`} className="mt-1 text-[11px] text-slate-400">
                      {c.name}：{c.desc}
                    </p>
                  ) : null,
                )}
                <textarea
                  value={selfComment}
                  onChange={(e) => setSelfComment(e.target.value)}
                  rows={3}
                  placeholder="写下你对自己这次项目的总结"
                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => {
                    const existing = board.evaluations.find(
                      (e) => e.projectId === project.id && e.role === "self",
                    );
                    const record = {
                      id: existing?.id ?? uid("ev"),
                      projectId: project.id,
                      role: "self" as const,
                      scores: selfScores,
                      comment: selfComment,
                      evaluatedAt: Date.now(),
                    };
                    mutate((b) => ({
                      ...b,
                      evaluations: existing
                        ? b.evaluations.map((e) =>
                            e.id === existing.id ? record : e,
                          )
                        : [...b.evaluations, record],
                    }));
                  }}
                  className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  保存自评
                </button>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}

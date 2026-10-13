"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chapters } from "@/content/course";
import { PROJECT_TEMPLATES } from "@/content/projects";
import {
  DELIVERABLE_LABEL,
  formatDate,
  projectFromTemplate,
  projectProgress,
  uid,
  useProjectBoard,
  type Milestone,
  type Project,
} from "@/lib/project";

const pad = (n: number) => String(n).padStart(2, "0");

function toDateInput(t: number | null): string {
  if (!t) return "";
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromDateInput(s: string): number | null {
  if (!s) return null;
  const t = new Date(`${s}T00:00:00`).getTime();
  return Number.isNaN(t) ? null : t;
}

export default function TeacherProjectsPage() {
  const { board, mutate, resetAll } = useProjectBoard();
  const [selectedId, setSelectedId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedId && board.projects.length > 0) {
      setSelectedId(board.projects[0].id);
    }
  }, [board.projects, selectedId]);

  const project = board.projects.find((p) => p.id === selectedId) ?? null;

  function update(patch: Partial<Project>) {
    if (!project) return;
    mutate((b) => ({
      ...b,
      projects: b.projects.map((p) =>
        p.id === project.id ? { ...p, ...patch } : p,
      ),
    }));
    setSaved(false);
  }

  function updateMilestone(msId: string, patch: Partial<Milestone>) {
    if (!project) return;
    update({
      milestones: project.milestones.map((m) =>
        m.id === msId ? { ...m, ...patch } : m,
      ),
    });
  }

  function addFromTemplate(templateId: string) {
    const tpl = PROJECT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const startAt = fromDateInput(startDate);
    const p = projectFromTemplate(tpl, startAt);
    mutate((b) => ({ ...b, projects: [p, ...b.projects] }));
    setSelectedId(p.id);
  }

  function addBlank() {
    const startAt = fromDateInput(startDate);
    const p: Project = {
      id: uid("pj"),
      title: "未命名项目",
      drivingQuestion: "",
      scenario: "",
      chapterIds: [],
      triWing: { design: "", engineering: "", management: "" },
      deliverable: "report",
      milestones: [],
      startAt,
      endAt: null,
      published: false,
      createdAt: Date.now(),
    };
    mutate((b) => ({ ...b, projects: [p, ...b.projects] }));
    setSelectedId(p.id);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">项目工坊</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              以驱动性问题为锚，把课程内容组织成一段持续探究。
              从模板快速创建，再按实际情况调整里程碑与时间。
            </p>
          </div>
          {board.projects.length > 0 ? (
            <button
              onClick={() => {
                if (confirm("确定删除全部项目及其进度吗？")) {
                  resetAll();
                  setSelectedId("");
                }
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
            >
              清空全部
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">从模板创建</h2>
        <p className="mt-1 text-xs text-slate-500">
          可选填项目开始日期，里程碑会按模板中的天数自动排期。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-500">
            开始日期
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          </label>
          <button
            onClick={addBlank}
            className="rounded-lg border border-dashed border-slate-300 px-4 py-1.5 text-sm text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            + 空白项目
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-xl border border-slate-200 p-4"
            >
              <p className="text-sm font-medium text-slate-900">{t.title}</p>
              <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">
                {t.drivingQuestion}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                涉及 {t.chapterIds.map((c) => `第 ${c.replace("ch", "")} 章`).join("、")} ·{" "}
                {t.milestones.length} 个里程碑
              </p>
              <button
                onClick={() => addFromTemplate(t.id)}
                className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                使用此模板
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="px-2 py-1 text-[11px] font-medium text-slate-400">
            已创建项目（{board.projects.length}）
          </p>
          {board.projects.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-slate-400">
              还没有项目
            </p>
          ) : (
            <ul className="space-y-1">
              {board.projects.map((p) => {
                const on = p.id === selectedId;
                const prog = projectProgress(board, p);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left transition ${
                        on ? "bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            p.published ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`flex-1 truncate text-xs ${
                            on ? "font-medium text-blue-900" : "text-slate-700"
                          }`}
                        >
                          {p.title || "未命名项目"}
                        </span>
                      </div>
                      <p className="mt-0.5 pl-3.5 text-[11px] text-slate-400">
                        {p.published ? "已发布" : "草稿"} · 进度 {prog.done}/
                        {prog.total}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {project ? (
          <section className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">项目设置</h2>
                <div className="flex items-center gap-2">
                  {saved ? (
                    <span className="text-xs text-emerald-600">已保存</span>
                  ) : null}
                  <button
                    onClick={() => {
                      update({ published: !project.published });
                      setSaved(true);
                    }}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                      project.published
                        ? "border border-slate-200 text-slate-600 hover:border-slate-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {project.published ? "撤回为草稿" : "发布给学生"}
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("确定删除这个项目吗？")) return;
                      mutate((b) => ({
                        ...b,
                        projects: b.projects.filter((p) => p.id !== project.id),
                      }));
                      setSelectedId("");
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="text-xs text-slate-500">项目标题</span>
                <input
                  value={project.title}
                  onChange={(e) => update({ title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-xs text-slate-500">
                  驱动性问题（整个项目的锚点，用「如何……」来写）
                </span>
                <textarea
                  value={project.drivingQuestion}
                  onChange={(e) => update({ drivingQuestion: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-xs text-slate-500">真实情境</span>
                <textarea
                  value={project.scenario}
                  onChange={(e) => update({ scenario: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                />
              </label>

              <div>
                <p className="text-xs text-slate-500">关联章节</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chapters.map((c) => {
                    const on = project.chapterIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          update({
                            chapterIds: on
                              ? project.chapterIds.filter((x) => x !== c.id)
                              : [...project.chapterIds, c.id],
                          })
                        }
                        className={`rounded-full px-2.5 py-1 text-xs transition ${
                          on
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        第 {c.no} 章
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["design", "设计翼目标"],
                    ["engineering", "工程翼目标"],
                    ["management", "管理翼目标"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-xs text-slate-500">{label}</span>
                    <textarea
                      value={project.triWing[key]}
                      onChange={(e) =>
                        update({
                          triWing: { ...project.triWing, [key]: e.target.value },
                        })
                      }
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs leading-5 outline-none focus:border-blue-400"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs text-slate-500">成果形式</span>
                  <select
                    value={project.deliverable}
                    onChange={(e) =>
                      update({
                        deliverable: e.target.value as Project["deliverable"],
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    {Object.entries(DELIVERABLE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">开始日期</span>
                  <input
                    type="date"
                    value={toDateInput(project.startAt)}
                    onChange={(e) =>
                      update({ startAt: fromDateInput(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">结束日期</span>
                  <input
                    type="date"
                    value={toDateInput(project.endAt)}
                    onChange={(e) =>
                      update({ endAt: fromDateInput(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  里程碑（{project.milestones.length}）
                </h2>
                <button
                  onClick={() =>
                    update({
                      milestones: [
                        ...project.milestones,
                        { id: uid("ms"), title: "", desc: "", dueAt: null },
                      ],
                    })
                  }
                  className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 transition hover:border-blue-300 hover:text-blue-700"
                >
                  + 添加里程碑
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {project.milestones.map((m, i) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">第 {i + 1} 阶段</span>
                      <input
                        value={m.title}
                        onChange={(e) =>
                          updateMilestone(m.id, { title: e.target.value })
                        }
                        placeholder="阶段名称"
                        className="min-w-48 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                      <input
                        type="date"
                        value={toDateInput(m.dueAt)}
                        onChange={(e) =>
                          updateMilestone(m.id, {
                            dueAt: fromDateInput(e.target.value),
                          })
                        }
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={() =>
                          update({
                            milestones: project.milestones.filter(
                              (x) => x.id !== m.id,
                            ),
                          })
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
                      >
                        删除
                      </button>
                    </div>
                    <textarea
                      value={m.desc}
                      onChange={(e) =>
                        updateMilestone(m.id, { desc: e.target.value })
                      }
                      rows={2}
                      placeholder="这一阶段要完成什么"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                    />
                  </div>
                ))}
                {project.milestones.length === 0 ? (
                  <p className="text-xs text-slate-400">还没有里程碑</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">学生进度与提交</h2>
              <p className="mt-1 text-xs text-slate-500">
                当前为本机记录；接入数据库后此处将显示每个学生的进度。
              </p>
              {(() => {
                const prog = projectProgress(board, project);
                const subs = board.submissions.filter(
                  (s) => s.projectId === project.id,
                );
                return (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-600">
                        里程碑完成 {prog.done}/{prog.total}
                        {project.endAt
                          ? ` · 截止 ${formatDate(project.endAt)}`
                          : ""}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.round(prog.rate * 100)}%` }}
                        />
                      </div>
                    </div>
                    {subs.length === 0 ? (
                      <p className="text-xs text-slate-400">还没有提交作品</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {subs.map((s) => (
                          <li key={s.id} className="py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                                {DELIVERABLE_LABEL[s.deliverable]}
                              </span>
                              <span className="text-sm text-slate-800">
                                {s.title || "（未命名）"}
                              </span>
                              <span className="ml-auto text-xs text-slate-400">
                                {new Date(s.submittedAt).toLocaleString("zh-CN")}
                              </span>
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
                                打开作品链接 →
                              </a>
                            ) : null}
                            {s.images.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {s.images.map((src, idx) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={idx}
                                    src={src}
                                    alt={`附件 ${idx + 1}`}
                                    className="h-24 w-32 rounded-lg border border-slate-200 object-cover"
                                  />
                                ))}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-400">
            从上方模板创建一个项目，或从左侧选择一个项目进行编辑
          </section>
        )}
      </div>
    </div>
  );
}

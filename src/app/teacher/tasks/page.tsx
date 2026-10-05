"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapters, type SectionResource } from "@/content/course";
import {
  buildGuide,
  completionOf,
  formatDue,
  sectionsOf,
  useTaskBoard,
  type PreviewTask,
} from "@/lib/task";

export default function TeacherTasksPage() {
  const { questions, getResource } = useAppState();
  const { board, mutate, resetAll } = useTaskBoard();

  const [title, setTitle] = useState("");
  const [pickedChapters, setPickedChapters] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [goalsText, setGoalsText] = useState("");
  const [requirement, setRequirement] = useState("");
  const [due, setDue] = useState("");
  const [guide, setGuide] = useState("");

  const resourceMap = useMemo(() => {
    const map: Record<string, SectionResource> = {};
    chapters.forEach((c) =>
      c.sections.forEach((s) => {
        map[s.id] = getResource(s.id);
      }),
    );
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getResource]);

  const allSectionIds = pickedChapters.flatMap(
    (cid) => chapters.find((c) => c.id === cid)?.sections.map((s) => s.id) ?? [],
  );
  const sectionIds = allSectionIds.filter((id) => !excluded.includes(id));

  function toggleChapter(cid: string) {
    setPickedChapters((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid],
    );
  }

  function draftTask(): PreviewTask {
    return {
      id: `t-${Date.now().toString(36)}`,
      title: title.trim() || "预习任务",
      chapterIds: pickedChapters,
      sectionIds,
      goals: goalsText
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean),
      requirement: requirement.trim(),
      dueAt: due ? new Date(due).getTime() : null,
      createdAt: Date.now(),
      closed: false,
    };
  }

  const activeTasks = [...board.tasks].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">预习导航</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              发布预习任务与学习目标，设置截止时间，一键生成导学单；学生在学生端标记完成并提出疑问。
            </p>
          </div>
          {board.tasks.length > 0 ? (
            <button
              onClick={() => {
                if (confirm("确定删除全部预习任务吗？")) resetAll();
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
            >
              清空全部任务
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">发布新任务</h2>

        <label className="block">
          <span className="text-xs text-slate-500">任务标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：第 2 章 正弦交流电路 课前预习"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </label>

        <div>
          <p className="text-xs text-slate-500">预习范围（勾选章节）</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {chapters.map((c) => {
              const on = pickedChapters.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleChapter(c.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    on
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${
                        on
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      第 {c.no} 章
                    </span>
                  </div>
                  <p className="mt-1 pl-6 text-[11px] leading-4 text-slate-500">
                    {c.title}
                  </p>
                </button>
              );
            })}
          </div>

          {sectionIds.length > 0 ? (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">
                已选 {sectionIds.length} 节（点 × 可去掉单节）
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allSectionIds.map((id) => {
                  const off = excluded.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() =>
                        setExcluded((prev) =>
                          prev.includes(id)
                            ? prev.filter((x) => x !== id)
                            : [...prev, id],
                        )
                      }
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition ${
                        off
                          ? "bg-white text-slate-400 line-through ring-1 ring-slate-200"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {id.replace(/^s/, "")}
                      <span className="text-blue-400">×</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <label className="block">
          <span className="text-xs text-slate-500">学习目标（一行一条）</span>
          <textarea
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            rows={4}
            placeholder={"理解正弦量的三要素\n掌握相量表示法\n能分析单一参数的正弦交流电路"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-xs text-slate-500">预习要求</span>
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            rows={3}
            placeholder="例如：先阅读教材对应章节，完成本节例题，把不理解的地方记下来带入课堂。"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-xs text-slate-500">截止时间（可留空）</span>
          <input
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="mt-1 w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={() => setGuide(buildGuide({ task: draftTask(), chapters, resources: resourceMap, questions }))}
            disabled={sectionIds.length === 0}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-40"
          >
            一键生成导学单
          </button>
          <button
            onClick={() => {
              mutate((b) => ({ ...b, tasks: [draftTask(), ...b.tasks] }));
              setTitle("");
              setPickedChapters([]);
              setExcluded([]);
              setGoalsText("");
              setRequirement("");
              setDue("");
              setGuide("");
            }}
            disabled={sectionIds.length === 0}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            发布任务
          </button>
          {sectionIds.length === 0 ? (
            <span className="text-xs text-amber-600">请先勾选预习章节</span>
          ) : null}
        </div>

        {guide ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600">导学单预览</p>
              <button
                onClick={() => navigator.clipboard?.writeText(guide)}
                className="text-xs text-blue-600 hover:underline"
              >
                复制全文
              </button>
            </div>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
              {guide}
            </pre>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          已发布任务（{activeTasks.length}）
        </h2>
        {activeTasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-400">
            还没有发布预习任务
          </p>
        ) : (
          activeTasks.map((task) => {
            const refs = sectionsOf(task, chapters);
            const progress = completionOf(board, task.id, task.sectionIds.length);
            const qs = board.questions.filter((q) => q.taskId === task.id);
            return (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      截止 {formatDue(task.dueAt)} · 共 {task.sectionIds.length} 节
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      完成 {progress.done}/{progress.total}
                    </span>
                    <button
                      onClick={() =>
                        mutate((b) => ({
                          ...b,
                          tasks: b.tasks.filter((t) => t.id !== task.id),
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${Math.round(progress.rate * 100)}%` }}
                  />
                </div>

                {task.goals.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {task.goals.map((g, i) => (
                      <li key={i} className="text-sm leading-6 text-slate-700">
                        {i + 1}. {g}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {refs.map((r) => (
                    <span
                      key={r.sectionId}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600"
                    >
                      {r.sectionId.replace(/^s/, "")} {r.sectionTitle}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-600">
                    学生预习疑问（{qs.length}）
                  </p>
                  {qs.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-400">暂无提问</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {qs.map((q) => (
                        <li key={q.id} className="text-sm leading-6 text-slate-700">
                          · {q.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

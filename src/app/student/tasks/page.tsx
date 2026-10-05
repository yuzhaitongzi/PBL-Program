"use client";

import Link from "next/link";
import { useState } from "react";
import { chapters } from "@/content/course";
import {
  completionOf,
  formatDue,
  remainingText,
  sectionsOf,
  useTaskBoard,
} from "@/lib/task";

export default function StudentTasksPage() {
  const { board, mutate } = useTaskBoard();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const tasks = [...board.tasks].sort((a, b) => {
    const ad = a.dueAt ?? Number.MAX_SAFE_INTEGER;
    const bd = b.dueAt ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });

  function toggleSection(taskId: string, sectionId: string) {
    mutate((b) => {
      const cur = b.completions[taskId] ?? [];
      const next = cur.includes(sectionId)
        ? cur.filter((x) => x !== sectionId)
        : [...cur, sectionId];
      return { ...b, completions: { ...b.completions, [taskId]: next } };
    });
  }

  function ask(taskId: string) {
    const text = (drafts[taskId] ?? "").trim();
    if (!text) return;
    mutate((b) => ({
      ...b,
      questions: [
        ...b.questions,
        {
          id: `q-${Date.now().toString(36)}`,
          taskId,
          text,
          at: Date.now(),
        },
      ],
    }));
    setDrafts((prev) => ({ ...prev, [taskId]: "" }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">预习导航</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          按老师发布的预习任务学习，标记完成进度；把不确定的问题记下来，
          老师会在课堂上集中解答。
        </p>
      </section>

      {tasks.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm text-slate-500">老师还没有发布预习任务。</p>
        </section>
      ) : (
        <section className="space-y-4">
          {tasks.map((task) => {
            const refs = sectionsOf(task, chapters);
            const done = board.completions[task.id] ?? [];
            const progress = completionOf(board, task.id, task.sectionIds.length);
            const myQuestions = board.questions.filter((q) => q.taskId === task.id);
            const overdue = task.dueAt !== null && task.dueAt < Date.now();

            return (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {task.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      截止 {formatDue(task.dueAt)} ·{" "}
                      <span className={overdue ? "text-red-600" : "text-slate-500"}>
                        {remainingText(task.dueAt)}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    完成 {progress.done} / {progress.total} 节
                  </span>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      progress.rate >= 1 ? "bg-emerald-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.round(progress.rate * 100)}%` }}
                  />
                </div>

                {task.goals.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500">学习目标</p>
                    <ul className="mt-1.5 space-y-1">
                      {task.goals.map((g, i) => (
                        <li key={i} className="text-sm leading-6 text-slate-700">
                          {i + 1}. {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {task.requirement ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">预习要求</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {task.requirement}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500">预习内容</p>
                  <ul className="mt-2 divide-y divide-slate-100 border-t border-slate-100">
                    {refs.map((r) => {
                      const isDone = done.includes(r.sectionId);
                      return (
                        <li
                          key={r.sectionId}
                          className="flex items-center gap-3 py-2.5"
                        >
                          <button
                            onClick={() => toggleSection(task.id, r.sectionId)}
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition ${
                              isDone
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent hover:border-blue-400"
                            }`}
                          >
                            ✓
                          </button>
                          <Link
                            href={`/student/chapter/${r.chapterId}#${r.sectionId}`}
                            className="flex-1 text-sm text-slate-800 hover:text-blue-700"
                          >
                            <span className="mr-2 text-xs text-slate-400">
                              {r.sectionId.replace(/^s/, "")}
                            </span>
                            {r.sectionTitle}
                          </Link>
                          <span className="shrink-0 text-xs text-slate-400">
                            第 {r.chapterNo} 章
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    预习疑问（{myQuestions.length}）
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={drafts[task.id] ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          ask(task.id);
                        }
                      }}
                      placeholder="把自己没弄懂的问题写下来"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => ask(task.id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      提交
                    </button>
                  </div>
                  {myQuestions.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {myQuestions.map((q) => (
                        <li
                          key={q.id}
                          className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span className="text-sm leading-6 text-slate-700">
                            {q.text}
                          </span>
                          <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                            {new Date(q.at).toLocaleString("zh-CN", {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

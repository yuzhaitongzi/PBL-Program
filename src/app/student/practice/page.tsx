"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/app-state";
import { QUESTION_TYPE_LABEL } from "@/content/questions";
import {
  generatePracticeIds,
  gradeItem,
  pointsMatchLoose,
  useHomeworkBoard,
} from "@/lib/homework";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function StudentPracticePage() {
  const { questions } = useAppState();
  const { board, mutate } = useHomeworkBoard();

  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});

  /** 从所有作业错题里提取需要补练的知识点 */
  const wrongPoints = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    board.submissions.forEach((s) => {
      const hw = board.homeworks.find((h) => h.id === s.homeworkId);
      if (!hw) return;
      s.results.forEach((r) => {
        const item = hw.items.find((i) => i.questionId === r.questionId);
        if (!item) return;
        item.points.forEach((p) => {
          const cur = map.get(p) ?? { correct: 0, total: 0 };
          cur.total += 1;
          if (r.correct) cur.correct += 1;
          map.set(p, cur);
        });
      });
    });
    return [...map.entries()]
      .map(([point, v]) => ({
        point,
        correct: v.correct,
        total: v.total,
        rate: v.total === 0 ? 0 : v.correct / v.total,
      }))
      .sort((a, b) => a.rate - b.rate);
  }, [board]);

  const homeworkQuestionIds = board.homeworks.flatMap((h) =>
    h.items.map((i) => i.questionId),
  );

  function practiceFor(point: string) {
    return board.practice.find((p) => p.point === point);
  }

  function createPractice(point: string) {
    const ids = generatePracticeIds(point, questions, homeworkQuestionIds, 3);
    if (ids.length === 0) return;
    mutate((b) => ({
      ...b,
      practice: [
        {
          id: `p-${Date.now().toString(36)}`,
          point,
          createdAt: Date.now(),
          questionIds: ids,
          answers: {},
          completedAt: null,
          score: null,
          total: ids.length,
        },
        ...b.practice,
      ],
    }));
  }

  function submitPractice(taskId: string, point: string) {
    const ans = answers[taskId] ?? {};
    const task = board.practice.find((p) => p.id === taskId);
    if (!task) return;
    const items = task.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));
    const score = items.filter(
      (q) =>
        (ans[q.id] ?? "").trim().toUpperCase() === q.answer.trim().toUpperCase(),
    ).length;
    mutate((b) => ({
      ...b,
      practice: b.practice.map((p) =>
        p.id === taskId
          ? { ...p, answers: ans, score, total: items.length, completedAt: Date.now() }
          : p,
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">个性化补练</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          系统从作业错题中提取薄弱知识点，自动匹配新的练习题。
          完成补练后会记录效果，用于观察该知识点的掌握变化。
        </p>
      </section>

      {wrongPoints.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm text-slate-500">
            还没有可用的错题数据。先完成一次课后作业，系统就能据此生成补练。
          </p>
          <Link
            href="/student/homework"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            去做作业
          </Link>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">作业错因分布</h2>
            <p className="mt-1 text-xs text-slate-500">
              按知识点统计作业正确率，正确率低的排在前面。
            </p>
            <div className="mt-4 space-y-2">
              {wrongPoints.map((row) => {
                const task = practiceFor(row.point);
                return (
                  <div
                    key={row.point}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <span className="flex-1 truncate text-sm text-slate-800">
                      {row.point}
                    </span>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          row.rate < 0.6
                            ? "bg-red-400"
                            : row.rate < 0.85
                              ? "bg-amber-400"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.round(row.rate * 100)}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-slate-500">
                      {row.correct}/{row.total}
                    </span>
                    {task ? (
                      <span className="w-24 shrink-0 text-right text-xs text-slate-400">
                        {task.completedAt === null ? "补练待完成" : "补练已完成"}
                      </span>
                    ) : (
                      <button
                        onClick={() => createPractice(row.point)}
                        className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        生成补练
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {board.practice.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">
                补练任务（{board.practice.length}）
              </h2>
              {[...board.practice]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((task) => {
                  const items = task.questionIds
                    .map((id) => questions.find((q) => q.id === id))
                    .filter((q): q is NonNullable<typeof q> => Boolean(q));
                  const done = task.completedAt !== null;
                  const before = wrongPoints.find((w) =>
                    pointsMatchLoose(w.point, task.point),
                  );
                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {task.point} · 补练
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {items.length} 题 ·{" "}
                            {new Date(task.createdAt).toLocaleString("zh-CN")}
                          </p>
                        </div>
                        {done ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                            完成 {task.score}/{task.total}
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                            待完成
                          </span>
                        )}
                      </div>

                      <div className="mt-4 space-y-3">
                        {items.map((q, idx) => {
                          const chosen = done
                            ? (task.answers[q.id] ?? "")
                            : (answers[task.id]?.[q.id] ?? "");
                          const isCorrect =
                            q.answer.trim().toUpperCase() ===
                            chosen.trim().toUpperCase();
                          return (
                            <div
                              key={q.id}
                              className={`rounded-xl border p-4 ${
                                done
                                  ? isCorrect
                                    ? "border-emerald-200 bg-emerald-50/40"
                                    : "border-red-200 bg-red-50/40"
                                  : "border-slate-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">
                                  第 {idx + 1} 题
                                </span>
                                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                                  {QUESTION_TYPE_LABEL[q.type]}
                                </span>
                                {done ? (
                                  <span
                                    className={`ml-auto text-[11px] ${
                                      isCorrect ? "text-emerald-700" : "text-red-600"
                                    }`}
                                  >
                                    {isCorrect ? "正确" : "错误"}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-800">
                                {q.stem}
                              </p>

                              {q.type === "single" ? (
                                <div className="mt-2 space-y-1.5">
                                  {(q.options ?? []).map((opt, i) => {
                                    const letter = LETTERS[i] ?? String(i + 1);
                                    const on = chosen === letter;
                                    const correct = done && q.answer === letter;
                                    return (
                                      <button
                                        key={i}
                                        disabled={done}
                                        onClick={() =>
                                          setAnswers((prev) => ({
                                            ...prev,
                                            [task.id]: {
                                              ...(prev[task.id] ?? {}),
                                              [q.id]: letter,
                                            },
                                          }))
                                        }
                                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                                          correct
                                            ? "border-emerald-400 bg-emerald-50"
                                            : done && on
                                              ? "border-red-300 bg-red-50"
                                              : on
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 text-slate-700 hover:border-slate-300"
                                        }`}
                                      >
                                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-300 text-xs text-slate-500">
                                          {letter}
                                        </span>
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="mt-2 flex gap-2">
                                  {["对", "错"].map((v) => {
                                    const on = chosen === v;
                                    const correct = done && q.answer === v;
                                    return (
                                      <button
                                        key={v}
                                        disabled={done}
                                        onClick={() =>
                                          setAnswers((prev) => ({
                                            ...prev,
                                            [task.id]: {
                                              ...(prev[task.id] ?? {}),
                                              [q.id]: v,
                                            },
                                          }))
                                        }
                                        className={`rounded-lg border px-5 py-1.5 text-sm transition ${
                                          correct
                                            ? "border-emerald-400 bg-emerald-50"
                                            : done && on
                                              ? "border-red-300 bg-red-50"
                                              : on
                                                ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                      >
                                        {v}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {done ? (
                                <div className="mt-2 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                                  <p className="text-xs text-slate-500">
                                    正确答案：
                                    <span className="font-medium text-slate-800">
                                      {q.answer}
                                    </span>
                                  </p>
                                  {q.explanation ? (
                                    <p className="mt-1 text-sm leading-6 text-slate-700">
                                      {q.explanation}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      {!done ? (
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => submitPractice(task.id, task.point)}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            提交补练
                          </button>
                          <span className="text-xs text-slate-500">
                            已答{" "}
                            {
                              Object.values(answers[task.id] ?? {}).filter(Boolean)
                                .length
                            }{" "}
                            / {items.length} 题
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-600">
                            效果追踪
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            该知识点作业正确率{" "}
                            {before ? `${Math.round(before.rate * 100)}%` : "—"}
                            ，补练正确率{" "}
                            <span className="font-medium text-slate-900">
                              {Math.round(
                                ((task.score ?? 0) / Math.max(1, task.total)) * 100,
                              )}
                              %
                            </span>
                            。
                            {before &&
                            (task.score ?? 0) / Math.max(1, task.total) >
                              before.rate
                              ? "补练后掌握度上升。"
                              : "建议继续巩固该知识点。"}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

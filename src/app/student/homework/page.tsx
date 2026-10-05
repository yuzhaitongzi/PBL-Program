"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/app-state";
import { QUESTION_TYPE_LABEL } from "@/content/questions";
import {
  ERROR_LABEL,
  gradeSubmission,
  masteryRateMap,
  useHomeworkBoard,
} from "@/lib/homework";
import { thresholdsFor } from "@/lib/push";
import { formatDue, remainingText } from "@/lib/task";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function StudentHomeworkPage() {
  const { diagnostics, pushRule, activeMajor } = useAppState();
  const { board, mutate } = useHomeworkBoard();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openWrong, setOpenWrong] = useState(true);

  const mastery = useMemo(
    () => masteryRateMap(diagnostics.flatMap((d) => d.items)),
    [diagnostics],
  );
  const basicThreshold = thresholdsFor(pushRule, activeMajor?.level ?? "B").basic;

  const homeworks = [...board.homeworks].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  const active = homeworks.find((h) => h.id === activeId) ?? null;
  const mySubmission = active
    ? board.submissions.find((s) => s.homeworkId === active.id)
    : undefined;

  const allWrong = board.submissions.flatMap((s) =>
    s.results
      .filter((r) => !r.correct)
      .map((r) => {
        const hw = board.homeworks.find((h) => h.id === s.homeworkId);
        const item = hw?.items.find((i) => i.questionId === r.questionId);
        return item ? { item, result: r, submittedAt: s.submittedAt } : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x)),
  );

  function submit() {
    if (!active) return;
    const sub = gradeSubmission({
      homework: active,
      student: "本机学生",
      answers,
      mastery,
      basicThreshold,
    });
    mutate((b) => ({ ...b, submissions: [sub, ...b.submissions] }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">作业辅导</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          在线完成作业并提交，客观题自动判分，系统会按知识点分析错因，
          并据此生成个性化补练。
        </p>
      </section>

      {homeworks.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm text-slate-500">老师还没有布置作业。</p>
        </section>
      ) : !active ? (
        <section className="space-y-4">
          {homeworks.map((hw) => {
            const sub = board.submissions.find((s) => s.homeworkId === hw.id);
            const overdue = hw.dueAt !== null && hw.dueAt < Date.now();
            return (
              <div
                key={hw.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {hw.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      截止 {formatDue(hw.dueAt)} ·{" "}
                      <span className={overdue ? "text-red-600" : "text-slate-500"}>
                        {remainingText(hw.dueAt)}
                      </span>{" "}
                      · {hw.items.length} 题
                    </p>
                  </div>
                  {sub ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                      已提交 {sub.score}/{sub.total}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveId(hw.id);
                        setAnswers({});
                      }}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      开始作答
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{active.title}</p>
              <p className="text-xs text-slate-500">
                共 {active.items.length} 题 · 截止 {formatDue(active.dueAt)}
              </p>
            </div>
            <button
              onClick={() => setActiveId(null)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300"
            >
              返回列表
            </button>
          </div>

          {active.items.map((item, idx) => {
            const result = mySubmission?.results.find(
              (r) => r.questionId === item.questionId,
            );
            const locked = Boolean(mySubmission);
            return (
              <div
                key={item.questionId}
                className={`rounded-2xl border p-6 ${
                  result
                    ? result.correct
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-red-200 bg-red-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">第 {idx + 1} 题</span>
                  <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                    {QUESTION_TYPE_LABEL[item.type]}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    难度 {item.difficulty}
                  </span>
                  {result ? (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${
                        result.correct
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.correct ? "正确" : "错误"}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-800">{item.stem}</p>

                {item.type === "single" ? (
                  <div className="mt-3 space-y-2">
                    {(item.options ?? []).map((opt, i) => {
                      const letter = LETTERS[i] ?? String(i + 1);
                      const chosen = (mySubmission
                        ? (mySubmission.answers[item.questionId] ?? "")
                        : answers[item.questionId]) === letter;
                      const isCorrect = item.answer === letter;
                      const highlight = locked && (chosen || isCorrect);
                      return (
                        <button
                          key={i}
                          disabled={locked}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [item.questionId]: letter,
                            }))
                          }
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                            locked
                              ? isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                                : chosen
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-slate-200 text-slate-600"
                              : chosen
                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                : "border-slate-200 text-slate-700 hover:border-slate-300"
                          } ${highlight ? "" : ""}`}
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                              locked && isCorrect
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : chosen
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {letter}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    {["对", "错"].map((v) => {
                      const chosen = (mySubmission
                        ? (mySubmission.answers[item.questionId] ?? "")
                        : answers[item.questionId]) === v;
                      const isCorrect = item.answer === v;
                      return (
                        <button
                          key={v}
                          disabled={locked}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [item.questionId]: v,
                            }))
                          }
                          className={`rounded-lg border px-6 py-2 text-sm transition ${
                            locked
                              ? isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                                : chosen
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-slate-200 text-slate-600"
                              : chosen
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

                {result && !result.correct && result.errorKind ? (
                  <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${ERROR_LABEL[result.errorKind].className}`}
                      >
                        错因：{ERROR_LABEL[result.errorKind].name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {ERROR_LABEL[result.errorKind].desc}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      我的答案 {result.userAnswer || "未作答"} · 正确答案{" "}
                      <span className="text-emerald-700">{item.answer}</span>
                    </p>
                    {item.explanation ? (
                      <p className="mt-1.5 text-sm leading-6 text-slate-700">
                        {item.explanation}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.points.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur">
            {mySubmission ? (
              <>
                <span className="text-sm text-slate-700">
                  已完成：{mySubmission.score}/{mySubmission.total}（
                  {Math.round(
                    (mySubmission.score / Math.max(1, mySubmission.total)) * 100,
                  )}
                  %）
                </span>
                <Link
                  href="/student/practice"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  去做个性化补练 →
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={submit}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  提交作业
                </button>
                <span className="text-xs text-slate-500">
                  已答{" "}
                  {active.items.filter((i) => answers[i.questionId]).length} /{" "}
                  {active.items.length} 题
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {allWrong.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              错题本（{allWrong.length} 题）
            </h2>
            <button
              onClick={() => setOpenWrong((v) => !v)}
              className="text-xs text-blue-600 hover:underline"
            >
              {openWrong ? "收起" : "展开"}
            </button>
          </div>
          {openWrong ? (
            <div className="mt-3 space-y-2">
              {allWrong.map(({ item, result, submittedAt }, i) => (
                <div
                  key={`${item.questionId}-${i}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                      {QUESTION_TYPE_LABEL[item.type]}
                    </span>
                    {result.errorKind ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${ERROR_LABEL[result.errorKind].className}`}
                      >
                        {ERROR_LABEL[result.errorKind].name}
                      </span>
                    ) : null}
                    <span className="ml-auto text-[11px] text-slate-400">
                      {new Date(submittedAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-800">
                    {item.stem}
                  </p>
                  {item.options && item.options.length > 0 ? (
                    <ul className="mt-1.5">
                      {item.options.map((opt, j) => (
                        <li key={j} className="text-sm leading-6 text-slate-600">
                          <span className="mr-1.5 text-slate-400">
                            {LETTERS[j] ?? j + 1}.
                          </span>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                    <span className="text-red-600">
                      我的答案：{result.userAnswer || "未作答"}
                    </span>
                    <span className="text-emerald-700">
                      正确答案：{item.answer}
                    </span>
                  </div>
                  {item.explanation ? (
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">
                      {item.explanation}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.points.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

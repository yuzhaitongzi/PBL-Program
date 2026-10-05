"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QUESTION_TYPE_LABEL } from "@/content/questions";
import {
  gradeQuestion,
  randomStudentName,
  useQuizSession,
  type QuizResponse,
} from "@/lib/quiz";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Phase = "join" | "answer" | "done";

export default function StudentQuizPage() {
  const { session, ready, mutate } = useQuizSession();

  const [phase, setPhase] = useState<Phase>("join");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setName((prev) => prev || randomStudentName());
  }, []);

  // 会话被清除时退回加入页
  useEffect(() => {
    if (ready && !session && phase !== "done") setPhase("join");
  }, [ready, session, phase]);

  if (!session) {
    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <Link href="/student" className="text-xs text-blue-600 hover:underline">
            ← 返回课程地图
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">课堂快测</h1>
        </section>
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm text-slate-500">老师还没有发起快测，请稍候。</p>
        </section>
      </div>
    );
  }

  function join() {
    if (!session) return;
    if (code.trim() !== session.code) {
      setError("课堂码不正确，请核对大屏上的六位数字。");
      return;
    }
    if (session.status !== "open") {
      setError("本次快测已结束。");
      return;
    }
    setError("");
    setPhase("answer");
  }

  function submit() {
    if (!session) return;
    const score = session.questions.filter((q) =>
      gradeQuestion(q, answers[q.questionId] ?? ""),
    ).length;
    const response: QuizResponse = {
      id: `r-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      student: name.trim() || "匿名同学",
      answers,
      submittedAt: Date.now(),
      score,
      total: session.questions.length,
    };
    mutate((s) => ({ ...s, responses: [...s.responses, response] }));
    setResult(response);
    setPhase("done");
  }

  const answered = Object.values(answers).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">课堂快测</h1>
        <p className="mt-1 text-sm text-slate-600">
          {session.title} · 共 {session.questions.length} 题
        </p>
      </section>

      {phase === "join" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          {session.status !== "open" ? (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
              本次快测已结束。
            </p>
          ) : null}
          <label className="block">
            <span className="text-sm font-medium text-slate-900">课堂码</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="输入大屏上的六位数字"
              className="mt-2 w-56 rounded-lg border border-slate-200 px-4 py-3 font-mono text-2xl tracking-[0.2em] outline-none focus:border-blue-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-900">你的标识</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="姓名或学号"
              className="mt-2 w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </label>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button
            onClick={join}
            disabled={session.status !== "open"}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            进入答题
          </button>
        </section>
      ) : null}

      {phase === "answer" ? (
        <section className="space-y-4">
          <div className="sticky top-14 z-30 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
            <p className="text-sm text-slate-600">
              已答 <span className="font-medium text-slate-900">{answered}</span> /{" "}
              {session.questions.length} 题
            </p>
            <button
              onClick={submit}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              提交答卷
            </button>
          </div>

          {session.questions.map((q, idx) => (
            <div
              key={q.questionId}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">第 {idx + 1} 题</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                  {QUESTION_TYPE_LABEL[q.type]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-800">{q.stem}</p>

              {(q.images ?? []).length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(q.images ?? []).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`配图 ${i + 1}`}
                      className="max-h-48 rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              ) : null}

              {q.type === "single" ? (
                <div className="mt-3 space-y-2">
                  {(q.options ?? []).map((opt, i) => {
                    const letter = LETTERS[i] ?? String(i + 1);
                    const on = answers[q.questionId] === letter;
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.questionId]: letter }))
                        }
                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          on
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                            on
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
                    const on = answers[q.questionId] === v;
                    return (
                      <button
                        key={v}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.questionId]: v }))
                        }
                        className={`rounded-lg border px-6 py-2 text-sm transition ${
                          on
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
            </div>
          ))}

          <button
            onClick={submit}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            提交答卷
          </button>
        </section>
      ) : null}

      {phase === "done" && result ? (
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs text-slate-400">已提交</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {result.score}
              <span className="text-base font-normal text-slate-400">
                {" "}
                / {result.total}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {result.student} · 正确率{" "}
              {Math.round((result.score / Math.max(1, result.total)) * 100)}%
            </p>
            <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
              答卷已提交，结果已实时同步到教师大屏。
            </p>
          </div>

          <div className="space-y-3">
            {session.questions.map((q, idx) => {
              const mine = result.answers[q.questionId] ?? "";
              const ok = gradeQuestion(q, mine);
              return (
                <div
                  key={q.questionId}
                  className={`rounded-2xl border p-5 ${
                    ok
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">第 {idx + 1} 题</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        ok
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ok ? "正确" : "错误"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{q.stem}</p>
                  {q.options && q.options.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt, i) => (
                        <li key={i} className="text-sm leading-6 text-slate-600">
                          <span className="mr-1.5 text-slate-400">
                            {LETTERS[i] ?? i + 1}.
                          </span>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className="text-slate-600">我的答案：{mine || "未作答"}</span>
                    <span className="text-emerald-700">正确答案：{q.answer}</span>
                  </div>
                  {q.explanation ? (
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {q.explanation}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapters } from "@/content/course";
import { QUESTION_TYPE_LABEL, type Question } from "@/content/questions";
import {
  buildItems,
  isAutoGradable,
  masteryByChapter,
  masteryByPoint,
  masteryLevel,
  pickDiagnosticQuestions,
  type DiagnosticRecord,
} from "@/lib/diagnostic";

type Phase = "setup" | "quiz" | "result";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const COUNT_OPTIONS = [5, 10, 15, 20];

export default function DiagnosticPage() {
  const { questions, visibleChapterIds, activeMajor, saveDiagnostic } = useAppState();

  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    () => visibleChapterIds,
  );
  const [count, setCount] = useState(10);
  const [paper, setPaper] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);

  const available = questions.filter(
    (q) => isAutoGradable(q) && selectedChapters.includes(q.chapterId),
  ).length;

  function toggleChapter(id: string) {
    setSelectedChapters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function start() {
    const picked = pickDiagnosticQuestions(questions, selectedChapters, count);
    setPaper(picked);
    setAnswers({});
    setRecord(null);
    setPhase("quiz");
  }

  function submit() {
    const items = buildItems(paper, answers);
    const rec: DiagnosticRecord = {
      id: `d-${Date.now().toString(36)}`,
      at: Date.now(),
      majorId: activeMajor?.id ?? "",
      majorName: activeMajor?.name ?? "未指定专业",
      chapterIds: selectedChapters,
      items,
      score: items.filter((i) => i.correct).length,
      total: items.length,
    };
    saveDiagnostic(rec);
    setRecord(rec);
    setPhase("result");
  }

  const answered = Object.values(answers).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">基础诊断测评</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          选择范围后系统自动组卷。提交后立即判分，并给出各知识点的掌握情况，
          作为预习导学与分层资源推送的依据。
        </p>
      </section>

      {phase === "setup" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">测评范围</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChapters(visibleChapterIds)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  按当前专业（{activeMajor?.name}）
                </button>
                <button
                  onClick={() => setSelectedChapters(chapters.map((c) => c.id))}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  全部章节
                </button>
                <button
                  onClick={() => setSelectedChapters([])}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-300"
                >
                  清空
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {chapters.map((c) => {
                const on = selectedChapters.includes(c.id);
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
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-900">题量</span>
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`rounded-lg border px-4 py-1.5 text-sm transition ${
                  count === n
                    ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {n} 题
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500">
              当前范围可用客观题 {available} 题
            </span>
          </div>

          <p className="text-xs text-slate-400">
            诊断测评只抽取单选题与判断题（可自动判分）。计算题在作业与考试环节使用。
          </p>

          <button
            onClick={start}
            disabled={available === 0}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            开始测评
          </button>
          {available === 0 ? (
            <p className="text-xs text-amber-600">
              所选范围暂无可用题目，请更换范围。
            </p>
          ) : null}
        </section>
      ) : null}

      {phase === "quiz" ? (
        <section className="space-y-4">
          <div className="sticky top-14 z-30 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
            <p className="text-sm text-slate-600">
              共 {paper.length} 题 · 已答{" "}
              <span className="font-medium text-slate-900">{answered}</span> 题
            </p>
            <button
              onClick={submit}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              提交并查看结果
            </button>
          </div>

          {paper.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">第 {idx + 1} 题</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                  {QUESTION_TYPE_LABEL[q.type]}
                </span>
                <span className="text-[10px] text-slate-400">
                  {q.sectionId.replace(/^s/, "")}
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
                    const on = answers[q.id] === letter;
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: letter }))
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
                    const on = answers[q.id] === v;
                    return (
                      <button
                        key={v}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: v }))
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
            提交并查看结果
          </button>
        </section>
      ) : null}

      {phase === "result" && record ? (
        <ResultView
          record={record}
          questions={questions}
          onRestart={() => setPhase("setup")}
        />
      ) : null}
    </div>
  );
}

function Bar({ row }: { row: { label: string; correct: number; total: number; rate: number } }) {
  const level = masteryLevel(row.rate);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-800">{row.label}</span>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          {row.correct}/{row.total}
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${level.className}`}>
            {level.label}
          </span>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${level.bar}`}
          style={{ width: `${Math.round(row.rate * 100)}%` }}
        />
      </div>
    </div>
  );
}

function ResultView({
  record,
  questions,
  onRestart,
}: {
  record: DiagnosticRecord;
  questions: Question[];
  onRestart: () => void;
}) {
  const [showWrong, setShowWrong] = useState(true);
  const rate = record.total === 0 ? 0 : record.score / record.total;
  const byPoint = masteryByPoint(record.items);
  const byChapter = masteryByChapter(
    record.items,
    (id) => `第 ${chapters.find((c) => c.id === id)?.no ?? "?"} 章`,
  );
  const wrong = record.items.filter((i) => !i.correct);
  const weak = byPoint.filter((p) => p.rate < 0.6);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">测评结果</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {record.score}
              <span className="text-base font-normal text-slate-400">
                {" "}
                / {record.total}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              正确率 {Math.round(rate * 100)}% · {record.majorName} ·{" "}
              {new Date(record.at).toLocaleString("zh-CN")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              重新测评
            </button>
            <Link
              href="/student/profile"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
            >
              我的学习状况
            </Link>
          </div>
        </div>
        {weak.length > 0 ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">
            薄弱知识点：{weak.map((w) => w.label).join("、")}
          </p>
        ) : (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            各知识点掌握情况均为基本掌握以上。
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">知识点掌握情况</h2>
        <p className="mt-1 text-xs text-slate-500">掌握度由低到高排列，优先补强靠前的项。</p>
        <div className="mt-4 space-y-2">
          {byPoint.map((row) => (
            <Bar key={row.key} row={row} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">章节掌握情况</h2>
        <div className="mt-4 space-y-2">
          {byChapter.map((row) => (
            <Bar key={row.key} row={row} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            错题回顾（{wrong.length} 题）
          </h2>
          {wrong.length > 0 ? (
            <button
              onClick={() => setShowWrong((v) => !v)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showWrong ? "收起" : "展开"}
            </button>
          ) : null}
        </div>
        {wrong.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">本次测评没有错题。</p>
        ) : showWrong ? (
          <div className="mt-4 space-y-3">
            {wrong.map((item) => {
              const q = questions.find((x) => x.id === item.questionId);
              return (
                <div
                  key={item.questionId}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm leading-6 text-slate-800">{item.stem}</p>
                  {q?.options && q.options.length > 0 ? (
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
                    <span className="text-red-600">
                      我的答案：{item.userAnswer || "未作答"}
                    </span>
                    <span className="text-emerald-700">
                      正确答案：{item.correctAnswer}
                    </span>
                  </div>
                  {q?.explanation ? (
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {q.explanation}
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
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

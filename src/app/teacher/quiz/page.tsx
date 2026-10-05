"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapters } from "@/content/course";
import { QUESTION_TYPE_LABEL } from "@/content/questions";
import {
  buildQuizQuestions,
  generateCode,
  gradeQuestion,
  optionDistribution,
  questionAccuracy,
  randomResponse,
  useQuizSession,
  type QuizQuestion,
} from "@/lib/quiz";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const COUNT_OPTIONS = [5, 10, 15, 20];

export default function TeacherQuizPage() {
  const { questions, visibleChapterIds, activeMajor } = useAppState();
  const { session, mutate, start, stop, reset } = useQuizSession();

  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    () => visibleChapterIds,
  );
  const [count, setCount] = useState(10);
  const [title, setTitle] = useState("");
  const [origin, setOrigin] = useState("");
  const [projecting, setProjecting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const available = questions.filter(
    (q) =>
      (q.type === "single" || q.type === "judge") &&
      selectedChapters.includes(q.chapterId),
  ).length;

  function toggleChapter(id: string) {
    setSelectedChapters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function launch() {
    const picked = buildQuizQuestions(questions, selectedChapters, count);
    if (picked.length === 0) return;
    start({
      code: generateCode(),
      createdAt: Date.now(),
      title:
        title.trim() ||
        `第 ${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日课堂快测`,
      chapterIds: selectedChapters,
      questions: picked,
      status: "open",
      responses: [],
    });
    setCurrent(0);
  }

  const open = session?.status === "open";
  const submitted = session?.responses.length ?? 0;
  const avgRate =
    !session || session.responses.length === 0
      ? 0
      : session.responses.reduce(
          (sum, r) => sum + r.score / Math.max(1, r.total),
          0,
        ) / session.responses.length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">课堂快测</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              一键发起，学生扫码或输入课堂码作答，大屏实时显示作答人数、正确率与选项分布。
            </p>
          </div>
          {session ? (
            <button
              onClick={() => {
                if (confirm("确定清除当前快测会话吗？")) {
                  reset();
                  setProjecting(false);
                }
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
            >
              清除会话
            </button>
          ) : null}
        </div>
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
          当前为学生端与教师端在同一浏览器标签页之间实时同步，可用来演示完整流程。
          真实课堂（多台设备）需接入服务器与 WebSocket，替换的只是数据同步层。
        </p>
      </section>

      {!open ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          {session && session.status === "closed" ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              上一次快测「{session.title}」已结束，共 {session.responses.length} 人作答，
              平均正确率{" "}
              {Math.round(
                (session.responses.reduce(
                  (s, r) => s + r.score / Math.max(1, r.total),
                  0,
                ) /
                  Math.max(1, session.responses.length)) *
                  100,
              )}
              %。
            </div>
          ) : null}

          <div>
            <p className="text-sm font-medium text-slate-900">快测范围</p>
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
            <div className="mt-2 flex gap-2">
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
              可用客观题 {available} 题
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">标题</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="留空则按日期自动命名"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={launch}
            disabled={available === 0}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            发起快测
          </button>
        </section>
      ) : null}

      {open && session ? (
        <>
          <section className="rounded-2xl border-2 border-blue-500 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs text-slate-500">课堂码</p>
                <p className="mt-1 font-mono text-5xl font-semibold tracking-[0.2em] text-blue-700">
                  {session.code}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  学生入口：{origin ? `${origin}/student/quiz` : "/student/quiz"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const url = origin ? `${origin}/student/quiz` : "/student/quiz";
                    navigator.clipboard?.writeText(`${url}\n课堂码：${session.code}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {copied ? "已复制" : "复制学生入口"}
                </button>
                <button
                  onClick={() => setProjecting(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  投屏讲评
                </button>
                <button
                  onClick={() => mutate((s) => ({ ...s, responses: [...s.responses, randomResponse(s)] }))}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  模拟一人作答
                </button>
                <button
                  onClick={stop}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  结束快测
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "已提交人数", value: `${submitted} 人` },
              { label: "平均正确率", value: `${Math.round(avgRate * 100)}%` },
              { label: "题量", value: `${session.questions.length} 题` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{s.value}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            {session.questions.map((q, idx) => (
              <QuestionPanel
                key={q.questionId}
                index={idx}
                question={q}
                dist={optionDistribution(session, q)}
                acc={questionAccuracy(session, q)}
              />
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">
              提交名单（{submitted}）
            </h2>
            {submitted === 0 ? (
              <p className="mt-3 text-sm text-slate-500">还没有学生提交。</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {[...session.responses]
                  .sort((a, b) => b.submittedAt - a.submittedAt)
                  .map((r) => (
                    <li key={r.id} className="flex items-center gap-4 py-2.5">
                      <span className="text-sm text-slate-800">{r.student}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(r.submittedAt).toLocaleTimeString("zh-CN")}
                      </span>
                      <span className="ml-auto text-sm text-slate-700">
                        {r.score}/{r.total}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {projecting ? (
            <ProjectionView
              session={session}
              index={current}
              onIndex={setCurrent}
              onClose={() => setProjecting(false)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function QuestionPanel({
  index,
  question,
  dist,
  acc,
}: {
  index: number;
  question: QuizQuestion;
  dist: { label: string; count: number }[];
  acc: { correct: number; total: number; rate: number };
}) {
  const max = Math.max(1, ...dist.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">第 {index + 1} 题</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
          {QUESTION_TYPE_LABEL[question.type]}
        </span>
        <span className="text-[10px] text-slate-400">
          {question.sectionId.replace(/^s/, "")}
        </span>
        <span className="ml-auto text-xs text-slate-500">
          正确率 {Math.round(acc.rate * 100)}%（{acc.correct}/{acc.total}）
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-800">{question.stem}</p>

      {(question.images ?? []).length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {(question.images ?? []).map((src, i) => (
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

      <div className="mt-3 space-y-2">
        {dist.map((d, i) => {
          const label =
            question.type === "judge" ? d.label : LETTERS[i] ?? String(i + 1);
          const text =
            question.type === "judge" ? "" : (question.options ?? [])[i] ?? "";
          const isAnswer = d.label === question.answer;
          return (
            <div key={d.label} className="flex items-center gap-3">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                  isAnswer
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 text-slate-500"
                }`}
              >
                {label}
              </span>
              <span className="w-40 shrink-0 truncate text-sm text-slate-700">
                {text}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    isAnswer ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-xs text-slate-500">
                {d.count} 人
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectionView({
  session,
  index,
  onIndex,
  onClose,
}: {
  session: ReturnType<typeof useQuizSession>["session"];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  if (!session) return null;
  const question = session.questions[index];
  if (!question) return null;
  const dist = optionDistribution(session, question);
  const acc = questionAccuracy(session, question);
  const max = Math.max(1, ...dist.map((d) => d.count));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {session.title} · 第 {index + 1} / {session.questions.length} 题
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
            >
              上一题
            </button>
            <button
              onClick={() => onIndex(Math.min(session.questions.length - 1, index + 1))}
              disabled={index >= session.questions.length - 1}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
            >
              下一题
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              退出投屏
            </button>
          </div>
        </div>

        <p className="mt-8 text-3xl font-medium leading-relaxed text-slate-900">
          {question.stem}
        </p>

        {(question.images ?? []).length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {(question.images ?? []).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`配图 ${i + 1}`}
                className="max-h-72 rounded-xl border border-slate-200"
              />
            ))}
          </div>
        ) : null}

        <div className="mt-10 space-y-4">
          {dist.map((d, i) => {
            const label =
              question.type === "judge" ? d.label : LETTERS[i] ?? String(i + 1);
            const text =
              question.type === "judge" ? "" : (question.options ?? [])[i] ?? "";
            const isAnswer = d.label === question.answer;
            return (
              <div key={d.label} className="flex items-center gap-4">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-base ${
                    isAnswer
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  {label}
                </span>
                <span className="w-64 shrink-0 text-lg text-slate-800">{text}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      isAnswer ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-base text-slate-600">
                  {d.count} 人
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center gap-6 text-lg">
          <span className="text-slate-600">
            正确率{" "}
            <span className="font-semibold text-slate-900">
              {Math.round(acc.rate * 100)}%
            </span>
          </span>
          <span className="text-slate-600">
            已提交 <span className="font-semibold text-slate-900">{acc.total}</span> 人
          </span>
          <span className="text-emerald-700">
            正确答案：{question.answer}
          </span>
        </div>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {question.explanation}
        </p>
      </div>
    </div>
  );
}

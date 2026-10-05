"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapters } from "@/content/course";
import { QUESTION_TYPE_LABEL } from "@/content/questions";
import {
  buildHomeworkItems,
  ERROR_LABEL,
  gradeItem,
  useHomeworkBoard,
  type ErrorKind,
} from "@/lib/homework";
import { formatDue } from "@/lib/task";

const COUNT_OPTIONS = [5, 10, 15, 20];
const ERROR_KINDS: ErrorKind[] = ["knowledge", "method", "careless"];

export default function TeacherHomeworkPage() {
  const { questions, visibleChapterIds, activeMajor } = useAppState();
  const { board, mutate, resetAll } = useHomeworkBoard();

  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>(() => visibleChapterIds);
  const [count, setCount] = useState(10);
  const [due, setDue] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const available = questions.filter(
    (q) =>
      (q.type === "single" || q.type === "judge") && picked.includes(q.chapterId),
  ).length;

  const homeworks = [...board.homeworks].sort((a, b) => b.createdAt - a.createdAt);

  const stats = useMemo(() => {
    const map = new Map<
      string,
      {
        submissions: number;
        avg: number;
        errors: Record<ErrorKind, number>;
        perQuestion: { questionId: string; correct: number; total: number }[];
      }
    >();
    for (const hw of board.homeworks) {
      const subs = board.submissions.filter((s) => s.homeworkId === hw.id);
      const errors: Record<ErrorKind, number> = {
        knowledge: 0,
        method: 0,
        careless: 0,
      };
      subs.forEach((s) =>
        s.results.forEach((r) => {
          if (r.errorKind) errors[r.errorKind] += 1;
        }),
      );
      const perQuestion = hw.items.map((item) => ({
        questionId: item.questionId,
        correct: subs.filter(
          (s) => s.results.find((r) => r.questionId === item.questionId)?.correct,
        ).length,
        total: subs.length,
      }));
      map.set(hw.id, {
        submissions: subs.length,
        avg:
          subs.length === 0
            ? 0
            : subs.reduce((a, s) => a + s.score / Math.max(1, s.total), 0) /
              subs.length,
        errors,
        perQuestion,
      });
    }
    return map;
  }, [board]);

  function toggleChapter(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">作业辅导</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              布置作业后学生在线作答，客观题自动判分，系统按知识点归因错因，
              并据此生成个性化补练。
            </p>
          </div>
          {board.homeworks.length > 0 ? (
            <button
              onClick={() => {
                if (confirm("确定删除全部作业与提交记录吗？")) resetAll();
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
            >
              清空全部
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">布置作业</h2>
        <label className="block">
          <span className="text-xs text-slate-500">作业标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：第 1 章 直流电路分析 课后作业"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </label>

        <div>
          <p className="text-xs text-slate-500">作业范围</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {chapters.map((c) => {
              const on = picked.includes(c.id);
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPicked(visibleChapterIds)}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
            >
              按当前专业（{activeMajor?.name}）
            </button>
            <button
              onClick={() => setPicked(chapters.map((c) => c.id))}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
            >
              全部章节
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

        <label className="block">
          <span className="text-xs text-slate-500">截止时间（可留空）</span>
          <input
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="mt-1 w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </label>

        <button
          onClick={() => {
            const items = buildHomeworkItems(questions, picked, count);
            if (items.length === 0) return;
            mutate((b) => ({
              ...b,
              homeworks: [
                {
                  id: `hw-${Date.now().toString(36)}`,
                  title:
                    title.trim() ||
                    `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日课后作业`,
                  chapterIds: picked,
                  items,
                  dueAt: due ? new Date(due).getTime() : null,
                  createdAt: Date.now(),
                  closed: false,
                },
                ...b.homeworks,
              ],
            }));
            setTitle("");
            setDue("");
          }}
          disabled={available === 0}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          发布作业
        </button>
        {available === 0 ? (
          <p className="text-xs text-amber-600">所选范围暂无可用题目</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          已布置作业（{homeworks.length}）
        </h2>
        {homeworks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-400">
            还没有布置作业
          </p>
        ) : (
          homeworks.map((hw) => {
            const s = stats.get(hw.id);
            const subs = board.submissions.filter((x) => x.homeworkId === hw.id);
            const totalErr = s
              ? ERROR_KINDS.reduce((a, k) => a + s.errors[k], 0)
              : 0;
            return (
              <div
                key={hw.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {hw.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      截止 {formatDue(hw.dueAt)} · {hw.items.length} 题 · 提交{" "}
                      {s?.submissions ?? 0} 份
                      {s && s.submissions > 0
                        ? ` · 平均正确率 ${Math.round(s.avg * 100)}%`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpanded(expanded === hw.id ? null : hw.id)
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      {expanded === hw.id ? "收起明细" : "查看明细"}
                    </button>
                    <button
                      onClick={() =>
                        mutate((b) => ({
                          ...b,
                          homeworks: b.homeworks.filter((x) => x.id !== hw.id),
                          submissions: b.submissions.filter(
                            (x) => x.homeworkId !== hw.id,
                          ),
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">错因合计</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {totalErr}
                    </p>
                  </div>
                  {ERROR_KINDS.map((k) => (
                    <div key={k} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">
                        {ERROR_LABEL[k].name}错误
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {s?.errors[k] ?? 0}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                        {ERROR_LABEL[k].desc}
                      </p>
                    </div>
                  ))}
                </div>

                {expanded === hw.id ? (
                  <div className="mt-4 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs text-slate-500">
                            <th className="py-2 pr-4 font-medium">题号</th>
                            <th className="py-2 pr-4 font-medium">题型</th>
                            <th className="py-2 pr-4 font-medium">正确率</th>
                            <th className="py-2 font-medium">知识点</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {hw.items.map((item, idx) => {
                            const q = s?.perQuestion.find(
                              (x) => x.questionId === item.questionId,
                            );
                            return (
                              <tr key={item.questionId}>
                                <td className="py-2.5 pr-4 text-slate-500">
                                  第 {idx + 1} 题
                                </td>
                                <td className="py-2.5 pr-4 text-slate-600">
                                  {QUESTION_TYPE_LABEL[item.type]}
                                </td>
                                <td className="py-2.5 pr-4 text-slate-700">
                                  {q && q.total > 0
                                    ? `${Math.round((q.correct / q.total) * 100)}%（${q.correct}/${q.total}）`
                                    : "—"}
                                </td>
                                <td className="py-2.5 text-slate-600">
                                  {item.points.join("、")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        学生提交（{subs.length}）
                      </p>
                      {subs.length === 0 ? (
                        <p className="mt-1 text-xs text-slate-400">暂无提交</p>
                      ) : (
                        <ul className="mt-2 divide-y divide-slate-100">
                          {subs.map((sub) => {
                            const wrong = sub.results.filter((r) => !r.correct);
                            return (
                              <li key={sub.id} className="py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-800">
                                    {sub.student}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {new Date(sub.submittedAt).toLocaleString("zh-CN")}
                                  </span>
                                  <span className="ml-auto text-sm text-slate-700">
                                    {sub.score}/{sub.total}
                                  </span>
                                </div>
                                {wrong.length > 0 ? (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {wrong.map((r) => {
                                      const item = hw.items.find(
                                        (x) => x.questionId === r.questionId,
                                      );
                                      if (!r.errorKind) return null;
                                      return (
                                        <span
                                          key={r.questionId}
                                          className={`rounded-full px-2 py-0.5 text-[11px] ${ERROR_LABEL[r.errorKind].className}`}
                                          title={item?.stem}
                                        >
                                          {item?.points[0] ?? "—"} ·{" "}
                                          {ERROR_LABEL[r.errorKind].name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">个性化补练情况</h2>
        {board.practice.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            暂无补练记录。学生在学生端提交作业后，系统会按错题知识点自动生成补练任务。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {[...board.practice]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-sm text-slate-800">{p.point}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(p.createdAt).toLocaleString("zh-CN")}
                  </span>
                  <span className="ml-auto text-xs text-slate-500">
                    {p.completedAt === null
                      ? "未完成"
                      : `${p.score}/${p.total}（${Math.round(((p.score ?? 0) / Math.max(1, p.total)) * 100)}%）`}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

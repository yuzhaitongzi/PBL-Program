"use client";

import Link from "next/link";
import { useAppState } from "@/components/app-state";
import { chapters } from "@/content/course";
import { masteryByChapter, masteryByPoint, masteryLevel } from "@/lib/diagnostic";

export default function ProfilePage() {
  const { diagnostics, completedSections, activeMajor, clearDiagnostics } =
    useAppState();

  const allItems = diagnostics.flatMap((d) => d.items);
  const byPoint = masteryByPoint(allItems);
  const byChapter = masteryByChapter(
    allItems,
    (id) => `第 ${chapters.find((c) => c.id === id)?.no ?? "?"} 章`,
  );
  const latest = diagnostics[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">我的学习状况</h1>
        <p className="mt-1 text-sm text-slate-600">
          汇总历次诊断测评的结果，反映各知识点的累积掌握情况。当前专业：
          {activeMajor?.name}。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "测评次数", value: diagnostics.length },
          {
            label: "最近正确率",
            value: latest
              ? `${Math.round((latest.score / Math.max(1, latest.total)) * 100)}%`
              : "—",
          },
          { label: "已标记完成的节数", value: completedSections.length },
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

      {diagnostics.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <p className="text-sm text-slate-500">
            还没有测评记录，先做一次基础诊断测评吧。
          </p>
          <Link
            href="/student/diagnostic"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            开始基础诊断
          </Link>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">知识点累积掌握情况</h2>
            <p className="mt-1 text-xs text-slate-500">按掌握度由低到高排列。</p>
            <div className="mt-4 space-y-2">
              {byPoint.map((row) => {
                const level = masteryLevel(row.rate);
                return (
                  <div key={row.key} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-800">{row.label}</span>
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        {row.correct}/{row.total}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${level.className}`}
                        >
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
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">章节累积掌握情况</h2>
            <div className="mt-4 space-y-2">
              {byChapter.map((row) => {
                const level = masteryLevel(row.rate);
                return (
                  <div
                    key={row.key}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <span className="w-16 shrink-0 text-sm text-slate-800">
                      {row.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${level.bar}`}
                        style={{ width: `${Math.round(row.rate * 100)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">
                      {row.correct}/{row.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">测评记录</h2>
              <button
                onClick={() => {
                  if (confirm("确定清空全部测评记录吗？")) clearDiagnostics();
                }}
                className="text-xs text-slate-400 transition hover:text-red-600"
              >
                清空记录
              </button>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {diagnostics.map((d) => (
                <li key={d.id} className="flex items-center gap-4 py-3">
                  <span className="text-xs text-slate-400">
                    {new Date(d.at).toLocaleString("zh-CN")}
                  </span>
                  <span className="text-xs text-slate-500">{d.majorName}</span>
                  <span className="text-xs text-slate-500">{d.chapterIds.length} 章</span>
                  <span className="ml-auto text-sm font-medium text-slate-800">
                    {d.score}/{d.total}
                  </span>
                  <span className="w-12 text-right text-xs text-slate-500">
                    {Math.round((d.score / Math.max(1, d.total)) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAppState } from "@/components/app-state";
import { chapters } from "@/content/course";
import { masteryByPoint, masteryLevel } from "@/lib/diagnostic";

export default function TeacherDiagnosticsPage() {
  const { diagnostics, clearDiagnostics } = useAppState();

  const allItems = diagnostics.flatMap((d) => d.items);
  const byPoint = masteryByPoint(allItems);
  const weak = byPoint.filter((p) => p.rate < 0.6);
  const avgRate =
    allItems.length === 0
      ? 0
      : allItems.filter((i) => i.correct).length / allItems.length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">诊断结果与学情</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              汇总诊断测评记录，定位薄弱知识点，作为预习导学与分层资源推送的依据。
            </p>
          </div>
          {diagnostics.length > 0 ? (
            <button
              onClick={() => {
                if (confirm("确定清空全部诊断记录吗？")) clearDiagnostics();
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
            >
              清空记录
            </button>
          ) : null}
        </div>
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
          当前数据保存在本机浏览器中，因此这里的口径是「本机产生的测评记录」。接入数据库与统一身份后，同一视图即可切换为全班数据。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "测评记录数", value: diagnostics.length },
          { label: "合计题次", value: allItems.length },
          {
            label: "平均正确率",
            value: allItems.length === 0 ? "—" : `${Math.round(avgRate * 100)}%`,
          },
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
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
          暂无诊断记录。请先以学生视角完成一次基础诊断测评。
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">薄弱知识点排行</h2>
            <p className="mt-1 text-xs text-slate-500">
              按掌握度由低到高排列，可直接用于即时干预与个性化补练。
              低于 60% 的知识点共 {weak.length} 个。
            </p>
            <div className="mt-4 space-y-2">
              {byPoint.slice(0, 20).map((row) => {
                const level = masteryLevel(row.rate);
                return (
                  <div
                    key={row.key}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <span className="flex-1 truncate text-sm text-slate-800">
                      {row.label}
                    </span>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${level.bar}`}
                        style={{ width: `${Math.round(row.rate * 100)}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-slate-500">
                      {row.correct}/{row.total}
                    </span>
                    <span
                      className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] ${level.className}`}
                    >
                      {level.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">测评记录</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">时间</th>
                    <th className="py-2 pr-4 font-medium">专业</th>
                    <th className="py-2 pr-4 font-medium">范围</th>
                    <th className="py-2 pr-4 font-medium">得分</th>
                    <th className="py-2 font-medium">正确率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diagnostics.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2.5 pr-4 text-slate-500">
                        {new Date(d.at).toLocaleString("zh-CN")}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700">{d.majorName}</td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {d.chapterIds
                          .map((cid) => chapters.find((c) => c.id === cid)?.no)
                          .filter(Boolean)
                          .join("、")}{" "}
                        章
                      </td>
                      <td className="py-2.5 pr-4 text-slate-800">
                        {d.score}/{d.total}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {Math.round((d.score / Math.max(1, d.total)) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

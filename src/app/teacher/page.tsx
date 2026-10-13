"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapterById, chapters, moduleSections, modules } from "@/content/course";

export default function TeacherPage() {
  const {
    majors,
    addMajor,
    removeMajor,
    updateMajor,
    toggleChapter,
    applyChapterRange,
    resetMajors,
  } = useAppState();

  const [newName, setNewName] = useState("");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-blue-600">教师端</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              专业变体与学情监管
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              为每个专业勾选可见的章节目录。不同专业要求不同：机电类可覆盖到第 7
              章，化工材料类到第 5 章即可。修改后学生端立即生效。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/projects"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              项目工坊
            </Link>
            <Link
              href="/teacher/homework"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              作业辅导
            </Link>
            <Link
              href="/teacher/tasks"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              预习导航
            </Link>
            <Link
              href="/teacher/push"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              分层推送
            </Link>
            <Link
              href="/teacher/quiz"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              课堂快测
            </Link>
            <Link
              href="/teacher/diagnostics"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              诊断学情
            </Link>
            <Link
              href="/teacher/questions"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              题库管理
            </Link>
            <Link
              href="/teacher/resources"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              资源编辑
            </Link>
            <button
              onClick={resetMajors}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
            >
              恢复默认
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {majors.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={m.name}
                onChange={(e) => updateMajor(m.id, { name: e.target.value })}
                className="w-40 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-400"
              />
              <select
                value={m.level}
                onChange={(e) =>
                  updateMajor(m.id, { level: e.target.value as "A" | "B" })
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="A">A 型 · 要求较高</option>
                <option value="B">B 型 · 要求较低</option>
              </select>
              <input
                value={m.note ?? ""}
                placeholder="备注（可选）"
                onChange={(e) => updateMajor(m.id, { note: e.target.value })}
                className="min-w-56 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-400"
              />
              <button
                onClick={() => removeMajor(m.id)}
                disabled={majors.length <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                删除
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">快捷范围：</span>
              {[4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => applyChapterRange(m.id, n)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  前 {n} 章
                </button>
              ))}
              <span className="ml-2 text-xs text-slate-400">
                已选 {m.chapterIds.length} 章
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {chapters.map((c) => {
                const on = m.chapterIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChapter(m.id, c.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      on
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
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

            <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                学生端预览：共{" "}
                {modules.reduce(
                  (n, mod) => n + moduleSections(mod, m.chapterIds).length,
                  0,
                )}{" "}
                节，覆盖
                {modules
                  .filter((mod) => moduleSections(mod, m.chapterIds).length > 0)
                  .map((mod) => ` 模块${mod.order}`)
                  .join("、")}
              </p>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新增专业名称，例如：能源动力类"
            className="w-64 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
          />
          <button
            onClick={() => {
              addMajor(newName);
              setNewName("");
            }}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            添加专业
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">模块划分</h2>
        <p className="mt-1 text-xs text-slate-500">
          模块是内容组织的单位，由章节分组得出。当前划分见下表，归属可在方案确认后调整。
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2 pr-4 font-medium">模块</th>
                <th className="py-2 pr-4 font-medium">覆盖内容</th>
                <th className="py-2 pr-4 font-medium">三翼侧重</th>
                <th className="py-2 font-medium">节数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((mod) => {
                const sectionCount = moduleSections(
                  mod,
                  chapters.map((c) => c.id),
                ).length;
                const label = mod.sectionIds
                  ? mod.sectionIds
                      .map((sid) => {
                        const ch = [...chapterById.values()].find((c) =>
                          c.sections.some((s) => s.id === sid),
                        );
                        return `第 ${ch?.no} 章 ${sid.replace(/^s/, "")} 节`;
                      })
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .join("、")
                  : mod.chapterIds
                      .map((cid) => `第 ${chapterById.get(cid)?.no} 章`)
                      .join("、");
                return (
                  <tr key={mod.id}>
                    <td className="py-2.5 pr-4 text-slate-800">
                      模块 {mod.order}　{mod.name}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{label}</td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {mod.wingFocus
                        .map((w) =>
                          w === "design" ? "设计" : w === "engineering" ? "工程" : "管理",
                        )
                        .join(" / ")}
                    </td>
                    <td className="py-2.5 text-slate-600">{sectionCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

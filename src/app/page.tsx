"use client";

import Link from "next/link";
import { useAppState } from "@/components/app-state";
import { chapters, modules, RESOURCE_KINDS } from "@/content/course";

export default function HomePage() {
  const { majors, activeMajor, setActiveMajorId, completedSections } = useAppState();

  const totalSections = chapters.reduce((n, c) => n + c.sections.length, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-xs font-medium tracking-wide text-blue-600">
          上海工程技术大学 · 工程训练中心
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          《电工技术》课程模块化与三旋翼 PBL 智能体
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          以课程模块化为底座，学生端智能体伴学、教师端智能体监管，覆盖课前准备、课堂实施、课后跟进的完整教学闭环。
          三翼能力模型贯穿全部内容：设计翼（问题识别与方案构想）、工程翼（分析建模与实验验证）、管理翼（流程组织、规范表达与团队协作）。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            `教材 ${chapters.length} 章`,
            `${totalSections} 节`,
            `${modules.length} 个模块`,
            `${RESOURCE_KINDS.length} 类资源`,
          ].map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/student"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">学生端</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">课程地图与学习</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            按专业查看可见章节，进入每一节学习五类资源，向伴学智能体提问，完成进度记录。
          </p>
          <p className="mt-4 text-sm text-blue-600 group-hover:underline">进入学生端 →</p>
        </Link>

        <Link
          href="/teacher"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">教师端</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">专业变体与学情监管</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            为各专业配置可见章节范围（如机电 1–7 章、化工材料 1–5 章），查看全班进度与学情。
          </p>
          <p className="mt-4 text-sm text-blue-600 group-hover:underline">进入教师端 →</p>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">当前专业视角</h2>
          <span className="text-xs text-slate-500">
            已学 {completedSections.length} / {totalSections} 节
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {majors.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMajorId(m.id)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                activeMajor?.id === m.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {m.name}
              <span className="ml-2 text-xs text-slate-400">
                {m.chapterIds.length} 章 · {m.level} 型
              </span>
            </button>
          ))}
        </div>
        {activeMajor?.note ? (
          <p className="mt-3 text-xs text-slate-500">{activeMajor.note}</p>
        ) : null}
      </section>
    </div>
  );
}

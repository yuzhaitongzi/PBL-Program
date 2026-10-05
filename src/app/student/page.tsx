"use client";

import Link from "next/link";
import { useAppState } from "@/components/app-state";
import {
  chapterById,
  moduleSections,
  modules,
  WING_LABEL,
} from "@/content/course";

export default function StudentPage() {
  const {
    majors,
    activeMajor,
    activeMajorId,
    setActiveMajorId,
    visibleChapterIds,
    completedSections,
    resetProgress,
  } = useAppState();

  const allSections = modules.flatMap((m) => moduleSections(m, visibleChapterIds));
  const total = allSections.length;
  const done = allSections.filter((s) => completedSections.includes(s.id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-blue-600">学生端</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">课程地图</h1>
            <p className="mt-1 text-sm text-slate-600">
              按你所在专业查看可见的模块与章节，点击进入每一节学习。
            </p>
          </div>
          <button
            onClick={resetProgress}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
          >
            清空学习进度
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {majors.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMajorId(m.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                activeMajorId === m.id
                  ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              当前专业：{activeMajor?.name}（{activeMajor?.level} 型）· 可见{" "}
              {visibleChapterIds.length} 章 / {total} 节
            </span>
            <span>
              {done} / {total} 节 · {percent}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/student/diagnostic"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">课前准备</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">基础诊断测评</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            选范围自动组卷，提交后立即判分，生成知识点掌握情况。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            开始测评 →
          </p>
        </Link>
        <Link
          href="/student/profile"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">学习档案</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">我的学习状况</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            查看历次测评记录与知识点的累积掌握情况。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            查看档案 →
          </p>
        </Link>
        <Link
          href="/student/quiz"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">课堂实施</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">课堂快测</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            输入老师给出的课堂码作答，提交后立即看到对错与解析。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            进入答题 →
          </p>
        </Link>
        <Link
          href="/student/resources"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">课前准备</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">分层资源推送</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            按诊断出的薄弱知识点，推送巩固、提升、拓展三层的对应内容。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            查看推送 →
          </p>
        </Link>
        <Link
          href="/student/tasks"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">课前准备</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">预习导航</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            查看老师发布的预习任务与学习目标，标记完成并提出疑问。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            查看任务 →
          </p>
        </Link>
        <Link
          href="/student/homework"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">课后跟进</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">作业辅导</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            在线作答提交，自动判分并给出错因分析，累积错题本。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            去做作业 →
          </p>
        </Link>
        <Link
          href="/student/practice"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600">课后跟进</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">个性化补练</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            按错题知识点自动匹配新题，完成后记录效果变化。
          </p>
          <p className="mt-3 text-xs text-blue-600 group-hover:underline">
            查看补练 →
          </p>
        </Link>
      </section>

      {modules.map((mod) => {
        const sections = moduleSections(mod, visibleChapterIds);
        if (sections.length === 0) return null;
        const modDone = sections.filter((s) => completedSections.includes(s.id)).length;

        return (
          <section
            key={mod.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                    模块 {mod.order}
                  </span>
                  <h2 className="text-base font-semibold text-slate-900">{mod.name}</h2>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{mod.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mod.wingFocus.map((w) => (
                    <span
                      key={w}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700"
                      title={WING_LABEL[w].desc}
                    >
                      {WING_LABEL[w].name}
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {modDone} / {sections.length} 节
              </span>
            </div>

            <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              {sections.map((s) => {
                const ch = [...chapterById.values()].find((c) =>
                  c.sections.some((x) => x.id === s.id),
                );
                const isDone = completedSections.includes(s.id);
                return (
                  <li key={s.id}>
                    <Link
                      href={`/student/chapter/${ch?.id ?? "ch1"}#${s.id}`}
                      className="flex items-center gap-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                          isDone
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="w-14 shrink-0 text-xs text-slate-400">
                        {s.id.replace(/^s/, "")}
                      </span>
                      <span className="flex-1 text-sm text-slate-800">{s.title}</span>
                      <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                        第 {ch?.no} 章
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

    </div>
  );
}

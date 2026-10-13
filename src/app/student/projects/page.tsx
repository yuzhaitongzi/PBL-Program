"use client";

import Link from "next/link";
import { DELIVERABLE_LABEL, currentMilestone, formatDate, projectProgress, useProjectBoard } from "@/lib/project";

export default function StudentProjectsPage() {
  const { board } = useProjectBoard();
  const projects = board.projects
    .filter((p) => p.published)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">项目工坊</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          这里是以真实问题为起点的项目式学习。每个项目围绕一个驱动性问题展开，
          按里程碑推进，最后提交设计报告或汇报 PPT。
        </p>
      </section>

      {projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-sm text-slate-500">老师还没有发布项目。</p>
        </section>
      ) : (
        <section className="space-y-4">
          {projects.map((p) => {
            const prog = projectProgress(board, p);
            const next = currentMilestone(board, p);
            const subs = board.submissions.filter((s) => s.projectId === p.id);
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-slate-900">
                      {p.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      {p.drivingQuestion}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {DELIVERABLE_LABEL[p.deliverable]}
                  </span>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      prog.rate >= 1 ? "bg-emerald-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.round(prog.rate * 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                  <span>
                    里程碑 {prog.done}/{prog.total}
                  </span>
                  <span>截止 {formatDate(p.endAt)}</span>
                  <span>已提交作品 {subs.length} 份</span>
                  {next ? <span>当前阶段：{next.title}</span> : <span>全部阶段已完成</span>}
                </div>

                <Link
                  href={`/student/projects/${p.id}`}
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  进入项目工作台 →
                </Link>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

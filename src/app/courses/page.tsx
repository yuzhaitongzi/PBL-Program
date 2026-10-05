"use client";

import { courseGraph, type CourseNode } from "@/content/course";

const RELATION_LABEL: Record<CourseNode["relation"], string> = {
  self: "本课程",
  prerequisite: "前置",
  "follow-up": "后续",
  related: "相关",
};

const RELATION_STYLE: Record<CourseNode["relation"], string> = {
  self: "border-blue-500 bg-blue-600 text-white",
  prerequisite: "border-slate-300 bg-white text-slate-800",
  "follow-up": "border-emerald-300 bg-emerald-50 text-emerald-900",
  related: "border-amber-300 bg-amber-50 text-amber-900",
};

const RX = 36;
const RY = 38;

export default function CoursesPage() {
  const self = courseGraph.find((n) => n.relation === "self")!;
  const others = courseGraph.filter((n) => n.relation !== "self");

  const positioned = others.map((node, i) => {
    const angle = ((-90 + i * (360 / others.length)) * Math.PI) / 180;
    return {
      node,
      left: 50 + Math.cos(angle) * RX,
      top: 50 + Math.sin(angle) * RY,
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium text-blue-600">课程关系图</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          《电工技术》与关联课程
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          以本课程为中心，展示与前置、后续、相关课程的衔接关系。节点链接由教师在后台配置，
          配置后点击即可跳转到对应课程平台。
        </p>
      </section>

      <section className="hidden rounded-2xl border border-slate-200 bg-white p-4 md:block">
        <div className="relative h-[520px] w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {positioned.map(({ node, left, top }) => (
              <line
                key={node.id}
                x1={50}
                y1={50}
                x2={left}
                y2={top}
                stroke="#cbd5e1"
                strokeWidth={0.35}
                strokeDasharray={node.relation === "related" ? "1.5 1.5" : undefined}
              />
            ))}
          </svg>

          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: "50%" }}
          >
            <div className="w-44 rounded-xl border-2 border-blue-500 bg-blue-600 px-4 py-3 text-center text-white shadow-sm">
              <p className="text-sm font-semibold">{self.name}</p>
              <p className="mt-1 text-[11px] leading-4 text-blue-100">
                电路基本理论 · 交流电路 · 暂态分析 · 电气控制
              </p>
            </div>
          </div>

          {positioned.map(({ node, left, top }) => (
            <div
              key={node.id}
              className="absolute w-44 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div
                className={`rounded-xl border px-3.5 py-3 shadow-sm ${RELATION_STYLE[node.relation]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{node.name}</p>
                  <span className="shrink-0 rounded-full bg-black/5 px-1.5 py-0.5 text-[10px]">
                    {RELATION_LABEL[node.relation]}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-4 opacity-80">{node.desc}</p>
                {node.url ? (
                  <div className="mt-2">
                    <a
                      href={node.url}
                      className="text-[11px] text-blue-700 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      跳转课程 →
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 md:hidden">
        <div className="rounded-xl border-2 border-blue-500 bg-blue-600 px-4 py-3 text-white">
          <p className="text-sm font-semibold">{self.name}</p>
          <p className="mt-1 text-[11px] text-blue-100">{self.desc}</p>
        </div>
        {others.map((node) => (
          <div
            key={node.id}
            className={`rounded-xl border px-4 py-3 ${RELATION_STYLE[node.relation]}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{node.name}</p>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px]">
                {RELATION_LABEL[node.relation]}
              </span>
            </div>
            <p className="mt-1 text-[11px] opacity-80">{node.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
}

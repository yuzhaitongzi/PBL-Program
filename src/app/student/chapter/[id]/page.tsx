"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useAppState } from "@/components/app-state";
import {
  chapterById,
  modules,
  moduleSections,
  WING_LABEL,
} from "@/content/course";
import { QUESTION_TYPE_LABEL, type Question } from "@/content/questions";

export default function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    visibleChapterIds,
    completedSections,
    toggleSectionDone,
    activeMajor,
    getResource,
    questions,
  } = useAppState();

  const chapter = chapterById.get(id);

  if (!chapter) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">未找到该章节。</p>
        <Link href="/student" className="mt-3 inline-block text-sm text-blue-600">
          ← 返回课程地图
        </Link>
      </div>
    );
  }

  const visible = visibleChapterIds.includes(chapter.id);
  const owns = modules.filter((m) =>
    moduleSections(m, [chapter.id]).some((s) =>
      chapter.sections.some((cs) => cs.id === s.id),
    ),
  );

  return (
    <div className="space-y-5">
      <Link href="/student" className="text-sm text-blue-600 hover:underline">
        ← 返回课程地图
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs text-slate-400">第 {chapter.no} 章</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{chapter.title}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {owns.map((m) => (
            <span
              key={m.id}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600"
            >
              模块 {m.order} · {m.name}
            </span>
          ))}
          {owns.flatMap((m) => m.wingFocus).map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] text-blue-700"
              title={WING_LABEL[w].desc}
            >
              {WING_LABEL[w].name}
            </span>
          ))}
        </div>

        {!visible ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            当前专业「{activeMajor?.name}」的可见范围不包含本章。可在教师端调整章节范围。
          </p>
        ) : null}
      </section>

      {chapter.sections.map((s) => {
        const isDone = completedSections.includes(s.id);
        const res = getResource(s.id);
        const hasContent =
          res.points.length > 0 ||
          res.example.title.trim() !== "" ||
          res.pitfalls.length > 0 ||
          res.case.title.trim() !== "";
        return (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{s.id.replace(/^s/, "")}</p>
                <h2 className="mt-0.5 text-base font-semibold text-slate-900">
                  {s.title}
                </h2>
              </div>
              <button
                onClick={() => toggleSectionDone(s.id)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs transition ${
                  isDone
                    ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {isDone ? "✓ 已完成" : "标记完成"}
              </button>
            </div>

            {s.subsections.length > 0 ? (
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {s.subsections.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="mt-0.5 text-[11px] text-slate-400">
                      {sub.id.replace(/^s/, "")}
                    </span>
                    <span className="text-sm text-slate-700">{sub.title}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {!hasContent ? (
              <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400">
                本节内容正在补充中。
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {res.points.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-slate-500">知识点</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {res.points.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {res.example.title.trim() !== "" ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">例题</p>
                    <p className="mt-2 text-sm leading-6 text-slate-800">
                      {res.example.title}
                    </p>
                    {res.example.solution.trim() !== "" ? (
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <p className="text-[11px] font-medium text-slate-400">
                          解析
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-700 whitespace-pre-line">
                          {res.example.solution}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {res.pitfalls.length > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-medium text-amber-700">易错点</p>
                    <ul className="mt-2 space-y-1.5">
                      {res.pitfalls.map((p, i) => (
                        <li
                          key={`${p}-${i}`}
                          className="flex gap-2 text-sm leading-6 text-amber-900"
                        >
                          <span className="text-amber-500">{i + 1}.</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {res.case.title.trim() !== "" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-700">案例</p>
                    <p className="mt-2 text-sm font-medium text-emerald-900">
                      {res.case.title}
                    </p>
                    {res.case.body.trim() !== "" ? (
                      <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                        {res.case.body}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            {questions.filter((q) => q.sectionId === s.id).length > 0 ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium text-slate-500">
                  本节练习（{questions.filter((q) => q.sectionId === s.id).length} 题）
                </p>
                <div className="mt-2 space-y-2">
                  {questions
                    .filter((q) => q.sectionId === s.id)
                    .map((q) => (
                      <PracticeItem key={q.id} q={q} />
                    ))}
                </div>
              </div>
            ) : null}
          </section>
        );
      })}

    </div>
  );
}

function PracticeItem({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
          {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <p className="text-sm leading-6 text-slate-800">{q.stem}</p>
      </div>

      {q.options && q.options.length > 0 ? (
        <ul className="mt-2 space-y-1 pl-1">
          {q.options.map((opt, i) => (
            <li key={i} className="text-sm leading-6 text-slate-700">
              <span className="mr-1.5 text-slate-400">{letters[i] ?? i + 1}.</span>
              {opt}
            </li>
          ))}
        </ul>
      ) : null}

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

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-2 text-xs text-blue-600 hover:underline"
      >
        {open ? "收起答案" : "查看答案"}
      </button>

      {open ? (
        <div className="mt-2 rounded-lg bg-white p-3 ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">
            答案：<span className="font-medium text-slate-800">{q.answer || "—"}</span>
          </p>
          {q.explanation ? (
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{q.explanation}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/app-state";
import {
  chapterById,
  chapters,
  type SectionResource,
} from "@/content/course";
import { QUESTION_TYPE_LABEL, type Question } from "@/content/questions";
import {
  buildPushItems,
  groupByLayer,
  LAYER_META,
  LAYER_ORDER,
  thresholdsFor,
  type PushItem,
  type PushLayer,
} from "@/lib/push";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function StudentResourcesPage() {
  const {
    questions,
    diagnostics,
    activeMajor,
    visibleChapterIds,
    pushRule,
    getResource,
  } = useAppState();

  const resourceMap = useMemo(() => {
    const map: Record<string, SectionResource> = {};
    chapters.forEach((c) =>
      c.sections.forEach((s) => {
        map[s.id] = getResource(s.id);
      }),
    );
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getResource]);

  const majorLevel = activeMajor?.level ?? "B";
  const thresholds = thresholdsFor(pushRule, majorLevel);
  const allItems = diagnostics.flatMap((d) => d.items);

  const pushItems = useMemo(
    () =>
      buildPushItems({
        diagnosticItems: allItems,
        questions,
        chapters,
        resources: resourceMap,
        rule: pushRule,
        majorLevel,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diagnostics, questions, resourceMap, pushRule, majorLevel],
  );

  const grouped = groupByLayer(pushItems);

  const defaultSections = useMemo(() => {
    const out: { chapterNo: number; chapterTitle: string; sectionId: string; sectionTitle: string }[] = [];
    for (const c of chapters) {
      if (!visibleChapterIds.includes(c.id)) continue;
      for (const s of c.sections) {
        const r = resourceMap[s.id];
        if (r && (r.example.title || r.case.title)) {
          out.push({
            chapterNo: c.no,
            chapterTitle: c.title,
            sectionId: s.id,
            sectionTitle: s.title,
          });
        }
      }
    }
    return out.slice(0, 6);
  }, [resourceMap, visibleChapterIds]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <Link href="/student" className="text-xs text-blue-600 hover:underline">
          ← 返回课程地图
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">分层资源推送</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          根据诊断测评中各知识点的掌握情况，把内容按巩固、提升、拓展三层推送给你，
          不同专业的要求不同，推送标准也随之调整。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            当前专业：{activeMajor?.name}（{majorLevel} 型）
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            巩固线 {Math.round(thresholds.basic * 100)}%
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            掌握线 {Math.round(thresholds.master * 100)}%
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            覆盖知识点 {pushItems.length} 个
          </span>
        </div>
      </section>

      {pushItems.length === 0 ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-medium text-blue-900">
              还没有诊断数据，先看看默认推荐
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              完成一次基础诊断测评后，这里会按你的薄弱知识点精确推送。下面先按你所在专业的
              章节范围，给出每节的例题与案例。
            </p>
            <Link
              href="/student/diagnostic"
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              去做基础诊断
            </Link>
          </div>

          <div className="space-y-3">
            {defaultSections.map((s) => {
              const r = resourceMap[s.sectionId];
              return (
                <div
                  key={s.sectionId}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <p className="text-xs text-slate-400">
                    第 {s.chapterNo} 章 · {s.sectionId.replace(/^s/, "")}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">
                    {s.sectionTitle}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r?.points.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  {r?.example.title ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">例题</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-800">
                        {r.example.title}
                      </p>
                    </div>
                  ) : null}
                  {r?.case.title ? (
                    <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-medium text-emerald-700">案例</p>
                      <p className="mt-1 text-sm font-medium text-emerald-900">
                        {r.case.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                        {r.case.body}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {LAYER_ORDER.map((layer) => (
              <div
                key={layer}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${LAYER_META[layer].className}`}
                >
                  {LAYER_META[layer].name}
                </span>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {grouped[layer].length}
                  <span className="ml-1 text-sm font-normal text-slate-400">
                    个知识点
                  </span>
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {LAYER_META[layer].desc}
                </p>
              </div>
            ))}
          </section>

          {LAYER_ORDER.map((layer) =>
            grouped[layer].length === 0 ? null : (
              <section key={layer} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {LAYER_META[layer].name}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {grouped[layer].length} 个知识点
                  </span>
                </div>
                {grouped[layer].map((item) => (
                  <PushCard
                    key={item.point}
                    item={item}
                    layer={layer}
                    resourceMap={resourceMap}
                  />
                ))}
              </section>
            ),
          )}
        </>
      )}
    </div>
  );
}

function PushCard({
  item,
  layer,
  resourceMap,
}: {
  item: PushItem;
  layer: PushLayer;
  resourceMap: Record<string, SectionResource>;
}) {
  const [openQuestions, setOpenQuestions] = useState(true);
  const meta = LAYER_META[layer];

  const showPoints = layer !== "extend";
  const showExample = layer === "basic" || layer === "improve";
  const showPitfalls = layer === "basic";
  const showCase = layer === "extend";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{item.point}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[11px] ${meta.className}`}>
          {meta.name}
        </span>
        <span className="text-xs text-slate-500">
          掌握度 {Math.round(item.rate * 100)}%（{item.correct}/{item.total}）
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        推荐理由：在诊断测评中该知识点正确率 {Math.round(item.rate * 100)}%，
        按{meta.name}推送{showPitfalls ? "知识点回顾、例题与易错点" : ""}
        {showExample && !showPitfalls ? "例题与配套练习" : ""}
        {showCase ? "工程案例与综合应用" : ""}。
      </p>

      {item.sections.length > 0 ? (
        <div className="mt-3 space-y-2">
          {item.sections.map((ref) => {
            const r = resourceMap[ref.sectionId];
            if (!r) return null;
            return (
              <div key={ref.sectionId} className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">
                  对应第 {ref.chapterNo} 章 · {ref.sectionId.replace(/^s/, "")}
                </p>
                <Link
                  href={`/student/chapter/${ref.chapterId}#${ref.sectionId}`}
                  className="mt-0.5 inline-block text-sm font-medium text-blue-700 hover:underline"
                >
                  {ref.sectionTitle} →
                </Link>

                {showPoints && r.points.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.points.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : null}

                {showExample && r.example.title ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">例题</p>
                    <p className="mt-1 text-sm leading-6 text-slate-800">
                      {r.example.title}
                    </p>
                    {r.example.solution ? (
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {r.example.solution}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {showPitfalls && r.pitfalls.length > 0 ? (
                  <div className="mt-2 rounded-lg bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-700">易错点</p>
                    <ul className="mt-1 space-y-1">
                      {r.pitfalls.map((p, i) => (
                        <li key={i} className="text-sm leading-6 text-amber-900">
                          {i + 1}. {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {showCase && r.case.title ? (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs font-medium text-emerald-700">案例</p>
                    <p className="mt-1 text-sm font-medium text-emerald-900">
                      {r.case.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                      {r.case.body}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400">
          该知识点暂未关联到具体章节资源。
        </p>
      )}

      {item.questions.length > 0 ? (
        <div className="mt-3">
          <button
            onClick={() => setOpenQuestions((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {openQuestions ? "收起" : "展开"}配套练习（{item.questions.length} 题）
          </button>
          {openQuestions ? (
            <div className="mt-2 space-y-2">
              {item.questions.map((q) => (
                <PracticeRow key={q.id} q={q} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PracticeRow({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  const chapter = chapterById.get(q.chapterId);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
          {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <p className="flex-1 text-sm leading-6 text-slate-800">{q.stem}</p>
        <span className="shrink-0 text-[10px] text-slate-400">
          第 {chapter?.no} 章
        </span>
      </div>
      {q.options && q.options.length > 0 ? (
        <ul className="mt-1.5 pl-1">
          {q.options.map((opt, i) => (
            <li key={i} className="text-sm leading-6 text-slate-600">
              <span className="mr-1.5 text-slate-400">{LETTERS[i] ?? i + 1}.</span>
              {opt}
            </li>
          ))}
        </ul>
      ) : null}
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-1.5 text-xs text-blue-600 hover:underline"
      >
        {open ? "收起答案" : "查看答案"}
      </button>
      {open ? (
        <div className="mt-1.5 rounded-lg bg-white p-3 ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">
            答案：<span className="font-medium text-slate-800">{q.answer}</span>
          </p>
          {q.explanation ? (
            <p className="mt-1 text-sm leading-6 text-slate-700">{q.explanation}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

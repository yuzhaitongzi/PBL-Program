"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapters, type SectionResource } from "@/content/course";
import { defaultResources, getDefaultResource } from "@/content/resources";

const TOTAL_SECTIONS = chapters.reduce((n, c) => n + c.sections.length, 0);

export default function ResourceEditorPage() {
  const {
    getResource,
    saveResource,
    resetResource,
    resetAllResources,
    resourceOverrides,
  } = useAppState();

  const firstSectionId = chapters[0].sections[0].id;
  const [selectedId, setSelectedId] = useState(firstSectionId);
  const [draft, setDraft] = useState<SectionResource>(() =>
    getResource(firstSectionId),
  );
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(getResource(selectedId));
    setTagInput("");
    setSaved(false);
    // 仅在切换节时重新载入草稿
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectedChapter = chapters.find((c) =>
    c.sections.some((s) => s.id === selectedId),
  );
  const selectedSection = selectedChapter?.sections.find((s) => s.id === selectedId);

  const editedCount = Object.keys(resourceOverrides).length;
  const filledCount = chapters
    .flatMap((c) => c.sections)
    .filter((s) => {
      const r = defaultResources[s.id];
      return r && (r.points.length > 0 || r.example.title || r.case.title);
    }).length;

  function update(patch: Partial<SectionResource>) {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  }

  function addTag() {
    const v = tagInput.trim();
    if (!v || draft.points.includes(v)) return;
    update({ points: [...draft.points, v] });
    setTagInput("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              四类资源编辑
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              每一节可维护知识点（标签）、例题、易错点与案例。内置了一版初始内容，
              你可以直接在此基础上修改、删除或补充。
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              内置 {filledCount} / {TOTAL_SECTIONS} 节 · 已修订 {editedCount} 节
            </p>
            <button
              onClick={() => {
                resetAllResources();
                setDraft(getDefaultResource(selectedId));
                setSaved(false);
              }}
              className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
            >
              全部恢复内置内容
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {chapters.map((c) => (
              <div key={c.id}>
                <p className="px-2 py-1 text-[11px] font-medium text-slate-400">
                  第 {c.no} 章　{c.title}
                </p>
                <ul>
                  {c.sections.map((s) => {
                    const on = s.id === selectedId;
                    const edited = s.id in resourceOverrides;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => setSelectedId(s.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                            on
                              ? "bg-blue-50 font-medium text-blue-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="w-12 shrink-0 text-slate-400">
                            {s.id.replace(/^s/, "")}
                          </span>
                          <span className="flex-1 truncate">{s.title}</span>
                          {edited ? (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs text-slate-400">
              第 {selectedChapter?.no} 章 · {selectedSection?.id.replace(/^s/, "")}
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              {selectedSection?.title}
            </h2>
          </div>

          {/* 知识点 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-900">知识点标签</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {draft.points.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                >
                  {p}
                  <button
                    onClick={() =>
                      update({ points: draft.points.filter((x) => x !== p) })
                    }
                    className="text-blue-400 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              {draft.points.length === 0 ? (
                <span className="text-xs text-slate-400">暂无标签</span>
              ) : null}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="输入标签后回车，例如：基尔霍夫电流定律"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <button
                onClick={addTag}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                添加
              </button>
            </div>
          </div>

          {/* 例题 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-900">例题</p>
            <label className="mt-3 block text-xs text-slate-500">题干</label>
            <textarea
              value={draft.example.title}
              onChange={(e) =>
                update({ example: { ...draft.example, title: e.target.value } })
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
              placeholder="输入例题题干"
            />
            <label className="mt-3 block text-xs text-slate-500">解析</label>
            <textarea
              value={draft.example.solution}
              onChange={(e) =>
                update({ example: { ...draft.example, solution: e.target.value } })
              }
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
              placeholder="输入解题过程与解析"
            />
          </div>

          {/* 易错点 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-900">易错点</p>
            <div className="mt-3 space-y-2">
              {draft.pitfalls.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={p}
                    rows={2}
                    onChange={(e) => {
                      const next = [...draft.pitfalls];
                      next[i] = e.target.value;
                      update({ pitfalls: next });
                    }}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() =>
                      update({ pitfalls: draft.pitfalls.filter((_, j) => j !== i) })
                    }
                    className="self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              ))}
              {draft.pitfalls.length === 0 ? (
                <p className="text-xs text-slate-400">暂无易错点</p>
              ) : null}
            </div>
            <button
              onClick={() => update({ pitfalls: [...draft.pitfalls, ""] })}
              className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 transition hover:border-blue-300 hover:text-blue-700"
            >
              + 添加一条易错点
            </button>
          </div>

          {/* 案例 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-900">案例</p>
            <label className="mt-3 block text-xs text-slate-500">案例标题</label>
            <input
              value={draft.case.title}
              onChange={(e) =>
                update({ case: { ...draft.case, title: e.target.value } })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="例如：工厂并联电容器补偿"
            />
            <label className="mt-3 block text-xs text-slate-500">案例说明</label>
            <textarea
              value={draft.case.body}
              onChange={(e) => update({ case: { ...draft.case, body: e.target.value } })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
              placeholder="用两三句话说明工程背景与与本节的联系"
            />
          </div>

          <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur">
            <button
              onClick={() => {
                saveResource(selectedId, draft);
                setSaved(true);
              }}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              保存本节
            </button>
            <button
              onClick={() => {
                resetResource(selectedId);
                setDraft(getDefaultResource(selectedId));
                setSaved(true);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300"
            >
              恢复内置内容
            </button>
            {saved ? <span className="text-xs text-emerald-600">已保存</span> : null}
            <Link
              href={`/student/chapter/${selectedChapter?.id}#${selectedId}`}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              在学生端查看 →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

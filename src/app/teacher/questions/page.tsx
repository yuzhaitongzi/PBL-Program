"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/app-state";
import { chapters } from "@/content/course";
import {
  DEFAULT_SOURCE,
  DIFFICULTIES,
  QUESTION_TYPE_LABEL,
  type Difficulty,
  type Question,
  type QuestionType,
} from "@/content/questions";
import { readImageFiles } from "@/lib/image";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function newQuestion(): Question {
  const first = chapters[0];
  return {
    id: `q-custom-${Date.now().toString(36)}`,
    chapterId: first.id,
    sectionId: first.sections[0].id,
    points: [],
    type: "single",
    stem: "",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
    difficulty: "易",
    source: DEFAULT_SOURCE,
  };
}

export default function QuestionBankPage() {
  const {
    questions,
    saveQuestion,
    deleteQuestion,
    resetQuestion,
    resetAllQuestions,
    questionOverrides,
    customQuestions,
  } = useAppState();

  const [selectedId, setSelectedId] = useState<string>(
    () => questions[0]?.id ?? "",
  );
  const [draft, setDraft] = useState<Question | null>(() => {
    const q = questions[0];
    return q ? { ...q, options: q.options ? [...q.options] : undefined } : null;
  });
  const [saved, setSaved] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedId && questions.length > 0) setSelectedId(questions[0].id);
  }, [questions, selectedId]);

  useEffect(() => {
    const q = questions.find((x) => x.id === selectedId);
    setDraft(q ? { ...q, options: q.options ? [...q.options] : undefined } : null);
    setTagInput("");
    setSaved(false);
    // 切换题目或题库数据变化时重新载入草稿
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, questions]);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return questions.filter((q) => {
      if (filterChapter !== "all" && q.chapterId !== filterChapter) return false;
      if (filterType !== "all" && q.type !== filterType) return false;
      if (kw && !q.stem.includes(kw) && !q.points.join("").includes(kw)) return false;
      return true;
    });
  }, [questions, filterChapter, filterType, keyword]);

  const stats = useMemo(() => {
    const byType = { single: 0, multiple: 0, judge: 0, calc: 0 };
    questions.forEach((q) => {
      byType[q.type] += 1;
    });
    return byType;
  }, [questions]);

  const editedCount =
    Object.keys(questionOverrides).length + customQuestions.length;
  const chapter = draft ? chapters.find((c) => c.id === draft.chapterId) : undefined;

  function update(patch: Partial<Question>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setSaved(false);
  }

  function addTag() {
    const v = tagInput.trim();
    if (!v || !draft || draft.points.includes(v)) return;
    update({ points: [...draft.points, v] });
    setTagInput("");
  }

  function toggleOptionAnswer(letter: string) {
    if (!draft) return;
    if (draft.type === "single") {
      update({ answer: letter });
      return;
    }
    const cur = draft.answer ? draft.answer.split("") : [];
    const next = cur.includes(letter)
      ? cur.filter((l) => l !== letter)
      : [...cur, letter].sort();
    update({ answer: next.join("") });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">题库管理</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              共 {questions.length} 题：单选 {stats.single}、多选 {stats.multiple}、判断{" "}
              {stats.judge}、计算 {stats.calc}。可逐题编辑、增删，支持拍照上传题目图片。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const q = newQuestion();
                saveQuestion(q);
                setSelectedId(q.id);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              新建题目
            </button>
            <button
              onClick={() => {
                resetAllQuestions();
                setSaved(false);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
            >
              全部恢复内置
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          已修订 {editedCount} 题（含新增 {customQuestions.length} 题）
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-3">
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索题干或知识点"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <div className="flex gap-2">
              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="all">全部章节</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    第 {c.no} 章
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="all">全部题型</option>
                {Object.entries(QUESTION_TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400">筛选结果 {filtered.length} 题</p>
          </div>

          <div className="max-h-[62vh] space-y-1.5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
            {filtered.map((q) => {
              const on = q.id === selectedId;
              const edited = q.id in questionOverrides;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left transition ${
                    on ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
                        q.type === "calc"
                          ? "bg-purple-50 text-purple-700"
                          : q.type === "judge"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {QUESTION_TYPE_LABEL[q.type]}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {q.sectionId.replace(/^s/, "")}
                    </span>
                    {edited ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                    ) : null}
                  </div>
                  <p
                    className={`mt-1 line-clamp-2 text-xs leading-5 ${
                      on ? "text-blue-900" : "text-slate-700"
                    }`}
                  >
                    {q.stem || "（题干为空）"}
                  </p>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-400">
                没有符合条件的题目
              </p>
            ) : null}
          </div>
        </aside>

        {draft ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs text-slate-500">题型</span>
                  <select
                    value={draft.type}
                    onChange={(e) => {
                      const t = e.target.value as QuestionType;
                      update({
                        type: t,
                        options:
                          t === "single" || t === "multiple"
                            ? draft.options && draft.options.length > 0
                              ? draft.options
                              : ["", "", "", ""]
                            : undefined,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    {Object.entries(QUESTION_TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">所属章节</span>
                  <select
                    value={draft.chapterId}
                    onChange={(e) => {
                      const c = chapters.find((x) => x.id === e.target.value);
                      update({
                        chapterId: e.target.value,
                        sectionId: c?.sections[0].id ?? draft.sectionId,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        第 {c.no} 章　{c.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">所属节</span>
                  <select
                    value={draft.sectionId}
                    onChange={(e) => update({ sectionId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    {chapter?.sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id.replace(/^s/, "")}　{s.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs text-slate-500">难度</span>
                  <select
                    value={draft.difficulty}
                    onChange={(e) =>
                      update({ difficulty: e.target.value as Difficulty })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-slate-500">来源</span>
                  <input
                    value={draft.source ?? ""}
                    onChange={(e) => update({ source: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-900">题干</p>
              <textarea
                value={draft.stem}
                onChange={(e) => update({ stem: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                placeholder="输入题目内容"
              />
              {draft.type === "single" || draft.type === "multiple" ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-500">
                    选项（点击前面的字母设为正确答案
                    {draft.type === "multiple" ? "，多选题可多选" : ""}）
                  </p>
                  <div className="mt-2 space-y-2">
                    {(draft.options ?? []).map((opt, i) => {
                      const letter = OPTION_LETTERS[i] ?? String(i + 1);
                      const isAnswer = draft.answer.includes(letter);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleOptionAnswer(letter)}
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs transition ${
                              isAnswer
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-slate-500 hover:border-blue-400"
                            }`}
                          >
                            {letter}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => {
                              const next = [...(draft.options ?? [])];
                              next[i] = e.target.value;
                              update({ options: next });
                            }}
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                          />
                          <button
                            onClick={() =>
                              update({
                                options: (draft.options ?? []).filter((_, j) => j !== i),
                              })
                            }
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-600"
                          >
                            删除
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => update({ options: [...(draft.options ?? []), ""] })}
                    className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    + 添加选项
                  </button>
                </div>
              ) : null}
              {draft.type === "judge" ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-500">答案</p>
                  <div className="mt-2 flex gap-2">
                    {["对", "错"].map((v) => (
                      <button
                        key={v}
                        onClick={() => update({ answer: v })}
                        className={`rounded-lg border px-5 py-1.5 text-sm transition ${
                          draft.answer === v
                            ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {draft.type === "calc" ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-500">答案要点</p>
                  <textarea
                    value={draft.answer}
                    onChange={(e) => update({ answer: e.target.value })}
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                  />
                </div>
              ) : null}
              <div className="mt-4">
                <p className="text-xs text-slate-500">解析</p>
                <textarea
                  value={draft.explanation}
                  onChange={(e) => update({ explanation: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                />
              </div>
            </div>

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
                  placeholder="输入知识点后回车"
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

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">题目配图</p>
                  <p className="mt-1 text-xs text-slate-500">
                    手机拍照或从相册选择，可一次上传多张；适合把试卷上的图题、电路图拍下来。
                  </p>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  拍照 / 上传图片
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const urls = await readImageFiles(e.target.files);
                    if (urls.length > 0) {
                      update({ images: [...(draft.images ?? []), ...urls] });
                    }
                    e.target.value = "";
                  }}
                />
              </div>
              {(draft.images ?? []).length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {(draft.images ?? []).map((src, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`配图 ${i + 1}`}
                        className="h-28 w-40 rounded-lg border border-slate-200 object-cover"
                      />
                      <button
                        onClick={() =>
                          update({
                            images: (draft.images ?? []).filter((_, j) => j !== i),
                          })
                        }
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs text-slate-500 shadow ring-1 ring-slate-200 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
                  暂无配图
                </p>
              )}
            </div>

            <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur">
              <button
                onClick={() => {
                  saveQuestion(draft);
                  setSaved(true);
                }}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                保存题目
              </button>
              <button
                onClick={() => {
                  resetQuestion(selectedId);
                  setSaved(true);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300"
              >
                恢复内置
              </button>
              <button
                onClick={() => {
                  if (!confirm("确定删除这道题吗？")) return;
                  const rest = questions.filter((q) => q.id !== selectedId);
                  deleteQuestion(selectedId);
                  setSelectedId(rest[0]?.id ?? "");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-red-300 hover:text-red-600"
              >
                删除
              </button>
              {saved ? <span className="text-xs text-emerald-600">已保存</span> : null}
              <span className="ml-auto text-xs text-slate-400">编号 {draft.id}</span>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-400">
            左侧选择一道题目开始编辑
          </section>
        )}
      </div>
    </div>
  );
}

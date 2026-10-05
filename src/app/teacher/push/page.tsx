"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/components/app-state";
import { chapters, type SectionResource } from "@/content/course";
import {
  buildPushItems,
  coverageStats,
  groupByLayer,
  LAYER_META,
  LAYER_ORDER,
  thresholdsFor,
} from "@/lib/push";

export default function TeacherPushPage() {
  const {
    questions,
    diagnostics,
    pushRule,
    setPushRule,
    resetPushRule,
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

  const allItems = diagnostics.flatMap((d) => d.items);
  const coverage = coverageStats(questions, resourceMap);

  const preview = useMemo(
    () =>
      buildPushItems({
        diagnosticItems: allItems,
        questions,
        chapters,
        resources: resourceMap,
        rule: pushRule,
        majorLevel: "B",
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diagnostics, questions, resourceMap, pushRule],
  );
  const grouped = groupByLayer(preview);

  const thresholdsB = thresholdsFor(pushRule, "B");
  const thresholdsA = thresholdsFor(pushRule, "A");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/teacher" className="text-xs text-blue-600 hover:underline">
              ← 返回教师端
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              分层资源推送
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              配置分层规则：诊断正确率低于巩固线的知识点推送基础内容，
              高于掌握线的推送工程案例。不同专业的标准可差异化。
            </p>
          </div>
          <button
            onClick={resetPushRule}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
          >
            恢复默认规则
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">分层规则</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs text-slate-500">
              巩固线（低于此值进入巩固层）
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0.3}
                max={0.9}
                step={0.05}
                value={pushRule.basicThreshold}
                onChange={(e) =>
                  setPushRule({ basicThreshold: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-medium text-slate-800">
                {Math.round(pushRule.basicThreshold * 100)}%
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">
              掌握线（高于此值进入拓展层）
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0.6}
                max={0.98}
                step={0.05}
                value={pushRule.masterThreshold}
                onChange={(e) =>
                  setPushRule({ masterThreshold: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-medium text-slate-800">
                {Math.round(pushRule.masterThreshold * 100)}%
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">
              A 型专业上浮（要求更高）
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={0.2}
                step={0.05}
                value={pushRule.levelAAdjust}
                onChange={(e) =>
                  setPushRule({ levelAAdjust: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-medium text-slate-800">
                +{Math.round(pushRule.levelAAdjust * 100)}%
              </span>
            </div>
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">B 型专业（要求较低）</p>
            <p className="mt-1 text-sm text-slate-800">
              巩固线 {Math.round(thresholdsB.basic * 100)}% ／ 掌握线{" "}
              {Math.round(thresholdsB.master * 100)}%
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">A 型专业（要求较高）</p>
            <p className="mt-1 text-sm text-slate-800">
              巩固线 {Math.round(thresholdsA.basic * 100)}% ／ 掌握线{" "}
              {Math.round(thresholdsA.master * 100)}%
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">推送能力覆盖</h2>
        <p className="mt-1 text-xs text-slate-500">
          统计题库与四类资源中出现的知识点，以及它们能否找到对应的章节内容与练习题。
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            { label: "知识点总数", value: coverage.totalPoints },
            { label: "有章节资源", value: coverage.withSection },
            { label: "有练习题", value: coverage.withQuestion },
            { label: "资源与题目齐全", value: coverage.both },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          覆盖率 = 有章节资源的知识点占知识点总数的{" "}
          {coverage.totalPoints === 0
            ? 0
            : Math.round((coverage.withSection / coverage.totalPoints) * 100)}
          %。缺口主要是内容团队尚未录入的资源条目。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">分层预览</h2>
        <p className="mt-1 text-xs text-slate-500">
          依据本机已有的诊断记录，按当前规则计算出每个知识点会进入哪一层。
          接入数据库后，这里将按班级与学生维度展开。
        </p>

        {allItems.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
            暂无诊断数据，请先以学生视角完成一次基础诊断测评。
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {LAYER_ORDER.map((layer) => (
              <div key={layer}>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${LAYER_META[layer].className}`}
                  >
                    {LAYER_META[layer].name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {grouped[layer].length} 个知识点
                  </span>
                </div>
                {grouped[layer].length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">暂无</p>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs text-slate-500">
                          <th className="py-2 pr-4 font-medium">知识点</th>
                          <th className="py-2 pr-4 font-medium">掌握度</th>
                          <th className="py-2 pr-4 font-medium">对应节</th>
                          <th className="py-2 font-medium">相关题目</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {grouped[layer].map((item) => (
                          <tr key={item.point}>
                            <td className="py-2.5 pr-4 text-slate-800">
                              {item.point}
                            </td>
                            <td className="py-2.5 pr-4 text-slate-600">
                              {Math.round(item.rate * 100)}%（{item.correct}/
                              {item.total}）
                            </td>
                            <td className="py-2.5 pr-4 text-slate-600">
                              {item.sections.length === 0
                                ? "—"
                                : item.sections
                                    .map((s) => s.sectionId.replace(/^s/, ""))
                                    .join("、")}
                            </td>
                            <td className="py-2.5 text-slate-600">
                              {item.questions.length} 题
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

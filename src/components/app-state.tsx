"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  chapters,
  defaultMajors,
  type MajorConfig,
  type SectionResource,
} from "@/content/course";
import { getDefaultResource } from "@/content/resources";
import { defaultQuestions, type Question } from "@/content/questions";
import type { DiagnosticRecord } from "@/lib/diagnostic";
import { DEFAULT_PUSH_RULE, type PushRule } from "@/lib/push";

export type Role = "student" | "teacher";

const LS_MAJORS = "et.majors.v1";
const LS_ACTIVE = "et.activeMajor.v1";
const LS_DONE = "et.completed.v1";
const LS_ROLE = "et.role.v1";
const LS_RESOURCES = "et.resources.v1";
const LS_QUESTIONS = "et.questions.v1";
const LS_DIAGNOSTICS = "et.diagnostics.v1";
const LS_PUSH_RULE = "et.pushRule.v1";

type QuestionBankState = {
  overrides: Record<string, Question>;
  deletes: string[];
  custom: Question[];
};

type AppStateValue = {
  ready: boolean;

  role: Role;
  setRole: (role: Role) => void;

  majors: MajorConfig[];
  activeMajorId: string;
  activeMajor: MajorConfig | undefined;
  setActiveMajorId: (id: string) => void;
  addMajor: (name: string) => void;
  removeMajor: (id: string) => void;
  updateMajor: (id: string, patch: Partial<MajorConfig>) => void;
  toggleChapter: (majorId: string, chapterId: string) => void;
  applyChapterRange: (majorId: string, count: number) => void;
  resetMajors: () => void;

  /** 当前专业可见的章节 id（按教材顺序） */
  visibleChapterIds: string[];

  completedSections: string[];
  toggleSectionDone: (sectionId: string) => void;
  resetProgress: () => void;

  /** 教师端编辑过的资源（未编辑的节使用内置默认内容） */
  resourceOverrides: Record<string, SectionResource>;
  getResource: (sectionId: string) => SectionResource;
  saveResource: (sectionId: string, resource: SectionResource) => void;
  resetResource: (sectionId: string) => void;
  resetAllResources: () => void;

  /** 题库：内置 + 教师端增删改后的结果 */
  questions: Question[];
  questionOverrides: Record<string, Question>;
  questionDeletes: string[];
  customQuestions: Question[];
  saveQuestion: (question: Question) => void;
  deleteQuestion: (id: string) => void;
  resetQuestion: (id: string) => void;
  resetAllQuestions: () => void;

  /** 诊断测评记录（当前按浏览器本地保存） */
  diagnostics: DiagnosticRecord[];
  saveDiagnostic: (record: DiagnosticRecord) => void;
  clearDiagnostics: () => void;

  /** 分层资源推送规则 */
  pushRule: PushRule;
  setPushRule: (patch: Partial<PushRule>) => void;
  resetPushRule: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [role, setRoleState] = useState<Role>("student");
  const [majors, setMajors] = useState<MajorConfig[]>(defaultMajors);
  const [activeMajorId, setActiveMajorIdState] = useState<string>(defaultMajors[0].id);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [resourceOverrides, setResourceOverrides] = useState<
    Record<string, SectionResource>
  >({});
  const [questionBank, setQuestionBank] = useState<QuestionBankState>({
    overrides: {},
    deletes: [],
    custom: [],
  });
  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([]);
  const [pushRule, setPushRuleState] = useState<PushRule>(DEFAULT_PUSH_RULE);

  useEffect(() => {
    try {
      const rawMajors = localStorage.getItem(LS_MAJORS);
      if (rawMajors) {
        const parsed = JSON.parse(rawMajors) as MajorConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) setMajors(parsed);
      }
      const rawActive = localStorage.getItem(LS_ACTIVE);
      if (rawActive) setActiveMajorIdState(rawActive);
      const rawDone = localStorage.getItem(LS_DONE);
      if (rawDone) {
        const parsed = JSON.parse(rawDone) as string[];
        if (Array.isArray(parsed)) setCompletedSections(parsed);
      }
      const rawRole = localStorage.getItem(LS_ROLE);
      if (rawRole === "student" || rawRole === "teacher") setRoleState(rawRole);
      const rawResources = localStorage.getItem(LS_RESOURCES);
      if (rawResources) {
        const parsed = JSON.parse(rawResources) as Record<string, SectionResource>;
        if (parsed && typeof parsed === "object") setResourceOverrides(parsed);
      }
      const rawQuestions = localStorage.getItem(LS_QUESTIONS);
      if (rawQuestions) {
        const parsed = JSON.parse(rawQuestions) as QuestionBankState;
        if (parsed && typeof parsed === "object") {
          setQuestionBank({
            overrides: parsed.overrides ?? {},
            deletes: Array.isArray(parsed.deletes) ? parsed.deletes : [],
            custom: Array.isArray(parsed.custom) ? parsed.custom : [],
          });
        }
      }
      const rawDiagnostics = localStorage.getItem(LS_DIAGNOSTICS);
      if (rawDiagnostics) {
        const parsed = JSON.parse(rawDiagnostics) as DiagnosticRecord[];
        if (Array.isArray(parsed)) setDiagnostics(parsed);
      }
      const rawRule = localStorage.getItem(LS_PUSH_RULE);
      if (rawRule) {
        const parsed = JSON.parse(rawRule) as PushRule;
        if (parsed && typeof parsed === "object") {
          setPushRuleState({ ...DEFAULT_PUSH_RULE, ...parsed });
        }
      }
    } catch {
      // 本地数据损坏时用默认值继续
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_MAJORS, JSON.stringify(majors));
  }, [majors, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_ACTIVE, activeMajorId);
  }, [activeMajorId, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_DONE, JSON.stringify(completedSections));
  }, [completedSections, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_ROLE, role);
  }, [role, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_RESOURCES, JSON.stringify(resourceOverrides));
  }, [resourceOverrides, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_QUESTIONS, JSON.stringify(questionBank));
  }, [questionBank, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_DIAGNOSTICS, JSON.stringify(diagnostics));
  }, [diagnostics, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_PUSH_RULE, JSON.stringify(pushRule));
  }, [pushRule, ready]);

  const questions = useMemo(() => {
    const builtin = defaultQuestions
      .filter((q) => !questionBank.deletes.includes(q.id))
      .map((q) => questionBank.overrides[q.id] ?? q);
    return [...builtin, ...questionBank.custom];
  }, [questionBank]);

  const activeMajor = useMemo(
    () => majors.find((m) => m.id === activeMajorId) ?? majors[0],
    [majors, activeMajorId],
  );

  const visibleChapterIds = useMemo(() => {
    const set = new Set(activeMajor?.chapterIds ?? []);
    return chapters.filter((c) => set.has(c.id)).map((c) => c.id);
  }, [activeMajor]);

  const value: AppStateValue = {
    ready,
    role,
    setRole: setRoleState,
    majors,
    activeMajorId,
    activeMajor,
    setActiveMajorId: setActiveMajorIdState,
    addMajor: (name) =>
      setMajors((prev) => [
        ...prev,
        {
          id: `major-${Date.now().toString(36)}`,
          name: name.trim() || `专业 ${prev.length + 1}`,
          chapterIds: chapters.slice(0, 4).map((c) => c.id),
          level: "B",
          note: "",
        },
      ]),
    removeMajor: (id) => {
      if (majors.length <= 1) return;
      const remaining = majors.filter((m) => m.id !== id);
      setMajors(remaining);
      if (activeMajorId === id) setActiveMajorIdState(remaining[0].id);
    },
    updateMajor: (id, patch) =>
      setMajors((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    toggleChapter: (majorId, chapterId) =>
      setMajors((prev) =>
        prev.map((m) => {
          if (m.id !== majorId) return m;
          const has = m.chapterIds.includes(chapterId);
          const nextIds = has
            ? m.chapterIds.filter((c) => c !== chapterId)
            : chapters.filter(
                (c) => m.chapterIds.includes(c.id) || c.id === chapterId,
              ).map((c) => c.id);
          return { ...m, chapterIds: nextIds };
        }),
      ),
    applyChapterRange: (majorId, count) =>
      setMajors((prev) =>
        prev.map((m) =>
          m.id === majorId
            ? { ...m, chapterIds: chapters.slice(0, count).map((c) => c.id) }
            : m,
        ),
      ),
    resetMajors: () => {
      setMajors(defaultMajors);
      setActiveMajorIdState(defaultMajors[0].id);
    },
    visibleChapterIds,
    completedSections,
    toggleSectionDone: (sectionId) =>
      setCompletedSections((prev) =>
        prev.includes(sectionId)
          ? prev.filter((s) => s !== sectionId)
          : [...prev, sectionId],
      ),
    resetProgress: () => setCompletedSections([]),
    resourceOverrides,
    getResource: (sectionId) =>
      resourceOverrides[sectionId] ?? getDefaultResource(sectionId),
    saveResource: (sectionId, resource) =>
      setResourceOverrides((prev) => ({ ...prev, [sectionId]: resource })),
    resetResource: (sectionId) =>
      setResourceOverrides((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      }),
    resetAllResources: () => setResourceOverrides({}),
    questions,
    questionOverrides: questionBank.overrides,
    questionDeletes: questionBank.deletes,
    customQuestions: questionBank.custom,
    saveQuestion: (question) =>
      setQuestionBank((prev) => {
        const isCustom = prev.custom.some((q) => q.id === question.id);
        if (isCustom) {
          return {
            ...prev,
            custom: prev.custom.map((q) => (q.id === question.id ? question : q)),
          };
        }
        return {
          ...prev,
          overrides: { ...prev.overrides, [question.id]: question },
          deletes: prev.deletes.filter((id) => id !== question.id),
        };
      }),
    deleteQuestion: (id) =>
      setQuestionBank((prev) => ({
        overrides: prev.overrides,
        deletes: prev.custom.some((q) => q.id === id)
          ? prev.deletes
          : [...prev.deletes, id],
        custom: prev.custom.filter((q) => q.id !== id),
      })),
    resetQuestion: (id) =>
      setQuestionBank((prev) => {
        const overrides = { ...prev.overrides };
        delete overrides[id];
        return {
          ...prev,
          overrides,
          deletes: prev.deletes.filter((x) => x !== id),
        };
      }),
    resetAllQuestions: () =>
      setQuestionBank({ overrides: {}, deletes: [], custom: [] }),
    diagnostics,
    saveDiagnostic: (record) =>
      setDiagnostics((prev) => [record, ...prev].slice(0, 50)),
    clearDiagnostics: () => setDiagnostics([]),
    pushRule,
    setPushRule: (patch) => setPushRuleState((prev) => ({ ...prev, ...patch })),
    resetPushRule: () => setPushRuleState(DEFAULT_PUSH_RULE),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState 必须在 AppStateProvider 内使用");
  return ctx;
}

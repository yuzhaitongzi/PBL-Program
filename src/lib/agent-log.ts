"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const AGENT_LOG_KEY = "et.agent.log.v1";

export type AgentQuestion = {
  id: string;
  text: string;
  at: number;
  /** 学生主动提问发生的位置 */
  scope: "chat";
};

export function loadAgentQuestions(): AgentQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AGENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AgentQuestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: AgentQuestion[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AGENT_LOG_KEY, JSON.stringify(items.slice(0, 300)));
}

/** 记录学生向智能体提出的问题，供教师端分析 */
export function useAgentLog() {
  const [items, setItems] = useState<AgentQuestion[]>([]);
  const [ready, setReady] = useState(false);
  const ref = useRef<AgentQuestion[]>([]);

  useEffect(() => {
    const initial = loadAgentQuestions();
    ref.current = initial;
    setItems(initial);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === AGENT_LOG_KEY || e.key === null) {
        const next = loadAgentQuestions();
        ref.current = next;
        setItems(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const append = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    const next: AgentQuestion[] = [
      {
        id: `aq-${Date.now().toString(36)}`,
        text: t,
        at: Date.now(),
        scope: "chat" as const,
      },
      ...ref.current,
    ].slice(0, 300);
    ref.current = next;
    save(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    ref.current = [];
    save([]);
    setItems([]);
  }, []);

  return { items, ready, append, clear };
}

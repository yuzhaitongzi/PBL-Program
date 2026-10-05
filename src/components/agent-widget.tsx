"use client";

import { AgentPanel } from "@/components/agent-panel";
import { useAgentLog } from "@/lib/agent-log";
import { AGENT_NAME, COMMON_QUESTIONS } from "@/lib/agent";

/** 学生端：电工技术助教 */
export function AgentWidget() {
  const { append } = useAgentLog();

  return (
    <AgentPanel
      title={AGENT_NAME}
      greeting="你好，我是《电工技术》课程的助教。概念、公式、例题、解题思路都可以问我。"
      hint="我会尽量引导你自己推导，而不是直接给答案；想直接看解法也可以跟我说。"
      suggestionsPool={COMMON_QUESTIONS}
      accent="blue"
      endpoint="/api/chat"
      onAsk={append}
    />
  );
}

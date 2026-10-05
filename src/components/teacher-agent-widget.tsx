"use client";

import { AgentPanel, type Msg } from "@/components/agent-panel";
import { useAgentLog } from "@/lib/agent-log";
import { TEACHER_AGENT_NAME, TEACHER_QUESTIONS } from "@/lib/agent";
import { useAppState } from "@/components/app-state";
import { useHomeworkBoard } from "@/lib/homework";
import { useTaskBoard } from "@/lib/task";
import { buildTeachingDigest } from "@/lib/teaching-digest";

/** 教师端：教学助理，可读取本机学情数据 */
export function TeacherAgentWidget() {
  const { activeMajor, diagnostics } = useAppState();
  const { items: chatQuestions } = useAgentLog();
  const { board: taskBoard } = useTaskBoard();
  const { board: homeworkBoard } = useHomeworkBoard();

  function buildBody(messages: Msg[]) {
    const digest = buildTeachingDigest({
      major: activeMajor?.name ?? "未指定专业",
      chatQuestions: chatQuestions.map((q) => ({ at: q.at, text: q.text })),
      previewQuestions: taskBoard.questions.map((q) => ({
        at: q.at,
        text: q.text,
      })),
      homeworks: homeworkBoard.homeworks.map((h) => ({
        title: h.title,
        items: h.items.map((i) => ({
          questionId: i.questionId,
          stem: i.stem,
          points: i.points,
        })),
      })),
      submissions: homeworkBoard.submissions.map((s) => ({
        homeworkId: s.homeworkId,
        homeworkTitle:
          homeworkBoard.homeworks.find((h) => h.id === s.homeworkId)?.title ??
          "未知作业",
        submittedAt: s.submittedAt,
        score: s.score,
        total: s.total,
        results: s.results.map((r) => ({
          questionId: r.questionId,
          correct: r.correct,
          errorKind: r.errorKind,
        })),
      })),
      diagnosticItems: diagnostics.flatMap((d) =>
        d.items.map((i) => ({ points: i.points, correct: i.correct })),
      ),
      practice: homeworkBoard.practice.map((p) => ({
        point: p.point,
        score: p.score,
        total: p.total,
      })),
    });
    return { messages, digest };
  }

  return (
    <AgentPanel
      title={TEACHER_AGENT_NAME}
      greeting="我是《电工技术》课程的教学助理。可以帮你归纳学生提问、定位易错点和薄弱知识点、找出错得最多的题，并给出备课与讲评建议。"
      hint="我依据的是本机采集到的学情数据；数据很少时会提醒你样本量不足。"
      suggestionsPool={TEACHER_QUESTIONS}
      accent="slate"
      endpoint="/api/teacher-chat"
      buildBody={buildBody}
    />
  );
}

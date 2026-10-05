import { TeacherAgentWidget } from "@/components/teacher-agent-widget";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <TeacherAgentWidget />
    </>
  );
}

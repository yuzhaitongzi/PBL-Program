import { AgentWidget } from "@/components/agent-widget";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AgentWidget />
    </>
  );
}

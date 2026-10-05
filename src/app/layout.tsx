import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/components/app-state";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "电工技术 · 三旋翼 PBL 智能教学平台",
  description:
    "上海工程技术大学《电工技术》课程模块化与三旋翼 PBL 智能体教学平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">
        <AppStateProvider>
          <SiteNav />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </AppStateProvider>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppState } from "@/components/app-state";

const links = [
  { href: "/", label: "首页" },
  { href: "/student", label: "学生端" },
  { href: "/teacher", label: "教师端" },
  { href: "/courses", label: "课程关系图" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { role, setRole } = useAppState();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="三旋翼"
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <span className="text-sm font-semibold text-slate-900">电工技术 · PBL 智能教学平台</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 transition ${
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-xs">
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-md px-3 py-1.5 transition ${
                role === r ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {r === "student" ? "学生视角" : "教师视角"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

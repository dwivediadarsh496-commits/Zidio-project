"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Sparkles,
  FileBarChart,
  Settings,
  LogOut,
  Building2,
  Layers,
  ChevronRight,
} from "lucide-react";
import { RoleBadge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Analytics & KPIs" },
  { href: "/inbox", label: "Feedback Inbox", icon: Inbox, description: "Manage & Filter" },
  { href: "/trends", label: "Theme Trends", icon: TrendingUp, description: "Clustering & Trajectory" },
  { href: "/ask", label: "Ask LOOP", icon: Sparkles, description: "Grounded AI Q&A", highlight: true },
  { href: "/reports", label: "VoC Reports", icon: FileBarChart, description: "Executive Summaries" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Team & Workspace" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user as any;
  const role = user?.role || "VIEWER";
  const workspaceName = user?.workspaceName || "Acme Cloud AI";

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0d121f] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                LOOP
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
              Close the loop on feedback
            </p>
          </div>
        </Link>

        {/* Active Workspace Pill */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200 truncate">
              {workspaceName}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Intelligence
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600/15 text-white border border-indigo-500/30 shadow-sm shadow-indigo-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-md ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-sm"
                      : item.highlight
                      ? "text-cyan-400 group-hover:text-cyan-300"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={isActive ? "text-indigo-200 font-semibold" : ""}>
                      {item.label}
                    </span>
                    {item.highlight && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? "text-indigo-400 translate-x-0.5" : "text-transparent group-hover:text-slate-500"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="px-2 py-2 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.name || "Elena Rostova"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || "admin@loop-demo.com"}
            </p>
            <div className="mt-1.5">
              <RoleBadge role={role} />
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out of LOOP"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

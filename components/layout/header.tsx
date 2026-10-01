"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  PlusCircle,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { RoleBadge } from "@/components/ui/badge";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Analytics Dashboard", subtitle: "Real-time volume, sentiment breakdown & top themes" },
  "/inbox": { title: "Feedback Inbox", subtitle: "Search, filter, classify & action customer feedback items" },
  "/trends": { title: "Theme Trends & Clustering", subtitle: "AI theme grouping and trajectory vs previous cycle" },
  "/ask": { title: "Ask LOOP — Grounded Intelligence", subtitle: "Natural-language Q&A backed by semantic vector search" },
  "/reports": { title: "Voice-of-Customer Reports", subtitle: "Executive-grade intelligence reports and narrative synthesis" },
  "/settings": { title: "Workspace & Team Settings", subtitle: "Manage organization, RBAC member roles and system preferences" },
};

export function Header({
  onOpenManualEntry,
  onOpenCsvUpload,
  onRefresh,
}: {
  onOpenManualEntry?: () => void;
  onOpenCsvUpload?: () => void;
  onRefresh?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || "VIEWER";
  const isViewer = role === "VIEWER";

  const [simulating, setSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const currentInfo = PAGE_TITLES[pathname] || {
    title: "Project LOOP",
    subtitle: "AI Customer-Feedback Intelligence Platform",
  };

  const handleSimulate = async (channel: string) => {
    if (isViewer) {
      setToastMessage({ text: "Viewer role is read-only. Cannot ingest simulated data.", type: "error" });
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      setSimulating(true);
      const res = await fetch("/api/feedback/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "simulated",
          simulatedChannel: channel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      setToastMessage({
        text: `✓ ${data.message}`,
        type: "success",
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setToastMessage({ text: err.message || "Failed to simulate channel", type: "error" });
    } finally {
      setSimulating(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <header className="h-18 border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {currentInfo.title}
        </h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          {currentInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Toast alert */}
        {toastMessage && (
          <div
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <span className="font-medium truncate max-w-xs">{toastMessage.text}</span>
          </div>
        )}

        {/* Simulated Channels Dropdown */}
        <div className="relative group">
          <button
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Channel</span>
          </button>
          <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Ingestion (Demo)
            </div>
            <button
              onClick={() => handleSimulate("Support Ticket")}
              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>+ Support Tickets</span>
              <span className="text-[10px] text-slate-400">5 items</span>
            </button>
            <button
              onClick={() => handleSimulate("App Store Review")}
              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>+ App Reviews</span>
              <span className="text-[10px] text-slate-400">5 items</span>
            </button>
            <button
              onClick={() => handleSimulate("NPS Survey")}
              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>+ NPS Responses</span>
              <span className="text-[10px] text-slate-400">5 items</span>
            </button>
          </div>
        </div>

        {/* CSV Upload Quick Button */}
        {onOpenCsvUpload && (
          <button
            onClick={onOpenCsvUpload}
            disabled={isViewer}
            title={isViewer ? "Viewer access is read-only" : "Upload CSV file"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Bulk CSV</span>
          </button>
        )}

        {/* Manual Feedback Ingestion Button */}
        {onOpenManualEntry && (
          <button
            onClick={onOpenManualEntry}
            disabled={isViewer}
            title={isViewer ? "Viewer access is read-only" : "Add customer feedback"}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Feedback</span>
          </button>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh active view"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="pl-2 border-l border-slate-800">
          <RoleBadge role={role} />
        </div>
      </div>
    </header>
  );
}

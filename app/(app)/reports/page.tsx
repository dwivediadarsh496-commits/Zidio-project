"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileBarChart,
  PlusCircle,
  Calendar,
  Printer,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Quote,
  CheckCircle2,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Target,
} from "lucide-react";
import { SentimentBadge, ChannelBadge } from "@/components/ui/badge";

export default function ReportsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || "VIEWER";
  const isViewer = role === "VIEWER";
  const isAdmin = role === "ADMIN";

  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // Generator form
  const [period, setPeriod] = useState<"7d" | "30d" | "custom">("30d");
  const [reportTitle, setReportTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.data) {
        setReports(json.data);
        if (json.data.length > 0 && !selectedReport) {
          loadReportDetail(json.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      const json = await res.json();
      if (json.data) {
        setSelectedReport(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    try {
      setGenerating(true);
      setError(null);

      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          title: reportTitle.trim() || undefined,
          startDate: period === "custom" ? startDate : undefined,
          endDate: period === "custom" ? endDate : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate VoC report");

      setIsGeneratorOpen(false);
      setReportTitle("");
      await fetchReports();
      if (json.data) {
        loadReportDetail(json.data.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate VoC report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedReport?.id === id) setSelectedReport(null);
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const content = selectedReport?.content;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Bar (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <FileBarChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Voice-of-Customer Reports</h2>
            <p className="text-xs text-slate-400">
              Real calculated statistics synthesized into executive intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedReport && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF / Print</span>
            </button>
          )}

          <button
            onClick={() => setIsGeneratorOpen(true)}
            disabled={isViewer}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Saved Reports List & Active Report Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Saved Reports Archive (hidden in print) */}
        <div className="no-print lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider">Report Archive</span>
            <span>{reports.length} Reports</span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading report library...
              </div>
            ) : reports.length === 0 ? (
              <div className="p-6 rounded-2xl glass-panel text-center text-xs text-slate-400">
                No reports generated yet. Click "Generate New Report" to create your first VoC report.
              </div>
            ) : (
              reports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => loadReportDetail(r.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/40 shadow-md"
                        : "glass-panel hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-xs font-bold line-clamp-2 ${
                          isSelected ? "text-indigo-200" : "text-slate-200 group-hover:text-white"
                        }`}
                      >
                        {r.title}
                      </h4>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(r.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="truncate">{r.generatedBy}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Printable Executive Report Document */}
        <div className="lg:col-span-8">
          {selectedReport && content ? (
            <div className="p-8 sm:p-10 rounded-2xl glass-panel print-page border border-slate-800 space-y-8 bg-[#0f172a] shadow-2xl">
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Voice-of-Customer Intelligence
                    </span>
                    <span className="text-xs text-slate-400">
                      Generated by {selectedReport.generatedBy}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      Period: {new Date(selectedReport.periodStart).toLocaleDateString()} —{" "}
                      {new Date(selectedReport.periodEnd).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  1. Executive Summary
                </h3>
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {content.executiveSummary}
                </div>
              </div>

              {/* 2. Top Customer Themes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  2. Top Customer Themes & Trajectory
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.topCustomerThemes?.map((theme: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{theme.name}</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            theme.trend === "Increasing"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              : theme.trend === "Decreasing"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-700/30 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {theme.trend} ({theme.count})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{theme.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Sentiment Breakdown & Shift */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  3. Sentiment Distribution & Period Shift
                </h3>
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-semibold block uppercase">Positive</span>
                    <span className="text-2xl font-extrabold text-white">
                      {content.sentimentAnalysis?.positivePercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Neutral</span>
                    <span className="text-2xl font-extrabold text-white">
                      {content.sentimentAnalysis?.neutralPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-rose-400 font-semibold block uppercase">Negative</span>
                    <span className="text-2xl font-extrabold text-white">
                      {content.sentimentAnalysis?.negativePercent}%
                    </span>
                  </div>
                  <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                    <span className="text-[11px] text-indigo-400 font-semibold block uppercase">Cycle Shift</span>
                    <span className="text-sm font-bold text-slate-200">
                      {content.sentimentAnalysis?.sentimentShift || "Stable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Important Customer Quotes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  4. Important Customer Quotes
                </h3>
                <div className="space-y-2.5">
                  {content.importantCustomerQuotes?.map((quote: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                    >
                      <Quote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-200 italic font-sans">"{quote.quote}"</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <ChannelBadge channel={quote.channel} />
                          {quote.customerLabel && (
                            <span className="font-semibold text-slate-300">
                              {quote.customerLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Key Customer Problems */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  5. Key Customer Problems & Friction Points
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {content.keyCustomerProblems?.map((prob: string, idx: number) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{prob}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Recommended Actions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  6. Recommended Action Plan
                </h3>
                <div className="space-y-2.5">
                  {content.recommendedActions?.map((act: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{act.action}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.priority === "HIGH"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {act.priority} PRIORITY
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Owner: <strong className="text-slate-300">{act.owner}</strong></span>
                        <span className="text-emerald-400">{act.expectedImpact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-2xl glass-panel text-center text-slate-400">
              <FileBarChart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Select a report to view</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose an existing report from the archive or generate a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Generate VoC Report</h3>
                  <p className="text-xs text-slate-400">Calculates real statistics and writes narrative</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Executive VoC Intelligence — October 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Time Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPeriod("7d")}
                    className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                      period === "7d"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("30d")}
                    className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                      period === "30d"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("custom")}
                    className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                      period === "custom"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    Custom Period
                  </button>
                </div>
              </div>

              {period === "custom" && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Report...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate VoC Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

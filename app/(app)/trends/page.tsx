"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  ArrowRight,
  Calendar,
  Loader2,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { SentimentBadge, ChannelBadge } from "@/components/ui/badge";

export default function TrendsPage() {
  const [trendsData, setTrendsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);

  // Drill-down theme state
  const [selectedTheme, setSelectedTheme] = useState<any | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<any[]>([]);
  const [loadingDrill, setLoadingDrill] = useState(false);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/themes/trends?days=${days}`);
      const json = await res.json();
      setTrendsData(json);
    } catch (err) {
      console.error("Trends fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [days]);

  const handleDrillDown = async (theme: any) => {
    setSelectedTheme(theme);
    try {
      setLoadingDrill(true);
      const res = await fetch(`/api/themes/${theme.id}/feedback?limit=25`);
      const json = await res.json();
      setDrillFeedback(json.data || []);
    } catch (err) {
      console.error("Theme drill-down error:", err);
    } finally {
      setLoadingDrill(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Theme Clustering & Trajectory</h2>
            <p className="text-xs text-slate-400">
              Detect recurring patterns and compare volume vs prior period
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Comparison Window:</span>
          <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-700">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                days === 7 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(14)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                days === 14 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                days === 30 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {loading && !trendsData ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm">Calculating theme trajectory and period deltas...</p>
        </div>
      ) : (
        <>
          {/* Theme Trends Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendsData?.themes?.map((theme: any) => {
              const isIncreasing = theme.trend === "Increasing";
              const isDecreasing = theme.trend === "Decreasing";

              return (
                <div
                  key={theme.id}
                  onClick={() => handleDrillDown(theme)}
                  className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer border border-slate-800 hover:border-indigo-500/40 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.color }}
                        ></span>
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {theme.name}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isIncreasing
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            : isDecreasing
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-700/30 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {isIncreasing && <TrendingUp className="w-3 h-3" />}
                        {isDecreasing && <TrendingDown className="w-3 h-3" />}
                        {!isIncreasing && !isDecreasing && <Minus className="w-3 h-3" />}
                        <span>{theme.trend}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {theme.description || "Recurring topics and customer sentiment discussions."}
                    </p>

                    {/* Period Comparison Stats */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Current Window</span>
                        <span className="text-lg font-bold text-white">{theme.currentPeriodCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Previous Window</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-slate-400">{theme.previousPeriodCount}</span>
                          <span
                            className={`text-[11px] font-semibold ${
                              theme.percentageChange > 0
                                ? "text-rose-400"
                                : theme.percentageChange < 0
                                ? "text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {theme.percentageChange > 0 ? `+${theme.percentageChange}%` : `${theme.percentageChange}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 group-hover:text-indigo-300">
                    <span className="font-medium">Drill down ({theme.totalCount} items)</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theme Drill-Down Modal / Drawer */}
          {selectedTheme && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: selectedTheme.color }}
                    ></span>
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedTheme.name}</h3>
                      <p className="text-xs text-slate-400">
                        Theme Drill-Down • Showing {drillFeedback.length} items
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTheme(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Feedback List */}
                <div className="p-6 space-y-3 overflow-y-auto flex-1">
                  {loadingDrill ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span className="text-xs">Fetching feedback for {selectedTheme.name}...</span>
                    </div>
                  ) : drillFeedback.length === 0 ? (
                    <p className="text-center py-8 text-sm text-slate-400">
                      No feedback currently assigned to this theme.
                    </p>
                  ) : (
                    drillFeedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <ChannelBadge channel={fb.channel} />
                            {fb.customerLabel && (
                              <span className="text-slate-300 font-medium">{fb.customerLabel}</span>
                            )}
                          </div>
                          <SentimentBadge sentiment={fb.sentiment} score={fb.sentimentScore} />
                        </div>
                        <p className="text-sm text-slate-200 font-sans leading-relaxed">
                          "{fb.content}"
                        </p>
                        {fb.rationale && (
                          <p className="text-[11px] text-slate-400 italic">
                            AI Note: {fb.rationale}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900/50">
                  <button
                    onClick={() => setSelectedTheme(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    Close Drill-Down
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

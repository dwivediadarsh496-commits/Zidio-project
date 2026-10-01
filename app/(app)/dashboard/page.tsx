"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Smile,
  Frown,
  Meh,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const CHANNELS = [
  "ALL",
  "Support Ticket",
  "App Store Review",
  "NPS Survey",
  "Sales Call",
  "Community Post",
];

const SENTIMENTS = ["ALL", "POS", "NEU", "NEG"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState("ALL");
  const [sentiment, setSentiment] = useState("ALL");
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        days: days.toString(),
        channel,
        sentiment,
      });
      const res = await fetch(`/api/analytics?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [channel, sentiment, days]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Filter Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Analytics Controls</h2>
            <p className="text-[11px] text-slate-400">Filter data across channels, sentiment, and time periods</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Channel selector */}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Channels</option>
            {CHANNELS.filter((c) => c !== "ALL").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sentiment selector */}
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POS">Positive Only</option>
            <option value="NEU">Neutral Only</option>
            <option value="NEG">Negative Only</option>
          </select>

          {/* Time range */}
          <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-700">
            <button
              onClick={() => setDays(7)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                days === 7 ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDays(14)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                days === 14 ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              14D
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                days === 30 ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              30D
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm">Calculating real-time analytics & intelligence metrics...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Feedback */}
            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Feedback
                </span>
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {data?.kpis?.totalFeedback ?? 0}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Across selected filters
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>

            {/* Negative % */}
            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 block mb-1">
                  Negative Friction %
                </span>
                <span className="text-3xl font-extrabold text-rose-300 tracking-tight">
                  {data?.kpis?.negativePercent ?? 0}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  High-priority attention
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* New This Week */}
            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-1">
                  New This Week
                </span>
                <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
                  {data?.kpis?.newThisWeek ?? 0}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Awaiting review status
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Average Sentiment Score */}
            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
                  Sentiment Index
                </span>
                <span className="text-3xl font-extrabold text-emerald-300 tracking-tight">
                  {data?.kpis?.avgSentimentScore > 0
                    ? `+${data?.kpis?.avgSentimentScore}`
                    : data?.kpis?.avgSentimentScore ?? 0}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Scale: -1.0 to +1.0
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row 1: Volume Over Time & Sentiment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feedback Volume Over Time */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Feedback Volume Over Time</h3>
                  <p className="text-xs text-slate-400">Daily intake velocity categorized by sentiment</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Positive
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Neutral
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Negative
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.charts?.volumeTimeline || []}>
                    <defs>
                      <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                        color: "#f8fafc",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Volume"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#volGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="p-6 rounded-2xl glass-panel flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white">Sentiment Breakdown</h3>
                <p className="text-xs text-slate-400">Distribution across active dataset</p>
              </div>

              <div className="h-56 w-full flex-1 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.charts?.sentimentBreakdown || []}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data?.charts?.sentimentBreakdown?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Pos</span>
                  <span className="text-sm font-bold text-white">{data?.kpis?.positivePercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-500/10">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Neu</span>
                  <span className="text-sm font-bold text-white">{data?.kpis?.neutralPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <span className="text-[10px] text-rose-400 font-semibold uppercase block">Neg</span>
                  <span className="text-sm font-bold text-white">{data?.kpis?.negativePercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Top Themes */}
          <div className="p-6 rounded-2xl glass-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Top Customer Themes</h3>
                <p className="text-xs text-slate-400">Most frequent recurring topics detected across all feedback</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.charts?.topThemes || []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#475569" fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={150}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Bar dataKey="count" name="Feedback Count" radius={[0, 8, 8, 0]}>
                    {data?.charts?.topThemes?.map((entry: any, index: number) => (
                      <Cell key={`bar-${index}`} fill={entry.color || "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

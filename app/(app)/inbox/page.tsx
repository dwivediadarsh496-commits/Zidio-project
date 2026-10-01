"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Building,
  RotateCw,
  SlidersHorizontal,
  Loader2,
  Calendar,
} from "lucide-react";
import { SentimentBadge, StatusBadge, ChannelBadge } from "@/components/ui/badge";
import { FeedbackDetailModal } from "@/components/feedback/feedback-detail-modal";

const CHANNELS = [
  "ALL",
  "Support Ticket",
  "App Store Review",
  "NPS Survey",
  "Sales Call",
  "Community Post",
];

const STATUSES = ["ALL", "NEW", "REVIEWED", "ACTIONED"];
const SENTIMENTS = ["ALL", "POS", "NEU", "NEG"];

export default function InboxPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || "VIEWER";
  const isViewer = role === "VIEWER";

  // State
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("ALL");
  const [sentiment, setSentiment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [themeId, setThemeId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Detail Modal
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load themes for filter dropdown
  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setThemes(res.data);
      })
      .catch(console.error);
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (channel !== "ALL") params.set("channel", channel);
      if (sentiment !== "ALL") params.set("sentiment", sentiment);
      if (status !== "ALL") params.set("status", status);
      if (themeId !== "ALL") params.set("themeId", themeId);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setFeedbackList(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Fetch feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, pageSize, channel, sentiment, status, themeId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFeedback();
  };

  const handleInlineStatusChange = async (feedbackId: string, newStatus: string) => {
    if (isViewer) return;
    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setFeedbackList((prev) =>
          prev.map((item) => (item.id === feedbackId ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Inline status update error:", err);
    }
  };

  const openDetail = (item: any) => {
    setSelectedFeedback(item);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        {/* Row 1: Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback content, customer name, source ref, or feature area..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Search
          </button>
        </form>

        {/* Row 2: Granular Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Channel */}
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Channels</option>
            {CHANNELS.filter((c) => c !== "ALL").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sentiment */}
          <select
            value={sentiment}
            onChange={(e) => {
              setSentiment(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          {/* Theme */}
          <select
            value={themeId}
            onChange={(e) => {
              setThemeId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[180px] truncate"
          >
            <option value="ALL">All Themes</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="ACTIONED">ACTIONED</option>
          </select>

          {(search || channel !== "ALL" || sentiment !== "ALL" || status !== "ALL" || themeId !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setChannel("ALL");
                setSentiment("ALL");
                setStatus("ALL");
                setThemeId("ALL");
                setPage(1);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Feedback Content</th>
                <th className="py-3 px-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Sentiment</th>
                <th className="py-3 px-4 font-semibold">Theme</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span className="text-xs">Loading feedback items...</span>
                    </div>
                  </td>
                </tr>
              ) : feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">No customer feedback found</p>
                      <p className="text-xs text-slate-500">Try adjusting your active filters or import new feedback.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbackList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => openDetail(item)}
                  >
                    {/* Content & Rationale */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-medium text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                        {item.content}
                      </p>
                      {item.featureArea && (
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Area: <span className="text-slate-300">{item.featureArea}</span>
                        </span>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ChannelBadge channel={item.channel} />
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.customerLabel ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.customerLabel}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Sentiment */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                    </td>

                    {/* Theme */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {item.themes && item.themes.length > 0 ? (
                          item.themes.map((ft: any) => (
                            <span
                              key={ft.id}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate"
                            >
                              {ft.theme?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Inline Status Dropdown */}
                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={item.status}
                        disabled={isViewer}
                        onChange={(e) => handleInlineStatusChange(item.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border focus:outline-none transition-colors ${
                          item.status === "NEW"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : item.status === "REVIEWED"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        } ${isViewer ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="REVIEWED">REVIEWED</option>
                        <option value="ACTIONED">ACTIONED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(item);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                        title="View details & AI rationale"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-200">
              {pagination.total > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-200">
              {Math.min(page * pageSize, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-slate-200">{pagination.total}</span> feedback items
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-2">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>

            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-300">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={() => {
          fetchFeedback();
          setIsDetailOpen(false);
        }}
      />
    </div>
  );
}

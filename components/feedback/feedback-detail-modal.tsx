"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  X,
  Sparkles,
  RotateCw,
  Trash2,
  Calendar,
  Building,
  Hash,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SentimentBadge, StatusBadge, ChannelBadge } from "@/components/ui/badge";

export function FeedbackDetailModal({
  feedback,
  isOpen,
  onClose,
  onUpdated,
}: {
  feedback: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || "VIEWER";
  const isViewer = role === "VIEWER";
  const isAdmin = role === "ADMIN";

  const [loadingAction, setLoadingAction] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);

  if (!isOpen || !feedback) return null;

  const handleStatusChange = async (newStatus: "NEW" | "REVIEWED" | "ACTIONED") => {
    if (isViewer) return;
    try {
      setLoadingAction(true);
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReclassify = async () => {
    if (isViewer) return;
    try {
      setReclassifying(true);
      const res = await fetch(`/api/feedback/${feedback.id}/reclassify`, {
        method: "POST",
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReclassifying(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to permanently delete this feedback item?")) return;
    try {
      setLoadingAction(true);
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Score position for the visual gauge (-1 to +1 normalized to 0 to 100%)
  const scorePercent = Math.round(((feedback.sentimentScore + 1) / 2) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ChannelBadge channel={feedback.channel} />
            <StatusBadge status={feedback.status} />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-2 border-b border-slate-800">
            {feedback.customerLabel && (
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-200 font-semibold">{feedback.customerLabel}</span>
              </div>
            )}
            {feedback.sourceRef && (
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{feedback.sourceRef}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Feedback Content */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Customer Feedback
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 leading-relaxed font-sans shadow-inner">
              "{feedback.content}"
            </div>
          </div>

          {/* AI Intelligence Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900/80 border border-indigo-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  AI Intelligence & Classification
                </h4>
              </div>

              {!isViewer && (
                <button
                  onClick={handleReclassify}
                  disabled={reclassifying}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${reclassifying ? "animate-spin" : ""}`} />
                  <span>{reclassifying ? "Re-classifying..." : "Re-classify"}</span>
                </button>
              )}
            </div>

            {/* Sentiment & Gauge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Detected Sentiment</span>
                <SentimentBadge sentiment={feedback.sentiment} score={feedback.sentimentScore} />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Sentiment Score</span>
                  <span className="font-mono text-slate-300">{feedback.sentimentScore > 0 ? `+${feedback.sentimentScore}` : feedback.sentimentScore}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      feedback.sentiment === "POS"
                        ? "bg-emerald-500"
                        : feedback.sentiment === "NEG"
                        ? "bg-rose-500"
                        : "bg-slate-400"
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Themes and Feature Area */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Classified Theme(s)</span>
                <div className="flex flex-wrap gap-1.5">
                  {feedback.themes && feedback.themes.length > 0 ? (
                    feedback.themes.map((ft: any) => (
                      <span
                        key={ft.id || ft.theme?.id}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {ft.theme?.name || "Theme"}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None assigned</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Feature Area</span>
                <span className="font-medium text-slate-200">
                  {feedback.featureArea || "General Experience"}
                </span>
              </div>
            </div>

            {/* Rationale */}
            {feedback.rationale && (
              <div className="pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-[11px] text-slate-400 block mb-1">AI Rationale</span>
                <p className="text-slate-300 italic">
                  "{feedback.rationale}"
                </p>
              </div>
            )}
          </div>

          {/* Status Workflow Section */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workflow Status
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={isViewer || loadingAction}
                onClick={() => handleStatusChange("NEW")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  feedback.status === "NEW"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
              >
                Mark as NEW
              </button>
              <button
                disabled={isViewer || loadingAction}
                onClick={() => handleStatusChange("REVIEWED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  feedback.status === "REVIEWED"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
              >
                Mark as REVIEWED
              </button>
              <button
                disabled={isViewer || loadingAction}
                onClick={() => handleStatusChange("ACTIONED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  feedback.status === "ACTIONED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
              >
                Mark as ACTIONED
              </button>
            </div>
            {isViewer && (
              <p className="text-[11px] text-slate-400 italic">
                Viewer role has read-only access. Status modifications are disabled.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div>
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={loadingAction}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Feedback</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Quote,
  Building,
  ArrowRight,
} from "lucide-react";
import { SentimentBadge, ChannelBadge } from "@/components/ui/badge";

const SUGGESTED_QUESTIONS = [
  "What are users saying about onboarding?",
  "What are the biggest customer complaints?",
  "Which features are requested most often?",
  "Why is negative sentiment increasing in billing?",
  "What are customers saying about pricing?",
  "How do customers rate support response time?",
];

export default function AskLoopPage() {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<{
    question: string;
    answer: string;
    evidence: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || q.length < 3) return;

    try {
      setAsking(true);
      setError(null);
      setQuestion(q);

      const res = await fetch("/api/insights/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate answer");

      setResult(json);
    } catch (err: any) {
      setError(err.message || "Failed to ask question");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Grounded Natural-Language Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Ask LOOP Anything
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Query thousands of customer voices in plain English. Answers are strictly grounded in retrieved feedback evidence.
        </p>
      </div>

      {/* Query Input Box */}
      <div className="p-2.5 rounded-2xl glass-panel shadow-2xl border border-indigo-500/30 focus-within:border-indigo-500 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <div className="pl-3 text-slate-400">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about onboarding, bugs, pricing, feature requests, or support..."
            className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {asking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>Ask LOOP</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
          Suggested Explorations
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Grounded Result */}
      {result && (
        <div className="space-y-6 pt-4">
          {/* Answer Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#131b2e] via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Grounded AI Synthesis</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Backed by {result.evidence?.length || 0} retrieved customer items
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
              {result.answer}
            </div>
          </div>

          {/* Supporting Evidence Cards */}
          {result.evidence && result.evidence.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Supporting Feedback Citations</span>
                </h3>
                <span className="text-[11px] text-slate-400">Ranked by Cosine Similarity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.evidence.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ChannelBadge channel={item.channel} />
                        {item.customerLabel && (
                          <div className="flex items-center gap-1 text-slate-300 font-medium">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{item.customerLabel}</span>
                          </div>
                        )}
                      </div>
                      <SentimentBadge sentiment={item.sentiment} />
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      "{item.content}"
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Area: {item.featureArea || "General"}</span>
                      {item.similarityScore && (
                        <span className="font-mono text-cyan-400 font-semibold">
                          Match: {Math.round(item.similarityScore * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

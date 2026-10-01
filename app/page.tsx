import Link from "next/link";
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox,
  FileBarChart,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Database,
  Quote,
  LineChart,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">LOOP</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0 Corporate
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Close the loop on customer feedback</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-5xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI-Powered Customer Feedback Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Transform Scattered Feedback Into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
            Actionable Intelligence
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-sans leading-relaxed">
          Stop manually reading thousands of tickets, reviews, and surveys. Project LOOP centralizes multi-channel feedback, detects emerging themes and trends, provides grounded conversational answers, and synthesizes executive Voice-of-Customer reports.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>Explore Demo Workspaces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Create New Workspace
          </Link>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div className="pt-6">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl glass-panel text-xs text-slate-400 border border-slate-800">
            <span className="font-semibold text-slate-200">Instant Demo Access:</span>
            <span>Admin: <strong className="text-purple-300 font-mono">admin@loop-demo.com</strong></span>
            <span>•</span>
            <span>Analyst: <strong className="text-indigo-300 font-mono">analyst@loop-demo.com</strong></span>
            <span>•</span>
            <span>Viewer: <strong className="text-slate-300 font-mono">viewer@loop-demo.com</strong></span>
            <span className="text-slate-500 font-mono">(pw: [role]1234)</span>
          </div>
        </div>
      </section>

      {/* Architecture Flow Diagram Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              End-to-End Intelligence Pipeline
            </h2>
            <p className="text-xl font-extrabold text-white">How Project LOOP Closes the Loop</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Inbox className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <strong className="text-white block">Multi-Channel Ingestion</strong>
              <span className="text-[10px] text-slate-400">CSV, Tickets, NPS</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <strong className="text-white block">AI Auto-Classify</strong>
              <span className="text-[10px] text-slate-400">Sentiment & Score</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Layers className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <strong className="text-white block">Theme Clustering</strong>
              <span className="text-[10px] text-slate-400">Semantic Grouping</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <strong className="text-white block">Trend Detection</strong>
              <span className="text-[10px] text-slate-400">Cycle Deltas (+/-)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <strong className="text-white block">Ask LOOP</strong>
              <span className="text-[10px] text-slate-400">Vector Search Q&A</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <FileBarChart className="w-5 h-5 text-rose-400 mx-auto mb-2" />
              <strong className="text-white block">VoC Reports</strong>
              <span className="text-[10px] text-slate-400">Executive Narrative</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <strong className="text-white block">Evidence Action</strong>
              <span className="text-[10px] text-slate-400">Close the Loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Enterprise Architecture & Capabilities
          </h2>
          <p className="text-3xl font-extrabold text-white">Built for Corporate Product Teams</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel space-y-3 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Tenant & RBAC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete data isolation across workspaces with <code className="text-indigo-300 font-mono">workspaceId</code> scoping. Server-enforced role permissions for Admin, Analyst, and read-only Viewer.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Grounded AI Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask natural language questions about customer sentiment. Claude Sonnet synthesizes answers backed strictly by cosine-similarity retrieved feedback citations with zero hallucinations.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileBarChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Voice-of-Customer Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate structured executive summaries for 7-day, 30-day, or custom cycles. Application code computes verified statistics first, which Claude turns into an action-oriented briefing exportable to PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">LOOP</span>
            <span>— Corporate-Grade AI Customer-Feedback Intelligence Platform</span>
          </div>
          <p>© 2026 Project LOOP. Built with Next.js 14, Prisma, Claude AI & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}

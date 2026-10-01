import React from "react";

export function SentimentBadge({ sentiment, score }: { sentiment: string; score?: number }) {
  if (sentiment === "POS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Positive {score !== undefined && <span className="opacity-75 font-mono">({score > 0 ? `+${score}` : score})</span>}
      </span>
    );
  }
  if (sentiment === "NEG") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        Negative {score !== undefined && <span className="opacity-75 font-mono">({score})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Neutral {score !== undefined && <span className="opacity-75 font-mono">({score})</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "NEW") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
        NEW
      </span>
    );
  }
  if (status === "REVIEWED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
        REVIEWED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
      ACTIONED
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
        ADMIN
      </span>
    );
  }
  if (role === "ANALYST") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        ANALYST
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-600/30 text-slate-400 border border-slate-600/40">
      VIEWER (READ-ONLY)
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: string }) {
  let color = "bg-slate-800 text-slate-300 border-slate-700";
  if (channel.includes("Support")) color = "bg-blue-950/60 text-blue-300 border-blue-800/40";
  else if (channel.includes("Store")) color = "bg-amber-950/60 text-amber-300 border-amber-800/40";
  else if (channel.includes("NPS")) color = "bg-emerald-950/60 text-emerald-300 border-emerald-800/40";
  else if (channel.includes("Sales")) color = "bg-violet-950/60 text-violet-300 border-violet-800/40";
  else if (channel.includes("Community")) color = "bg-cyan-950/60 text-cyan-300 border-cyan-800/40";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {channel}
    </span>
  );
}

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5 p-8 rounded-3xl glass-panel border border-rose-500/20 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-white">Access Denied</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have the required role-based permissions (ADMIN or ANALYST) to access this resource or perform this mutation.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

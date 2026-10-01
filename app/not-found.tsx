import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5 p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
            HTTP 404 Not Found
          </span>
          <h1 className="text-2xl font-black text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page you requested does not exist or may have been relocated within the LOOP platform.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

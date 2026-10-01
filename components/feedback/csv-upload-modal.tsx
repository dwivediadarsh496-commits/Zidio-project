"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function CsvUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError("CSV file is empty or formatted incorrectly");
          setParsedRows([]);
          return;
        }
        setParsedRows(results.data);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      const res = await fetch("/api/feedback/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "csv",
          rows: parsedRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setResult({ imported: data.imported, failed: data.failed });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to upload and classify CSV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CSV Bulk Feedback Upload</h2>
              <p className="text-xs text-slate-400">Import hundreds of customer comments with automatic AI tagging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bulk Import & AI Classification Completed!</span>
              </div>
              <p className="text-slate-300">
                Successfully processed <strong>{result.imported}</strong> feedback items. Failed rows: <strong>{result.failed}</strong>.
              </p>
            </div>
          )}

          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-700/80 rounded-2xl p-6 text-center hover:border-indigo-500/60 transition-colors bg-slate-900/50">
            <input
              type="file"
              accept=".csv"
              id="csvFileInput"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="csvFileInput"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {fileName ? fileName : "Click to select or drag CSV file"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Expected headers: <code className="text-indigo-300 font-mono">content, channel, customer_label, created_at</code>
                </p>
              </div>
            </label>
          </div>

          {/* Table Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Previewing first 5 of {parsedRows.length} detected rows:</span>
                <span className="font-semibold text-indigo-400">Ready to Ingest</span>
              </div>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/70 text-xs">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-300 sticky top-0">
                      <tr>
                        <th className="p-2 font-semibold">Content</th>
                        <th className="p-2 font-semibold">Channel</th>
                        <th className="p-2 font-semibold">Customer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2 max-w-xs truncate">{row.content || "(missing content)"}</td>
                          <td className="p-2 whitespace-nowrap">{row.channel || "Default"}</td>
                          <td className="p-2 whitespace-nowrap">{row.customer_label || row.customerLabel || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/40">
          <p className="text-[11px] text-slate-400">
            Each row is vectorized and classified by Claude AI.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={parsedRows.length === 0 || uploading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing & Classifying...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import {parsedRows.length} Rows</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

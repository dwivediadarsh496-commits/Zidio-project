"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Building2,
  Users,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  Trash2,
  Copy,
  Info,
} from "lucide-react";
import { RoleBadge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const role = currentUser?.role || "VIEWER";
  const isAdmin = role === "ADMIN";

  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("ANALYST");
  const [addingMember, setAddingMember] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workspace");
      const json = await res.json();
      if (json.data) {
        setWorkspace(json.data);
        setWorkspaceName(json.data.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      setSavingName(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update workspace name");

      setMessage({ text: "Workspace name updated successfully", type: "success" });
      fetchWorkspace();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSavingName(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      setAddingMember(true);
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          role: newMemberRole,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add member");

      setMessage({ text: "Team member added successfully", type: "success" });
      setIsAddMemberOpen(false);
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPassword("");
      fetchWorkspace();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setAddingMember(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/workspace/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to change role");

      setMessage({ text: "Member role updated successfully", type: "success" });
      fetchWorkspace();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to remove this user from the workspace?")) return;

    try {
      const res = await fetch(`/api/workspace/members/${memberId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove member");

      setMessage({ text: "Member removed from workspace", type: "success" });
      fetchWorkspace();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const copyWorkspaceId = () => {
    if (!workspace?.id) return;
    navigator.clipboard.writeText(workspace.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading && !workspace) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm">Loading workspace settings & RBAC members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Workspace Profile & Isolation */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Multi-Tenant Workspace</h2>
              <p className="text-xs text-slate-400">
                All data, feedback, and vectors are strictly isolated to your workspaceId
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
            Tenant Isolated
          </span>
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Workspace Organization Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={!isAdmin || savingName}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
              {isAdmin && (
                <button
                  type="submit"
                  disabled={savingName}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
                >
                  {savingName ? "Saving..." : "Save Name"}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tenant Workspace ID
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={workspace?.id || ""}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 select-all"
              />
              <button
                type="button"
                onClick={copyWorkspaceId}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Copy ID"
              >
                {copiedId ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>

        {/* Workspace Ingestion Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block uppercase">Total Ingested Feedback</span>
            <span className="text-xl font-bold text-white">{workspace?._count?.feedback || 0}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block uppercase">Active Themes</span>
            <span className="text-xl font-bold text-white">{workspace?._count?.themes || 0}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block uppercase">Voice-of-Customer Reports</span>
            <span className="text-xl font-bold text-white">{workspace?._count?.reports || 0}</span>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) & Team Members */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Team & Role-Based Access Control (RBAC)</h2>
              <p className="text-xs text-slate-400">
                Manage workspace members and configure ADMIN, ANALYST, and VIEWER permissions
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Members Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Current Role</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {workspace?.users?.map((member: any) => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">
                    {member.name}
                    {member.id === currentUser?.id && (
                      <span className="ml-2 text-[10px] text-indigo-400 font-mono">(You)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{member.email}</td>
                  <td className="py-3.5 px-4">
                    {isAdmin && member.id !== currentUser?.id ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-semibold focus:outline-none"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="ANALYST">ANALYST</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isAdmin && member.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Demo Credentials Reference Box (Section 37) */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pre-Configured Demo Credentials</span>
          </div>
          <p className="text-xs text-slate-400">
            You can test the exact role enforcement by logging in with each seed account:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">1. Admin Account</span>
              <p className="text-slate-300 font-mono text-[11px]">admin@loop-demo.com</p>
              <p className="text-slate-400 font-mono text-[11px]">Password: admin1234</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-indigo-300 block mb-1">2. Analyst Account</span>
              <p className="text-slate-300 font-mono text-[11px]">analyst@loop-demo.com</p>
              <p className="text-slate-400 font-mono text-[11px]">Password: analyst1234</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-slate-400 block mb-1">3. Viewer Account (Read-Only)</span>
              <p className="text-slate-300 font-mono text-[11px]">viewer@loop-demo.com</p>
              <p className="text-slate-400 font-mono text-[11px]">Password: viewer1234</p>
            </div>
          </div>
        </div>

        {/* RBAC Capabilities Matrix (Section 11) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server-Enforced RBAC Permissions Matrix</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <strong className="text-purple-300 block mb-1">ADMIN</strong>
              Full control: Workspace settings, member invitations, role changes, feedback creation/editing/deletion, re-classify, and report generation.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <strong className="text-indigo-300 block mb-1">ANALYST</strong>
              Data operations: Add feedback, upload bulk CSV, simulate channels, modify status, trigger re-classification, and generate VoC reports.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <strong className="text-slate-400 block mb-1">VIEWER (Read-Only)</strong>
              Read-only: Browse inbox, view analytics, inspect trends, ask questions in Ask LOOP, and read reports. Cannot mutate data (HTTP 403 on API).
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Team Member</h3>
              <p className="text-xs text-slate-400">Invite collaborator with role-based permissions</p>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANALYST">ANALYST (Feedback management & Reports)</option>
                  <option value="VIEWER">VIEWER (Read-Only access)</option>
                  <option value="ADMIN">ADMIN (Full organization control)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-5 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
                >
                  {addingMember ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

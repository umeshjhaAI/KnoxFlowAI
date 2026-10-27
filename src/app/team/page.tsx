"use client";

import { useEffect, useState, useCallback } from "react";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";

interface User {
  id: number; name: string; email: string; role: string; skills: string;
  avatar: string; on_leave: number;
}

interface TaskCount { c: number; }

interface CoverageResult {
  user: User;
  tasksToReassign: any[];
  candidates: any[];
  recommendedCandidate: any | null;
  requiresApproval: boolean;
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [coverage, setCoverage] = useState<CoverageResult | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approveMsg, setApproveMsg] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/bootstrap");
    const d = await res.json();
    setUsers(d.users);
    setTasks(d.tasks);
    setStats(d.stats);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const userTaskCount = (userId: number) =>
    tasks.filter((t: any) => t.assignee_id === userId && t.status !== "Resolved").length;

  const userOverdueCount = (userId: number) =>
    tasks.filter((t: any) => t.assignee_id === userId && new Date(t.due_date) < new Date() && t.status !== "Resolved").length;

  const handleCoverage = async (user: User) => {
    setCoverageLoading(true);
    setCoverage(null);
    setApproveMsg("");
    try {
      const res = await fetch("/api/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignee_id: user.id }),
      });
      setCoverage(await res.json());
    } finally {
      setCoverageLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!coverage?.recommendedCandidate || !coverage.tasksToReassign.length) return;
    setApproving(true);
    try {
      // Reassign all active tasks from the on-leave user to the recommended candidate
      for (const task of coverage.tasksToReassign) {
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignee_id: coverage.recommendedCandidate.id }),
        });
      }
      setApproveMsg(
        `✅ All ${coverage.tasksToReassign.length} task(s) reassigned to ${coverage.recommendedCandidate.name}.`
      );
      await fetchData();
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Team Overview</h1>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Team Size", value: stats.teamSize || 0 },
          { label: "Active Tasks", value: stats.activeTasks || 0 },
          { label: "Overdue", value: stats.overdueTasks || 0, alert: true },
          { label: "On Leave", value: stats.onLeave || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.alert ? "text-red-600" : "text-gray-900"}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const activeCount = userTaskCount(u.id);
          const overdueCount = userOverdueCount(u.id);
          const skills: string[] = JSON.parse(u.skills || "[]");
          const maxTasks = 8;
          const workloadPct = Math.min(100, Math.round((activeCount / maxTasks) * 100));

          return (
            <div key={u.id} className={`bg-white rounded-xl border p-5 ${u.on_leave ? "border-amber-300 bg-amber-50/30" : ""}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  u.on_leave ? "bg-amber-200 text-amber-800" : "bg-indigo-100 text-indigo-700"
                }`}>
                  {u.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {u.name}
                    {u.on_leave ? <Badge label="On Leave" color="yellow" /> : null}
                  </div>
                  <div className="text-xs text-gray-400">{u.role}</div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {skills.map((s) => (
                  <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>

              {/* Workload bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Workload</span>
                  <span>{activeCount} active</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      workloadPct > 80 ? "bg-red-500" : workloadPct > 50 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${workloadPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{overdueCount > 0 ? <span className="text-red-600 font-medium">{overdueCount} overdue</span> : "No overdue"}</span>
              </div>

              {u.on_leave && (
                <button
                  onClick={() => handleCoverage(u)}
                  disabled={coverageLoading}
                  className="w-full py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {coverageLoading ? "Finding backup..." : "Find Coverage"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Coverage Modal */}
      <Modal
        open={!!coverage}
        title={`Coverage for ${coverage?.user?.name}`}
        onClose={() => { setCoverage(null); setApproveMsg(""); }}
        footer={coverage?.recommendedCandidate && !approveMsg ? (
          <>
            <button onClick={() => { setCoverage(null); setApproveMsg(""); }} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={handleApprove} disabled={approving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {approving ? "Reassigning..." : `Approve Reassignment to ${coverage.recommendedCandidate.name}`}
            </button>
          </>
        ) : undefined}
      >
        {coverage && (
          <div className="space-y-4">
            {/* Tasks to reassign */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Tasks to Reassign ({coverage.tasksToReassign.length})</h4>
              {coverage.tasksToReassign.length === 0 ? (
                <p className="text-sm text-gray-400">No active tasks to reassign.</p>
              ) : (
                <div className="space-y-2">
                  {coverage.tasksToReassign.map((t: any) => (
                    <div key={t.id} className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between items-center">
                      <span>{t.title}</span>
                      <Badge label={t.priority} color={t.priority === "High" ? "red" : t.priority === "Medium" ? "yellow" : "green"} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Candidates */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Backup Candidates</h4>
              {coverage.candidates.length === 0 ? (
                <p className="text-sm text-gray-400">No available candidates found.</p>
              ) : (
                <div className="space-y-2">
                  {coverage.candidates.map((c: any, i: number) => (
                    <div key={c.id} className={`border rounded-lg p-3 ${i === 0 ? "border-indigo-300 bg-indigo-50/50" : "border-gray-200"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {c.name} {i === 0 ? "⭐ (Recommended)" : ""}
                        </span>
                        <span className="text-xs text-gray-500">{c.activeTasks} active tasks</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.overlappingSkills?.map((s: string) => (
                          <span key={s} className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Match score: {c.matchScore}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {approveMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                {approveMsg}
              </div>
            )}

            <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              ⚠️ <strong>Manager approval required</strong> before reassigning tasks. This ensures proper oversight of workload distribution.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
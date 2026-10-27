"use client";

import { useEffect, useState, useCallback } from "react";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import Modal from "@/components/Modal";

interface Task {
  id: number; title: string; description: string; email_id: number | null;
  assignee_id: number; assignee_name: string; assignee_avatar: string;
  priority: string; status: string; due_date: string;
}

interface User { id: number; name: string; avatar: string; }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState("all");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignee, setEditAssignee] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newAssignee, setNewAssignee] = useState<number>(0);
  const [newDueDate, setNewDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    const [tRes, uRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/bootstrap")]);
    setTasks(await tRes.json());
    const b = await uRes.json();
    setUsers(b.users);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = tasks.filter((t) => {
    if (filter === "active") return ["New", "In Progress", "Waiting for Client", "Waiting Internally"].includes(t.status);
    if (filter === "overdue") return new Date(t.due_date) < new Date() && t.status !== "Resolved";
    if (filter === "mine") return t.assignee_id === 1;
    return true;
  });

  const handleStatusUpdate = async () => {
    if (!editTask) return;
    setSaving(true);
    try {
      await fetch(`/api/tasks/${editTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, priority: editPriority, assignee_id: editAssignee }),
      });
      setEditTask(null);
      await fetchData();
    } finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle, description: newDesc, priority: newPriority,
          assignee_id: newAssignee || 1, status: "New", due_date: newDueDate || null,
        }),
      });
      setShowNew(false);
      setNewTitle(""); setNewDesc(""); setNewPriority("Medium"); setNewAssignee(0); setNewDueDate("");
      await fetchData();
    } finally { setCreating(false); }
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setEditStatus(t.status);
    setEditPriority(t.priority);
    setEditAssignee(t.assignee_id);
  };

  const statuses = ["New", "In Progress", "Waiting for Client", "Waiting Internally", "Resolved"];
  const priorities = ["Low", "Medium", "High"];

  const overdueCount = tasks.filter((t) => new Date(t.due_date) < new Date() && t.status !== "Resolved").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.filter((t) => t.status !== "Resolved").length} active · {overdueCount} overdue · {tasks.filter((t) => t.status === "Resolved").length} resolved
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              filter === f ? "bg-indigo-100 text-indigo-700" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm">No tasks found</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Due Date</div>
          </div>
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => openEdit(t)}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-gray-50 transition-colors w-full text-left items-center"
            >
              <div className="col-span-4">
                <div className="text-sm font-medium text-gray-900">{t.title}</div>
                {t.description && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.description}</div>}
              </div>
              <div className="col-span-2"><PriorityBadge priority={t.priority} /></div>
              <div className="col-span-2"><StatusBadge status={t.status} /></div>
              <div className="col-span-2 text-sm text-gray-600">{t.assignee_name}</div>
              <div className={`col-span-2 text-sm ${new Date(t.due_date) < new Date() && t.status !== "Resolved" ? "text-red-600 font-medium" : "text-gray-500"}`}>
                {new Date(t.due_date).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={!!editTask}
        title="Update Task"
        onClose={() => setEditTask(null)}
        footer={
          <>
            <button onClick={() => setEditTask(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={handleStatusUpdate} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        {editTask && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-900">{editTask.title}</div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <select value={editAssignee} onChange={(e) => setEditAssignee(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* New Task Modal */}
      <Modal
        open={showNew}
        title="Create New Task"
        onClose={() => setShowNew(false)}
        footer={
          <>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {creating ? "Creating..." : "Create Task"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Task title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <select value={newAssignee} onChange={(e) => setNewAssignee(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value={0}>Select...</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
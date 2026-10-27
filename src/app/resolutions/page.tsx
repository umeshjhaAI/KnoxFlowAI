"use client";

import { useEffect, useState, useCallback } from "react";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";

interface Resolution {
  id: number; issue: string; category: string; solution: string;
  tags: string; created_at: string;
}

export default function ResolutionsPage() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newIssue, setNewIssue] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newSolution, setNewSolution] = useState("");
  const [newTags, setNewTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Resolution | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/resolutions");
    setResolutions(await res.json());
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = resolutions.filter((r) =>
    !search ||
    r.issue.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["General", "Financial Reporting", "Payroll", "VAT", "Corporate Tax", "Bookkeeping", "M&A Advisory", "Compliance", "Tax Preparation"];

  const handleSave = async () => {
    if (!newIssue.trim() || !newSolution.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/resolutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: newIssue,
          category: newCategory,
          solution: newSolution,
          tags: JSON.stringify(newTags.split(",").map((t) => t.trim()).filter(Boolean)),
        }),
      });
      setShowNew(false);
      setNewIssue(""); setNewCategory("General"); setNewSolution(""); setNewTags("");
      await fetchData();
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Resolution Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            {resolutions.length} documented client issues and solutions
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Resolution
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search resolutions by issue, category, or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
      />

      {/* Resolution list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📚</div>
          <div className="text-sm">No resolutions found</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const tags: string[] = JSON.parse(r.tags || "[]");
            return (
              <div key={r.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelected(r)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge label={r.category} color="indigo" />
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{r.issue}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{r.solution}</p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {tags.map((t) => (
                          <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        title={selected?.issue || ""}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge label={selected.category} color="indigo" />
              <span className="text-xs text-gray-400">
                {new Date(selected.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
              {selected.solution}
            </div>
            {(() => {
              const tags: string[] = JSON.parse(selected.tags || "[]");
              return tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-4">
                  {tags.map((t) => (
                    <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        )}
      </Modal>

      {/* New Resolution Modal */}
      <Modal
        open={showNew}
        title="Add New Resolution"
        onClose={() => setShowNew(false)}
        footer={
          <>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Resolution"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Issue/Problem *</label>
            <input value={newIssue} onChange={(e) => setNewIssue(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Describe the client issue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Solution *</label>
            <textarea value={newSolution} onChange={(e) => setNewSolution(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={6} placeholder="Describe the resolution approach" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma-separated)</label>
            <input value={newTags} onChange={(e) => setNewTags(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g., P&L, reconciliation, audit" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
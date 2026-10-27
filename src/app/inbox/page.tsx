"use client";

import { useEffect, useState, useCallback } from "react";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";

interface Email {
  id: number; thread_id: string; client_name: string; client_email: string;
  subject: string; body: string; category: string; received_at: string;
  has_reply: number; reply_type: string; reply_draft: string;
}

interface Resolution {
  id: number; issue: string; category: string; solution: string; tags: string;
}

interface AnalyzeResult {
  duplicate?: boolean;
  message?: string;
  existingReply?: string;
  draft?: string;
  relevantResolutions?: Resolution[];
  confidence?: string;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selected, setSelected] = useState<Email | null>(null);
  const [search, setSearch] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [editedDraft, setEditedDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/bootstrap");
    const d = await res.json();
    setEmails(d.emails);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = emails.filter((e) =>
    !search ||
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.client_name.toLowerCase().includes(search.toLowerCase()) ||
    e.thread_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = async (email: Email) => {
    setSelected(email);
    setResult(null);
    setSendMsg("");
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/analyze/${email.id}`, { method: "POST" });
      const d: AnalyzeResult = await res.json();
      setResult(d);
      setEditedDraft(d.draft || "");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!selected) return;
    setSending(true);
    try {
      // Save edited draft first
      const res = await fetch(`/api/send/${selected.id}`, { method: "POST" });
      const d = await res.json();
      setSendMsg(d.message);
      setResult((prev) => prev ? { ...prev } : null);
      await fetchData();
    } finally {
      setSending(false);
    }
  };

  const replyBadge = (e: Email) => {
    if (!e.has_reply) return <Badge label="No Reply" color="red" />;
    if (e.reply_type === "substantive") return <Badge label="Replied" color="green" />;
    return <Badge label="Acknowledged" color="yellow" />;
  };

  return (
    <div className="flex h-full">
      {/* Email list */}
      <div className="w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold mb-3">Inbox</h1>
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No emails found</div>
          ) : (
            filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => { setSelected(e); setResult(null); setSendMsg(""); }}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selected?.id === e.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-400">{e.thread_id}</span>
                  {replyBadge(e)}
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">{e.subject}</div>
                <div className="text-xs text-gray-500 mt-1">{e.client_name} · {e.category}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-auto p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">📥</div>
              <div className="text-sm">Select an email to view details</div>
            </div>
          </div>
        ) : (
          <div>
            {/* Email detail */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {selected.thread_id}
                  </span>
                  <h2 className="text-xl font-semibold mt-2">{selected.subject}</h2>
                </div>
                {replyBadge(selected)}
              </div>
              <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                <span className="font-medium">{selected.client_name}</span>
                <span>·</span>
                <span className="text-gray-400">{selected.client_email}</span>
                <span>·</span>
                <span className="text-gray-400">{new Date(selected.received_at).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selected.body}
              </div>
              <div className="mt-4 flex gap-2">
                <Badge label={selected.category} color="indigo" />
                {selected.has_reply ? (
                  <span className="text-xs text-gray-400 self-center">
                    Reply type: {selected.reply_type}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Analyze button */}
            {!result && (
              <button
                onClick={() => handleAnalyze(selected)}
                disabled={analyzing}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>🔍 Analyze & Generate Reply</>
                )}
              </button>
            )}

            {/* Result */}
            {result && (
              <div>
                {result.duplicate ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-600 text-lg">⚠️</span>
                      <h3 className="font-semibold text-amber-800">{result.message}</h3>
                    </div>
                    {result.existingReply && (
                      <div className="mt-3 bg-white rounded-lg p-4 text-sm whitespace-pre-wrap border border-amber-100">
                        {result.existingReply}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Historical resolutions */}
                    {result.relevantResolutions && result.relevantResolutions.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          📚 Related Historical Resolutions ({result.relevantResolutions.length})
                        </h3>
                        <div className="space-y-2">
                          {result.relevantResolutions.map((r) => (
                            <div key={r.id} className="bg-white border rounded-lg p-3 text-sm">
                              <div className="font-medium text-gray-800">{r.issue}</div>
                              <div className="text-gray-500 mt-1 line-clamp-2">{r.solution}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Editable draft */}
                    <div className="bg-white border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">✏️ Draft Reply</h3>
                        <Badge
                          label={`Confidence: ${result.confidence || "medium"}`}
                          color={result.confidence === "high" ? "green" : "yellow"}
                        />
                      </div>
                      <textarea
                        value={editedDraft}
                        onChange={(e) => setEditedDraft(e.target.value)}
                        className="w-full h-64 p-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono"
                      />
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-gray-400">
                          ⚠️ Review carefully before approving. This draft uses historical data and rule-based AI.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setResult(null); setSendMsg(""); }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleApprove}
                            disabled={sending}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {sending ? "Saving..." : "✅ Approve & Save Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Send confirmation */}
                {sendMsg && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                    {sendMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
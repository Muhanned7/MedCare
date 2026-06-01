import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────
// GREEN TIER — AUTO
// ─────────────────────────────────────────────
function AutoCaptureCard({ item, onUndo, onSave }) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) return;
    if (secondsLeft <= 0) {
      onSave(item);
      setSaved(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, saved]);

  return (
    <div className="bg-green-950 border border-green-600 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-green-700 text-green-100 text-xs font-bold px-2 py-1 rounded">
            ✅ AUTO-CAPTURED
          </span>
          <span className="bg-slate-900 text-teal-400 border border-teal-800 text-xs font-bold px-2 py-1 rounded">
            {item.candidate.type}
          </span>
        </div>
        <span className="text-green-400 text-xs font-mono">
          {saved ? "✓ Saved to graph" : `Undo in ${secondsLeft}s`}
        </span>
      </div>

      <p className="text-green-200 font-semibold text-sm mt-1">{item.candidate.title}</p>
      <p className="text-green-300 text-sm mt-1">{item.candidate.content}</p>
      <p className="text-green-600 text-xs mt-2">
        Confidence: {(item.candidate.confidence * 100).toFixed(0)}% · {item.candidate.suggested_level}
      </p>

      {!saved && (
        <button
          onClick={() => { onUndo(item); setSaved(true); }}
          className="mt-3 bg-green-800 hover:bg-green-700 text-green-100 text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer"
        >
          ↩ Undo Auto-Capture
        </button>
      )}

      <ConflictPanel item={item} />
    </div>
  );
}

// ─────────────────────────────────────────────
// YELLOW TIER — REVIEW
// ─────────────────────────────────────────────
function ReviewCard({ item, onConfirm, onDismiss }) {
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(item.candidate.content);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("");

  const handleConfirm = () => {
    onConfirm({ ...item, candidate: { ...item.candidate, content: editedContent } });
    setStatus("✓ Confirmed");
    setDone(true);
  };

  const handleDismiss = () => {
    onDismiss(item);
    setStatus("✗ Dismissed");
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-amber-950 border border-amber-700 p-4 rounded-lg opacity-60">
        <p className="text-amber-300 text-sm font-medium">{status} — {item.candidate.title}</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-950 border border-amber-600 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-700 text-amber-100 text-xs font-bold px-2 py-1 rounded">
            👁 REVIEW REQUIRED
          </span>
          <span className="bg-slate-900 text-teal-400 border border-teal-800 text-xs font-bold px-2 py-1 rounded">
            {item.candidate.type}
          </span>
        </div>
        <span className="text-amber-400 text-xs">
          Confidence: {(item.candidate.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <p className="text-amber-200 font-semibold text-sm mt-1">{item.candidate.title}</p>

      {editing ? (
        <textarea
          className="w-full mt-2 bg-slate-900 text-slate-100 border border-amber-700 rounded p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          rows={3}
          value={editedContent}
          onChange={e => setEditedContent(e.target.value)}
        />
      ) : (
        <p className="text-amber-300 text-sm mt-1">{editedContent}</p>
      )}

      <p className="text-amber-600 text-xs mt-1">{item.candidate.suggested_level} · {item.candidate.department}</p>

      <div className="flex gap-2 mt-3">
        <button onClick={handleConfirm} className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded transition cursor-pointer">
          ✓ Confirm
        </button>
        <button onClick={() => setEditing(e => !e)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer">
          ✎ {editing ? "Cancel Edit" : "Edit"}
        </button>
        <button onClick={handleDismiss} className="bg-red-900 hover:bg-red-800 text-red-200 text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer">
          ✗ Dismiss
        </button>
      </div>

      <ConflictPanel item={item} />
    </div>
  );
}

// ─────────────────────────────────────────────
// RED TIER — EXPLICIT
// ─────────────────────────────────────────────
function ExplicitInputCard({ item, onConfirm, onDismiss }) {
  const [content, setContent] = useState(item.candidate.content);
  const [type, setType] = useState(item.candidate.type);
  const [level, setLevel] = useState(item.candidate.suggested_level);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("");

  const handleConfirm = () => {
    onConfirm({ ...item, candidate: { ...item.candidate, content, type, suggested_level: level } });
    setStatus("✓ Confirmed");
    setDone(true);
  };

  const handleDismiss = () => {
    onDismiss(item);
    setStatus("✗ Dismissed");
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-red-950 border border-red-800 p-4 rounded-lg opacity-60">
        <p className="text-red-300 text-sm font-medium">{status} — {item.candidate.title}</p>
      </div>
    );
  }

  return (
    <div className="bg-red-950 border border-red-700 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-red-700 text-red-100 text-xs font-bold px-2 py-1 rounded">
            ✋ EXPLICIT INPUT REQUIRED
          </span>
        </div>
        <span className="text-red-400 text-xs">
          Confidence: {(item.candidate.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <p className="text-red-200 font-semibold text-sm mt-1">{item.candidate.title}</p>
      <p className="text-red-400 text-xs mb-2">Low confidence — please review and correct before saving.</p>

      <div className="flex gap-2 mb-2">
        <select value={type} onChange={e => setType(e.target.value)} className="bg-slate-900 text-slate-200 border border-red-800 rounded px-2 py-1 text-xs focus:outline-none">
          <option value="CONSTRAINT">CONSTRAINT</option>
          <option value="DECISION">DECISION</option>
          <option value="ANTI_PATTERN">ANTI_PATTERN</option>
          <option value="FACT">FACT</option>
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)} className="bg-slate-900 text-slate-200 border border-red-800 rounded px-2 py-1 text-xs focus:outline-none">
          <option value="patient">Patient</option>
          <option value="department">Department</option>
          <option value="hospital">Hospital</option>
        </select>
      </div>

      <textarea
        className="w-full bg-slate-900 text-slate-100 border border-red-700 rounded p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
        rows={3}
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="flex gap-2 mt-3">
        <button onClick={handleConfirm} className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded transition cursor-pointer">
          ✓ Confirm & Save
        </button>
        <button onClick={handleDismiss} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer">
          ✗ Dismiss
        </button>
      </div>

      <ConflictPanel item={item} />
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFLICT PANEL — with undo merge
// ─────────────────────────────────────────────
function ConflictPanel({ item }) {
  const [mergedIds, setMergedIds] = useState([]);   // node ids that were merged
  const [keptIds, setKeptIds]     = useState([]);   // node ids where Keep Both was chosen
  // Store original content before merge so we can undo
  const [originalContent, setOriginalContent] = useState({});

  const handleMerge = async (conflict) => {
    try {
      // 1. Save original content for undo
      setOriginalContent(prev => ({
        ...prev,
        [conflict.existing_node_id]: conflict.existing_content
      }));

      // 2. Do the merge
      const response = await fetch("http://localhost:8000/api/pipeline/node/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existing_node_id: conflict.existing_node_id,
          new_content: item.candidate.content,
        }),
      });
      if (!response.ok) throw new Error("Merge failed");
      setMergedIds(ids => [...ids, conflict.existing_node_id]);
    } catch (error) {
      alert(`Merge failed: ${error.message}`);
    }
  };

  const handleUndoMerge = async (conflict) => {
    try {
      const original = originalContent[conflict.existing_node_id];
      if (!original) {
        alert("Original content not available for undo.");
        return;
      }

      // Re-generate embedding for original content
      const response = await fetch("http://localhost:8000/api/pipeline/node/undo-merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: conflict.existing_node_id,
          original_content: original,
        }),
      });
      if (!response.ok) throw new Error("Undo failed");

      // Remove from merged, back to unresolved
      setMergedIds(ids => ids.filter(id => id !== conflict.existing_node_id));
    } catch (error) {
      alert(`Undo failed: ${error.message}`);
    }
  };

  const handleKeepBoth = (nodeId) => {
    setKeptIds(ids => [...ids, nodeId]);
  };

  const handleUndoKeepBoth = (nodeId) => {
    setKeptIds(ids => ids.filter(id => id !== nodeId));
  };

  if (!item.conflicts || item.conflicts.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-slate-900 border border-amber-700/50 rounded">
      <p className="text-amber-500 text-xs font-bold mb-2">⚠️ VECTOR CONFLICT DETECTED</p>
      {item.conflicts.map((conflict, idx) => {
        const isMerged   = mergedIds.includes(conflict.existing_node_id);
        const isKeptBoth = keptIds.includes(conflict.existing_node_id);

        return (
          <div key={idx} className="bg-slate-800 p-2 rounded mb-2 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">
              Similarity: {(conflict.similarity_score * 100).toFixed(1)}% · Action: {conflict.action_suggestion}
            </p>
            <p className="text-slate-300 text-xs italic mb-3">
              Existing: "{conflict.existing_content.slice(0, 120)}..."
            </p>

            {/* MERGED state */}
            {isMerged && (
              <div className="flex items-center gap-2">
                <p className="text-green-400 text-xs font-bold">✅ Merged into {conflict.existing_node_id}</p>
                <button
                  onClick={() => handleUndoMerge(conflict)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded transition cursor-pointer"
                >
                  ↩ Undo Merge
                </button>
              </div>
            )}

            {/* KEPT BOTH state */}
            {isKeptBoth && !isMerged && (
              <div className="flex items-center gap-2">
                <p className="text-blue-400 text-xs font-bold">📎 Keeping both entries</p>
                <button
                  onClick={() => handleUndoKeepBoth(conflict.existing_node_id)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded transition cursor-pointer"
                >
                  ↩ Undo
                </button>
              </div>
            )}

            {/* UNRESOLVED state */}
            {!isMerged && !isKeptBoth && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleMerge(conflict)}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded transition cursor-pointer"
                >
                  Merge with {conflict.existing_node_id}
                </button>
                <button
                  onClick={() => handleKeepBoth(conflict.existing_node_id)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-3 py-1.5 rounded transition cursor-pointer"
                >
                  Keep Both
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// SUMMARY BAR
// ─────────────────────────────────────────────
function SummaryBar({ candidates }) {
  const auto     = candidates.filter(c => c.routing_tier === "AUTO").length;
  const review   = candidates.filter(c => c.routing_tier === "REVIEW").length;
  const explicit = candidates.filter(c => c.routing_tier === "EXPLICIT").length;
  const conflicts = candidates.filter(c => c.conflicts?.length > 0).length;

  return (
    <div className="flex gap-4 bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs flex-wrap">
      <span className="text-green-400">✅ {auto} Auto-captured</span>
      <span className="text-amber-400">👁 {review} For review</span>
      <span className="text-red-400">✋ {explicit} Explicit input</span>
      <span className="text-orange-400">⚠️ {conflicts} Conflicts found</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN CANDIDATE LIST
// ─────────────────────────────────────────────
export default function CandidateList({ candidates, patientId, onDone }) {
  if (!candidates || candidates.length === 0) return null;

  const handleSave = async (item) => {
    try {
      await fetch("http://localhost:8000/api/pipeline/node/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          type: item.candidate.type,
          title: item.candidate.title,
          content: item.candidate.content,
          importance: item.candidate.importance,
          suggested_level: item.candidate.suggested_level,
          department: item.candidate.department,
        }),
      });
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleDismiss = async (item) => {
    try {
      await fetch("http://localhost:8000/api/pipeline/node/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_content: item.candidate.content,
          patient_id: patientId,
          reason: "Doctor dismissed from review queue",
        }),
      });
    } catch (error) {
      console.error("Dismiss log failed:", error);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <SummaryBar candidates={candidates} />

      <h3 className="text-xl font-bold text-slate-100 border-b border-slate-700 pb-2">
        Knowledge Triage Queue
      </h3>

      {candidates.map((item, index) => {
        if (item.routing_tier === "AUTO") {
          return <AutoCaptureCard key={index} item={item} onSave={handleSave} onUndo={handleDismiss} />;
        } else if (item.routing_tier === "REVIEW") {
          return <ReviewCard key={index} item={item} onConfirm={handleSave} onDismiss={handleDismiss} />;
        } else {
          return <ExplicitInputCard key={index} item={item} onConfirm={handleSave} onDismiss={handleDismiss} />;
        }
      })}

      {/* ── Done Button ── */}
      <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
        <p className="text-slate-500 text-xs">
          Review all candidates above before closing the session.
        </p>
        <button
          onClick={onDone}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-md cursor-pointer"
        >
          ✅ Done — Close Session
        </button>
      </div>
    </div>
  );
}
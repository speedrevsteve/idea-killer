"use client";

import { useState } from "react";
import type { SavedIdea, Idea } from "@/lib/types";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SavedIdeasTab({
  saved,
  onRemove,
  onUpdateNotes,
  onSendToAnalyzer,
}: {
  saved: SavedIdea[];
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSendToAnalyzer: (idea: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function buildAnalyzeText(idea: Idea) {
    return `${idea.name}\n\n${idea.tagline}\n\nProblem: ${idea.problem}\n\nWhy now: ${idea.why_now}\n\nBusiness model: ${idea.model}`;
  }

  function startEdit(entry: SavedIdea) {
    setEditingId(entry.id);
    setDraftNotes(entry.notes ?? "");
  }

  function saveNotes(id: string) {
    onUpdateNotes(id, draftNotes);
    setEditingId(null);
  }

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-zinc-600">
        <p className="text-sm">No saved ideas yet.</p>
        <p className="text-xs">Hit "Save idea" on any generated idea to keep it here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs text-zinc-500">{saved.length} saved</span>

      {saved.map((entry) => {
        const isExpanded = expandedId === entry.id;

        return (
          <div
            key={entry.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
          >
            {/* Header row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="w-full flex items-start gap-4 p-4 text-left hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{entry.name}</p>
                <p className="text-zinc-400 text-xs mt-0.5 italic line-clamp-1">{entry.tagline}</p>
                {entry.notes && (
                  <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{entry.notes}</p>
                )}
              </div>
              <span className="text-xs text-zinc-600 shrink-0 mt-0.5">{timeAgo(entry.savedAt)}</span>
            </button>

            {/* Expanded */}
            {isExpanded && (
              <div className="border-t border-zinc-800 p-4 flex flex-col gap-4">
                {/* Idea details */}
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Problem</span>
                    <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{entry.problem}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Why now</span>
                    <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{entry.why_now}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Model</span>
                    <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{entry.model}</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notes</span>
                  {editingId === entry.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        rows={3}
                        placeholder="Add your thoughts..."
                        autoFocus
                        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveNotes(entry.id)}
                          className="text-xs px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                        >
                          Save notes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(entry)}
                      className="text-left text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {entry.notes || <span className="italic">Add notes...</span>}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <button
                    onClick={() => onSendToAnalyzer(buildAnalyzeText(entry))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
                  >
                    Kill this idea
                  </button>

                  {confirmDeleteId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Remove?</span>
                      <button
                        onClick={() => { onRemove(entry.id); setConfirmDeleteId(null); }}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

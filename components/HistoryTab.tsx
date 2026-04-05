"use client";

import { useState } from "react";
import type { HistoryEntry } from "@/lib/types";
import StructuredResult from "./StructuredResult";
import NarrativeResult from "./NarrativeResult";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function scoreColor(score: number) {
  if (score <= 3) return "text-red-400";
  if (score <= 6) return "text-orange-400";
  return "text-emerald-400";
}

export default function HistoryTab({
  entries,
  onDelete,
  onClearAll,
}: {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-zinc-600">
        <p className="text-sm">No analyses yet.</p>
        <p className="text-xs">Kill your first idea to see it here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{entries.length} saved</span>
        {confirmClear ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Clear all history?</span>
            <button
              onClick={() => { onClearAll(); setConfirmClear(false); }}
              className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Entries */}
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const score = entry.structuredData?.score;

        return (
          <div
            key={entry.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
          >
            {/* Row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="w-full flex items-start gap-4 p-4 text-left hover:bg-zinc-800/50 transition-colors"
            >
              {/* Score badge */}
              {score !== undefined ? (
                <span className={`text-lg font-black shrink-0 w-8 text-center ${scoreColor(score)}`}>
                  {score}
                </span>
              ) : (
                <span className="text-lg shrink-0 w-8 text-center text-zinc-600">~</span>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 leading-snug line-clamp-2">{entry.idea}</p>
                {entry.structuredData?.verdict && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1 italic">
                    &ldquo;{entry.structuredData.verdict}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs text-zinc-600">{timeAgo(entry.createdAt)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 capitalize">
                  {entry.format}
                </span>
              </div>
            </button>

            {/* Expanded result */}
            {isExpanded && (
              <div className="border-t border-zinc-800 p-4 flex flex-col gap-4">
                {entry.format === "structured" && entry.structuredData && (
                  <StructuredResult data={entry.structuredData} />
                )}
                {entry.format === "narrative" && entry.narrativeText && (
                  <NarrativeResult text={entry.narrativeText} />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                  className="self-end text-xs text-zinc-600 hover:text-red-400 transition-colors"
                >
                  Delete this entry
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

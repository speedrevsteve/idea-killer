"use client";

import { useState } from "react";
import type { Idea } from "@/lib/types";

export default function IdeasTab({
  onSendToAnalyzer,
  onSaveIdea,
  savedIds,
}: {
  onSendToAnalyzer: (idea: string) => void;
  onSaveIdea: (idea: Idea) => Promise<boolean>;
  savedIds: Set<string>;
}) {
  const [space, setSpace] = useState("");
  const [constraints, setConstraints] = useState("");
  const [count, setCount] = useState(5);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState<Set<number>>(new Set());

  async function handleGenerate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setIdeas([]);
    setError("");
    setJustSaved(new Set());

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ space, constraints, count }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      const cleaned = accumulated
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      const parsed = JSON.parse(cleaned) as Idea[];
      setIdeas(parsed);
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(idea: Idea, index: number) {
    setSavingId(index);
    await onSaveIdea(idea);
    setJustSaved((prev) => new Set(prev).add(index));
    setSavingId(null);
  }

  function buildAnalyzeText(idea: Idea) {
    return `${idea.name}\n\n${idea.tagline}\n\nProblem: ${idea.problem}\n\nWhy now: ${idea.why_now}\n\nBusiness model: ${idea.model}`;
  }

  function ideaKey(idea: Idea) {
    return idea.name + idea.tagline;
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Space / Industry <span className="normal-case text-zinc-600">(optional)</span>
          </label>
          <input
            value={space}
            onChange={(e) => setSpace(e.target.value)}
            placeholder="e.g. healthcare, B2B SaaS, climate, fintech..."
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            Constraints <span className="normal-case text-zinc-600">(optional)</span>
          </label>
          <input
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. bootstrappable, no VC needed, solo founder, AI-native..."
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Number of ideas
            </label>
            <div className="flex rounded-md overflow-hidden border border-zinc-800">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  disabled={loading}
                  className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                    count === n
                      ? "bg-red-600 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  } disabled:opacity-50`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 self-end bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? "Generating..." : "Generate Ideas"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center gap-3 text-zinc-500 text-sm">
          <span className="inline-block w-4 h-4 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
          Thinking...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {ideas.length > 0 && (
        <div className="flex flex-col gap-4">
          {ideas.map((idea, i) => {
            const alreadySaved = savedIds.has(ideaKey(idea)) || justSaved.has(i);
            return (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-base">{idea.name}</h3>
                    <p className="text-zinc-400 text-sm mt-0.5 italic">{idea.tagline}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleSave(idea, i)}
                      disabled={alreadySaved || savingId === i}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        alreadySaved
                          ? "border-emerald-800 text-emerald-500 bg-emerald-950/30 cursor-default"
                          : "border-zinc-700 text-zinc-400 hover:text-white hover:border-emerald-600"
                      } disabled:opacity-60`}
                    >
                      {alreadySaved ? "Saved" : savingId === i ? "Saving..." : "Save idea"}
                    </button>
                    <button
                      onClick={() => onSendToAnalyzer(buildAnalyzeText(idea))}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
                    >
                      Kill this idea
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Problem</span>
                    <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{idea.problem}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Why now</span>
                    <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{idea.why_now}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Model</span>
                    <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{idea.model}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

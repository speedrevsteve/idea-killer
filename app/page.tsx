"use client";

import { useState, useRef } from "react";
import StructuredResult from "@/components/StructuredResult";
import NarrativeResult from "@/components/NarrativeResult";
import HistoryTab from "@/components/HistoryTab";
import IdeasTab from "@/components/IdeasTab";
import SavedIdeasTab from "@/components/SavedIdeasTab";
import { useHistory } from "@/lib/useHistory";
import { useSavedIdeas } from "@/lib/useSavedIdeas";
import type { Format, StructuredData } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";
type Tab = "analyze" | "ideas" | "saved" | "history";

export default function Home() {
  const [tab, setTab] = useState<Tab>("analyze");
  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState<Format>("structured");
  const [status, setStatus] = useState<Status>("idle");
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null);
  const [narrativeText, setNarrativeText] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const { entries, addEntry, deleteEntry, clearAll } = useHistory();
  const { saved, saveIdea, updateNotes, removeIdea, savedIds } = useSavedIdeas();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!idea.trim() || status === "loading") return;

    setStatus("loading");
    setStructuredData(null);
    setNarrativeText("");
    setError("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, format }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Request failed (${res.status}): ${body}`);
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        if (format === "narrative") {
          setNarrativeText(accumulated);
        }
      }

      if (format === "structured") {
        const cleaned = accumulated.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned) as StructuredData;
        setStructuredData(parsed);
        addEntry({ idea, format, structuredData: parsed });
      } else {
        addEntry({ idea, format, narrativeText: accumulated });
      }

      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }
      console.error("Analyze error:", err);
      setError((err as Error).message || "Something went wrong. Check your API key and try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setStatus("idle");
    setStructuredData(null);
    setNarrativeText("");
    setError("");
  }

  const isLoading = status === "loading";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black tracking-tight text-white">Idea Killer</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Brutally honest startup analysis.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-zinc-800">
            {(["analyze", "ideas", "saved", "history"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  tab === t
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "analyze" && "Analyze"}
                {t === "ideas" && "Suggest Ideas"}
                {t === "saved" && `Saved${saved.length > 0 ? ` (${saved.length})` : ""}`}
                {t === "history" && `History${entries.length > 0 ? ` (${entries.length})` : ""}`}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Tab */}
        {tab === "analyze" && (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea in as much detail as you want. The more context, the sharper the critique."
                rows={6}
                disabled={isLoading}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
              />

              {/* Format Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Output format</span>
                <div className="flex rounded-md overflow-hidden border border-zinc-800">
                  {(["structured", "narrative"] as Format[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      disabled={isLoading}
                      className={`px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                        format === f
                          ? "bg-red-600 text-white"
                          : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                      } disabled:opacity-50`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!idea.trim() || isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                >
                  {isLoading ? "Killing your idea..." : "Kill My Idea"}
                </button>
                {(status === "loading" || status === "done") && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                <span className="inline-block w-4 h-4 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
                {format === "narrative" && narrativeText ? "Writing..." : "Analyzing..."}
              </div>
            )}

            {isLoading && format === "narrative" && narrativeText && (
              <NarrativeResult text={narrativeText} streaming />
            )}

            {/* Error */}
            {status === "error" && (
              <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Results */}
            {status === "done" && format === "structured" && structuredData && (
              <StructuredResult data={structuredData} />
            )}
            {status === "done" && format === "narrative" && (
              <NarrativeResult text={narrativeText} />
            )}
          </>
        )}

        {/* Ideas Tab */}
        {tab === "ideas" && (
          <IdeasTab
            onSendToAnalyzer={(text) => { setIdea(text); setTab("analyze"); }}
            onSaveIdea={saveIdea}
            savedIds={savedIds}
          />
        )}

        {/* Saved Ideas Tab */}
        {tab === "saved" && (
          <SavedIdeasTab
            saved={saved}
            onRemove={removeIdea}
            onUpdateNotes={updateNotes}
            onSendToAnalyzer={(text) => { setIdea(text); setTab("analyze"); }}
          />
        )}

        {/* History Tab */}
        {tab === "history" && (
          <HistoryTab
            entries={entries}
            onDelete={deleteEntry}
            onClearAll={clearAll}
          />
        )}
      </div>
    </main>
  );
}

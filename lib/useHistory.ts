"use client";

import { useState, useEffect } from "react";
import type { HistoryEntry } from "./types";

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    async function init() {
      try {
        // Migrate any existing localStorage data on first switch to file-based storage
        const STORAGE_KEY = "idea-killer-history";
        const MIGRATED_KEY = "idea-killer-migrated";
        if (!localStorage.getItem(MIGRATED_KEY)) {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const localEntries = JSON.parse(raw) as HistoryEntry[];
            if (localEntries.length > 0) {
              await fetch("/api/history/migrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localEntries),
              });
            }
            localStorage.removeItem(STORAGE_KEY);
          }
          localStorage.setItem(MIGRATED_KEY, "1");
        }

        const res = await fetch("/api/history");
        const data = await res.json();
        setEntries(data as HistoryEntry[]);
      } catch {
        // ignore
      }
    }
    init();
  }, []);

  async function addEntry(entry: Omit<HistoryEntry, "id" | "createdAt">) {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setEntries((prev) => [newEntry, ...prev].slice(0, 50));
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    });
  }

  async function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
  }

  async function clearAll() {
    setEntries([]);
    await fetch("/api/history?all=true", { method: "DELETE" });
  }

  return { entries, addEntry, deleteEntry, clearAll };
}

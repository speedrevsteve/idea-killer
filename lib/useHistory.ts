"use client";

import { useState, useEffect } from "react";
import type { HistoryEntry } from "./types";

const STORAGE_KEY = "idea-killer-history";
const MAX_ENTRIES = 50;

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(load());
  }, []);

  function addEntry(entry: Omit<HistoryEntry, "id" | "createdAt">) {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setEntries((prev) => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
      save(updated);
      return updated;
    });
  }

  function deleteEntry(id: string) {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      save(updated);
      return updated;
    });
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }

  return { entries, addEntry, deleteEntry, clearAll };
}

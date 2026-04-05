"use client";

import { useState, useEffect } from "react";
import type { Idea, SavedIdea } from "./types";

export function useSavedIdeas() {
  const [saved, setSaved] = useState<SavedIdea[]>([]);

  useEffect(() => {
    fetch("/api/saved-ideas")
      .then((r) => r.json())
      .then((data) => setSaved(data as SavedIdea[]))
      .catch(() => {});
  }, []);

  async function saveIdea(idea: Idea): Promise<boolean> {
    const entry: SavedIdea = {
      ...idea,
      id: crypto.randomUUID(),
      savedAt: Date.now(),
    };
    setSaved((prev) => [entry, ...prev]);
    const res = await fetch("/api/saved-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    return !data.duplicate;
  }

  async function updateNotes(id: string, notes: string) {
    setSaved((prev) => prev.map((e) => (e.id === id ? { ...e, notes } : e)));
    await fetch("/api/saved-ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes }),
    });
  }

  async function removeIdea(id: string) {
    setSaved((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/saved-ideas?id=${id}`, { method: "DELETE" });
  }

  const savedIds = new Set(saved.map((e) => e.name + e.tagline));

  return { saved, saveIdea, updateNotes, removeIdea, savedIds };
}

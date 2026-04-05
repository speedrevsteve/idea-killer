import { promises as fs } from "fs";
import path from "path";
import type { HistoryEntry } from "@/lib/types";

const FILE = path.join(process.cwd(), "data", "history.json");

async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const incoming = (await req.json()) as HistoryEntry[];
  const existing = await readHistory();

  // Merge: incoming localStorage entries + existing file entries, dedup by id
  const seen = new Set(existing.map((e) => e.id));
  const merged = [
    ...incoming.filter((e) => !seen.has(e.id)),
    ...existing,
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);

  await fs.writeFile(FILE, JSON.stringify(merged, null, 2), "utf-8");
  return Response.json({ ok: true, migrated: incoming.length });
}

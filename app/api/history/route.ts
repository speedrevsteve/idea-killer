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

async function writeHistory(entries: HistoryEntry[]) {
  await fs.writeFile(FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function GET() {
  const entries = await readHistory();
  return Response.json(entries);
}

export async function POST(req: Request) {
  const entry = (await req.json()) as HistoryEntry;
  const entries = await readHistory();
  const updated = [entry, ...entries].slice(0, 50);
  await writeHistory(updated);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all");

  if (all === "true") {
    await writeHistory([]);
    return Response.json({ ok: true });
  }

  if (id) {
    const entries = await readHistory();
    await writeHistory(entries.filter((e) => e.id !== id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Missing id or all param" }, { status: 400 });
}

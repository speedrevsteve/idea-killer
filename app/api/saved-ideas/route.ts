import { promises as fs } from "fs";
import path from "path";
import type { SavedIdea } from "@/lib/types";

const FILE = path.join(process.cwd(), "data", "saved-ideas.json");

async function read(): Promise<SavedIdea[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as SavedIdea[];
  } catch {
    return [];
  }
}

async function write(entries: SavedIdea[]) {
  await fs.writeFile(FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function GET() {
  return Response.json(await read());
}

export async function POST(req: Request) {
  const entry = (await req.json()) as SavedIdea;
  const existing = await read();
  if (existing.some((e) => e.id === entry.id)) {
    return Response.json({ ok: true, duplicate: true });
  }
  await write([entry, ...existing]);
  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id, notes } = (await req.json()) as { id: string; notes: string };
  const existing = await read();
  await write(existing.map((e) => (e.id === id ? { ...e, notes } : e)));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await write((await read()).filter((e) => e.id !== id));
  return Response.json({ ok: true });
}

export type Format = "structured" | "narrative";

export type Weakness = {
  title: string;
  severity: "low" | "medium" | "high" | "fatal";
  body: string;
};

export type Section = {
  title: string;
  body: string;
};

export type StructuredData = {
  verdict: string;
  score: number;
  strengths: Section[];
  weaknesses: Weakness[];
  wildcards: Section[];
  bottom_line: string;
};

export type Idea = {
  name: string;
  tagline: string;
  problem: string;
  why_now: string;
  model: string;
};

export type SavedIdea = Idea & {
  id: string;
  savedAt: number;
  notes?: string;
};

export type HistoryEntry = {
  id: string;
  idea: string;
  format: Format;
  structuredData?: StructuredData;
  narrativeText?: string;
  createdAt: number;
};

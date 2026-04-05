type Weakness = {
  title: string;
  severity: "low" | "medium" | "high" | "fatal";
  body: string;
};

type Section = {
  title: string;
  body: string;
};

type StructuredData = {
  verdict: string;
  score: number;
  strengths: Section[];
  weaknesses: Weakness[];
  wildcards: Section[];
  bottom_line: string;
};

const severityConfig = {
  low: { label: "Low", classes: "bg-yellow-950/40 border-yellow-800/50 text-yellow-400" },
  medium: { label: "Medium", classes: "bg-orange-950/40 border-orange-800/50 text-orange-400" },
  high: { label: "High", classes: "bg-red-950/40 border-red-800/50 text-red-400" },
  fatal: { label: "Fatal", classes: "bg-red-950/60 border-red-600/70 text-red-300" },
};

function ScoreMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score <= 3 ? "bg-red-500" : score <= 6 ? "bg-orange-400" : "bg-emerald-400";
  const label =
    score <= 2
      ? "Burn it down"
      : score <= 4
      ? "Serious problems"
      : score <= 6
      ? "Has potential"
      : score <= 8
      ? "Promising"
      : "Rare gem";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Idea Score</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white">{score}</span>
          <span className="text-zinc-500 text-sm">/10</span>
        </div>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

export default function StructuredResult({ data }: { data: StructuredData }) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Verdict + Score */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
        <p className="text-white font-semibold text-base leading-snug">
          &ldquo;{data.verdict}&rdquo;
        </p>
        <ScoreMeter score={data.score} />
      </div>

      {/* Strengths */}
      {data.strengths?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            What Works
          </h2>
          {data.strengths.map((s, i) => (
            <div key={i} className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4">
              <p className="font-medium text-emerald-300 text-sm mb-1">{s.title}</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weaknesses */}
      {data.weaknesses?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400">
            The Problems
          </h2>
          {data.weaknesses.map((w, i) => {
            const cfg = severityConfig[w.severity] ?? severityConfig.medium;
            return (
              <div key={i} className={`rounded-lg border p-4 ${cfg.classes}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm text-zinc-100">{w.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.classes}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{w.body}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Wildcards */}
      {data.wildcards?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Wildcards
          </h2>
          {data.wildcards.map((w, i) => (
            <div key={i} className="rounded-lg border border-violet-900/50 bg-violet-950/20 p-4">
              <p className="font-medium text-violet-300 text-sm mb-1">{w.title}</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Line */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Bottom Line
        </h2>
        <p className="text-zinc-200 text-sm leading-relaxed">{data.bottom_line}</p>
      </div>
    </div>
  );
}

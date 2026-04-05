export default function NarrativeResult({
  text,
  streaming = false,
}: {
  text: string;
  streaming?: boolean;
}) {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim());

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-4 ${
        streaming ? "animate-pulse-subtle" : "animate-in fade-in duration-300"
      }`}
    >
      {paragraphs.map((p, i) => (
        <p key={i} className="text-zinc-200 text-sm leading-relaxed">
          {p}
        </p>
      ))}
      {streaming && (
        <span className="inline-block w-2 h-4 bg-red-500 animate-pulse rounded-sm" />
      )}
    </div>
  );
}

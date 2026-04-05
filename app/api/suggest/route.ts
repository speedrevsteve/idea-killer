import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { space, constraints, count } = await req.json();

  const filters = [
    space && `Space / industry: ${space}`,
    constraints && `Constraints or requirements: ${constraints}`,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `You are a contrarian startup ideator with a gift for finding real, underserved problems that most people overlook. You generate startup ideas that are:
- Grounded in a genuine, painful problem — not a solution looking for a problem
- Specific and actionable, not vague platitudes
- Commercially viable with a clear path to revenue
- Differentiated from obvious incumbents

For each idea, you also briefly explain WHY it's a good bet right now — timing, market shift, tech unlock, or behavioral change that makes this the right moment.

Return ONLY a raw JSON array (no markdown fences, no extra text) with exactly this shape:
[
  {
    "name": "short catchy name",
    "tagline": "one punchy sentence describing what it does",
    "problem": "1-2 sentences on the specific pain point being solved and who feels it",
    "why_now": "1-2 sentences on why this is the right moment for this idea",
    "model": "one sentence on how it makes money"
  }
]`;

  const userMessage = `Generate ${count ?? 5} startup ideas${filters ? `.\n\n${filters}` : "."}`;

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

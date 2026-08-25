/**
 * Server-side AI service. OpenAI-compatible chat completions via fetch
 * (works with OpenAI, Groq, Ollama, etc. by setting OPENAI_BASE_URL).
 * Never imported from client code.
 */

const DEFAULT_MODEL = "gpt-4o-mini";

export function aiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

interface ChatOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

export async function chat(opts: ChatOptions): Promise<string | null> {
  if (!aiConfigured()) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        max_tokens: opts.maxTokens ?? 700,
        temperature: opts.temperature ?? 0.3,
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content && content.length > 0 ? content : null;
  } catch {
    // AI failures must never break a scan — callers fall back to templates.
    return null;
  }
}

import { chat } from "@/lib/ai/aiService";
import type { CheckResult } from "@/lib/scanner/checks";

/**
 * Prompt generation for each issue. Tries the LLM first; falls back to a
 * deterministic template so every issue always gets a usable prompt.
 */

export interface IssueLike {
  title: string;
  category: string;
  severity: string;
  description: string;
  impact?: string | null;
  evidence: Record<string, unknown>;
  recommendation?: string | null;
}

const SYSTEM = `You are a senior web developer writing fix instructions for beginner developers ("vibe coders") who build sites with AI coding tools.
Given a detected website issue, produce:
1. A short beginner-friendly explanation of what is wrong and why it matters (2-4 sentences).
2. A copy-pasteable "AI fix prompt" — an instruction block the user can paste into their coding AI (Cursor, Copilot, Claude) to fix the issue. The prompt must include issue context, severity, evidence, task, constraints, and verification steps. Be specific, never generic.
Respond in strict JSON: {"description": string, "impact": string, "ai_prompt": string}. No markdown fences.`;

export async function generateIssueContent(
  issue: IssueLike,
  siteUrl: string,
  check?: CheckResult
): Promise<{ description: string; impact: string; aiPrompt: string }> {
  const fallback = templateContent(issue);

  const raw = await chat({
    system: SYSTEM,
    user: JSON.stringify({
      website: siteUrl,
      issue: {
        title: issue.title,
        category: issue.category,
        severity: issue.severity,
        detector: check?.id ?? "scanner",
        evidence: issue.evidence,
      },
    }),
    maxTokens: 900,
  });

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as {
      description?: string;
      impact?: string;
      ai_prompt?: string;
    };
    return {
      description: parsed.description || fallback.description,
      impact: parsed.impact || fallback.impact,
      aiPrompt: parsed.ai_prompt || fallback.aiPrompt,
    };
  } catch {
    return fallback; // malformed AI response — use deterministic content
  }
}

function templateContent(issue: IssueLike): { description: string; impact: string; aiPrompt: string } {
  const description =
    issue.recommendation ??
    `Vibyze detected: ${issue.title}. This was found by our automated scanner in the "${issue.category}" category.`;
  const impact =
    issue.impact ??
    `Unresolved, this issue can hurt your site's quality in the "${issue.category}" area and may affect users, search engines, or security.`;
  const aiPrompt = [
    "You are working on my website project.",
    "",
    "Vibyze (an automated website analyzer) detected the following issue:",
    "",
    `Issue: ${issue.title}`,
    `Category: ${issue.category}`,
    `Severity: ${issue.severity.toUpperCase()}`,
    "",
    "Evidence from the scan:",
    JSON.stringify(issue.evidence, null, 2),
    "",
    "Task:",
    `Investigate and fix the issue described above.`,
    "",
    "Requirements:",
    "- Do not change anything unrelated to this issue.",
    "- Keep the visual appearance intact unless the issue requires otherwise.",
    "- Explain what you changed and why in simple terms.",
    "",
    "After making changes, verify the fix is complete and re-run any relevant checks.",
  ].join("\n");
  return { description, impact, aiPrompt };
}

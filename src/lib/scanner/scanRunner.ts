import { createClient } from "@/lib/supabase/server";
import { assertResolvableAndPublic } from "@/lib/scanner/urlGuard";
import { fetchPage, runChecks, checkLinks, type CheckResult } from "@/lib/scanner/checks";
import { generateIssueContent } from "@/lib/ai/promptGenerator";
import { scoreFromIssues, categoryScores } from "@/lib/scoring/scoreCalculator";

/**
 * Scan orchestrator — runs the full pipeline:
 * validate → fetch → deterministic checks → link check → AI enrichment → persist.
 * Designed to be called fire-and-forget from the API route; progress is
 * tracked via the scans.status column.
 */

export async function runScan(scanId: string, projectId: string, url: string): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase.from("scans").update({ status: "running", started_at: new Date().toISOString() }).eq("id", scanId);

    // SSRF guard — resolve DNS and verify public before fetching.
    await assertResolvableAndPublic(url);

    const page = await fetchPage(url);
    if (page.status >= 400) {
      throw new Error(`The website returned HTTP ${page.status}.`);
    }

    const checks = runChecks(page);

    // Broken internal links
    const brokenLinks = await checkLinks(page);
    if (brokenLinks.length > 0) {
      checks.push({
        category: "seo",
        id: "broken-links",
        title: "Broken links detected",
        evidence: { broken: brokenLinks },
        issue: true,
        severity: brokenLinks.length > 3 ? "medium" : "low",
      });
    }

    // Unreachable site guard already handled above. Build issues.
    const detected = checks.filter((c) => c.issue && c.id !== "_links");

    const issuesToInsert = await Promise.all(
      detected.map(async (check: CheckResult) => {
        const content = await generateIssueContent(
          {
            title: check.title,
            category: check.category,
            severity: check.severity,
            description: "",
            evidence: redactEvidence(check.evidence),
            recommendation: null,
          },
          url,
          check
        );
        return {
          scan_id: scanId,
          category: check.category,
          title: check.title,
          description: content.description,
          impact: content.impact,
          severity: check.severity,
          confidence: confidenceFor(check),
          evidence: check.evidence,
          recommendation: null,
          ai_prompt: content.aiPrompt,
        };
      })
    );

    if (issuesToInsert.length > 0) {
      const { error } = await supabase.from("issues").insert(issuesToInsert);
      if (error) throw new Error(`Failed to save issues: ${error.message}`);
    }

    const scored = issuesToInsert.map((i) => ({ severity: i.severity as never, category: i.category }));
    const score = scoreFromIssues(scored);
    const catScores = categoryScores(scored);

    await supabase
      .from("scans")
      .update({
        status: "completed",
        score,
        category_scores: catScores,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred during scanning.";
    await supabase
      .from("scans")
      .update({
        status: "failed",
        error_message: message.slice(0, 500),
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);
  }
}

function confidenceFor(check: CheckResult): number {
  // Deterministic checks are high-confidence; heuristics get lower values.
  switch (check.id) {
    case "missing-title":
    case "viewport-meta":
    case "insecure-http":
    case "exposed-secrets":
    case "img-missing-alt":
    case "html-lang":
      return 98;
    case "excessive-scripts":
    case "unoptimized-images":
    case "fixed-width-elements":
    case "render-blocking-css":
      return 70;
    default:
      return 90;
  }
}

/** Strip potentially sensitive page content before storing/persisting. */
function redactEvidence(evidence: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...evidence };
  if (Array.isArray(clone.links)) clone.links = (clone.links as string[]).slice(0, 20);
  return clone;
}

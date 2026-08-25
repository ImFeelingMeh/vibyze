/**
 * Centralized Vibyze score calculation.
 * Deductions per issue severity; category scores are computed per-category.
 * Keep all scoring logic here so it can be tuned in one place.
 */

export type Severity = "critical" | "high" | "medium" | "low" | "info";

const DEDUCTIONS: Record<Severity, number> = {
  critical: 25,
  high: 12,
  medium: 6,
  low: 2,
  info: 0,
};

export interface ScoredIssue {
  severity: Severity;
  category: string;
}

export function scoreFromIssues(issues: ScoredIssue[]): number {
  const total = issues.reduce((sum, i) => sum + DEDUCTIONS[i.severity], 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export function categoryScores(issues: ScoredIssue[]): Record<string, number> {
  const byCategory = new Map<string, ScoredIssue[]>();
  for (const i of issues) {
    const list = byCategory.get(i.category) ?? [];
    list.push(i);
    byCategory.set(i.category, list);
  }
  const out: Record<string, number> = {};
  for (const [cat, list] of byCategory) {
    out[cat] = scoreFromIssues(list);
  }
  return out;
}

export function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Needs Attention";
  if (score >= 60) return "Poor";
  return "Critical";
}

export function scoreColour(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

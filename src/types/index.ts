/**
 * Vibyze — shared TypeScript types
 * These mirror the Supabase tables (profiles, projects, scans, issues).
 */

export type ScanStatus = "queued" | "running" | "completed" | "failed";
export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";
export type IssueCategory =
  | "security"
  | "performance"
  | "seo"
  | "accessibility"
  | "mobile"
  | "ux"
  | "code_quality";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  project_id: string;
  status: ScanStatus;
  score: number | null;
  category_scores: Record<string, number> | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Issue {
  id: string;
  scan_id: string;
  category: IssueCategory;
  title: string;
  description: string;
  impact: string | null;
  severity: IssueSeverity;
  confidence: number | null;
  evidence: Record<string, unknown> | null;
  recommendation: string | null;
  ai_prompt: string | null;
  created_at: string;
}

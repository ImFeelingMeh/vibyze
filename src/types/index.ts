/**
 * Vibyze — shared TypeScript types
 * These mirror the Prisma models and are used throughout the app.
 */

export type ScanStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  userId: string;
}

export interface Scan {
  id: string;
  status: ScanStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  projectId: string;
  issueCount?: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: string;
  affectedElement: string | null;
  createdAt: string;
  scanId: string;
  aiPrompt?: AIPrompt | null;
}

export interface AIPrompt {
  id: string;
  prompt: string;
  issueId: string;
}

/**
 * Scan Results page — lists all issues found in a specific scan.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import ScanStatus from "@/components/ScanStatus";
import IssueBadge from "@/components/IssueBadge";
import SeverityDot from "@/components/SeverityDot";
import RescanButton from "@/components/RescanButton";
import { formatDate } from "@/lib/utils";
import { scoreColour, scoreLabel } from "@/lib/scoring/scoreCalculator";

export const dynamic = "force-dynamic";

interface IssueRow {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  confidence: number | null;
}

interface ScanRow {
  id: string;
  status: string;
  score: number | null;
  category_scores: Record<string, number> | null;
  error_message: string | null;
  created_at: string;
  projects: { name: string; url: string } | { name: string; url: string }[] | null;
}

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];

export default async function ScanPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  const supabase = await createClient();

  const { data: scan } = await supabase
    .from("scans")
    .select("id, status, score, category_scores, error_message, created_at, projects (name, url)")
    .eq("id", scanId)
    .maybeSingle();

  if (!scan) notFound();
  const s = scan as unknown as ScanRow;

  const project = Array.isArray(s.projects) ? s.projects[0] : s.projects;

  const { data: issues } = await supabase
    .from("issues")
    .select("id, category, title, description, severity, confidence")
    .eq("scan_id", scanId);

  const list = ((issues ?? []) as IssueRow[]).sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              {project?.name ?? "Project"} · {project?.url}
            </p>
            <h1 className="text-2xl font-bold text-white">Scan Results</h1>
            <p className="mt-1 text-xs text-zinc-500">{formatDate(s.created_at)}</p>
          </div>
          {project?.url ? (
            <RescanButton url={project.url} projectName={project.name} />
          ) : (
            <Link
              href="/scan/new"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-accent/60 hover:text-accent transition-colors"
            >
              New Scan
            </Link>
          )}
        </div>

        {(s.status === "queued" || s.status === "running") && (
          <div className="mt-8">
            <ScanStatus scanId={s.id} initialStatus={s.status} />
          </div>
        )}

        {s.status === "failed" && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-6">
            <p className="font-medium text-red-300">Scan failed</p>
            <p className="mt-1 text-sm text-zinc-400">
              {s.error_message ?? "The website could not be scanned."}
            </p>
          </div>
        )}

        {s.status === "completed" && (
          <>
            {/* Score */}
            <section className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-12 py-8">
                <span className={`text-6xl font-bold ${scoreColour(s.score ?? 0)}`}>
                  {s.score}
                </span>
                <span className="mt-1 text-sm uppercase tracking-wide text-zinc-400">
                  {scoreLabel(s.score ?? 0)}
                </span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="mb-4 font-semibold text-white">Category scores</h2>
                <div className="space-y-3">
                  {Object.entries(s.category_scores ?? {}).map(([cat, val]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="w-28 capitalize text-sm text-zinc-400">{cat}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${
                            val >= 80 ? "bg-emerald-500" : val >= 60 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className={`w-8 text-right text-sm font-semibold ${scoreColour(val)}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Issues */}
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">
                Fix First
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  ({list.length} issue{list.length === 1 ? "" : "s"})
                </span>
              </h2>

              {list.length === 0 ? (
                <p className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/40 p-6 text-center text-emerald-300">
                  No issues detected. Nice work.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {list.map((issue) => (
                    <li key={issue.id}>
                      <Link
                        href={`/scan/${s.id}/issue/${issue.id}`}
                        className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-accent/60 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <SeverityDot severity={issue.severity} />
                          <IssueBadge severity={issue.severity} />
                          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-400">
                            {issue.category.replace("_", " ")}
                          </span>
                          <h3 className="font-medium text-white">{issue.title}</h3>
                          {issue.confidence !== null && (
                            <span className="ml-auto text-xs text-zinc-500">
                              Confidence: {issue.confidence}%
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                          {issue.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

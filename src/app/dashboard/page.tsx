/**
 * Dashboard — shows all of the user's projects and their latest scan status.
 */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { timeAgo, severityDot } from "@/lib/utils";
import { scoreColour, scoreLabel } from "@/lib/scoring/scoreCalculator";

export const dynamic = "force-dynamic";

interface ProjectRow {
  id: string;
  name: string;
  url: string;
  scans: { id: string; status: string; score: number | null; created_at: string; issues: { severity: string }[] }[];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      `id, name, url,
       scans (id, status, score, created_at, issues (severity))`
    )
    .order("created_at", { ascending: false });

  // Latest completed scan per project + totals
  let criticalCount = 0;
  let warningCount = 0;
  const rows = (projects ?? []) as unknown as ProjectRow[];

  for (const p of rows) {
    for (const s of p.scans) {
      if (s.status === "completed") {
        criticalCount += s.issues.filter((i) => i.severity === "critical").length;
        warningCount += s.issues.filter((i) => i.severity === "high" || i.severity === "medium").length;
      }
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {greeting()}
              {user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Your websites at a glance.</p>
          </div>
          <Link
            href="/scan/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            + New Scan
          </Link>
        </div>

        {/* Summary stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Projects" value={String(rows.length)} />
          <StatCard label="Critical issues" value={String(criticalCount)} accent="text-red-400" />
          <StatCard label="Warnings" value={String(warningCount)} accent="text-yellow-400" />
        </div>

        {/* Projects */}
        <h2 className="mt-12 text-lg font-semibold text-white">Your Projects</h2>
        {rows.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-700 p-10 text-center text-zinc-400">
            No projects yet. Run your first scan to get started.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {rows.map((p) => {
              const latest = [...p.scans]
                .filter((s) => s.status === "completed")
                .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
              const counts = latest
                ? {
                    crit: latest.issues.filter((i) => i.severity === "critical").length,
                    warn: latest.issues.filter((i) => i.severity === "high" || i.severity === "medium").length,
                    ok: latest.issues.filter((i) => i.severity === "low" || i.severity === "info").length,
                  }
                : null;
              return (
                <Link
                  key={p.id}
                  href={`/scan/${latest?.id ?? ""}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-indigo-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="text-xs text-zinc-500">{p.url}</p>
                    </div>
                    {latest && (
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${scoreColour(latest.score ?? 0)}`}>
                          {latest.score}
                        </span>
                        <span className="text-xs text-zinc-500"> /100</span>
                        <p className="text-xs text-zinc-500">{scoreLabel(latest.score ?? 0)}</p>
                      </div>
                    )}
                  </div>

                  {counts ? (
                    <p className="mt-3 text-sm">
                      🔴 {counts.crit} &nbsp; 🟡 {counts.warn} &nbsp; 🟢 {counts.ok}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-zinc-500">No completed scans yet</p>
                  )}

                  <p className="mt-3 text-xs text-zinc-500">
                    Last scanned {timeAgo(latest?.created_at ?? null)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent scans */}
        <h2 className="mt-12 text-lg font-semibold text-white">Recent Scans</h2>
        <RecentScans />
      </main>
    </>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}

async function RecentScans() {
  const supabase = await createClient();
  const { data: scans } = await supabase
    .from("scans")
    .select("id, status, score, created_at, error_message, projects (name)")
    .order("created_at", { ascending: false })
    .limit(8);

  const list = scans ?? [];
  if (list.length === 0) {
    return <p className="mt-4 text-sm text-zinc-500">No scans yet.</p>;
  }

  return (
    <div className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
      {list.map((s) => (
        <Link
          key={s.id}
          href={`/scan/${s.id}`}
          className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-white">
              {"projects" in s && s.projects && !Array.isArray(s.projects)
                ? (s.projects as { name: string }).name
                : "Scan"}
            </p>
            <p className="text-xs text-zinc-500">{timeAgo(s.created_at)}</p>
          </div>
          <div className="text-right">
            {s.status === "completed" ? (
              <span className={`font-semibold ${scoreColour(s.score ?? 0)}`}>{s.score}</span>
            ) : s.status === "failed" ? (
              <span className="text-sm text-red-400">Failed</span>
            ) : (
              <span className="text-sm text-zinc-400">Running…</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

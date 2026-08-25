/**
 * Individual Issue page — full description + AI fix prompt.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import IssueBadge from "@/components/IssueBadge";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

interface IssueRow {
  id: string;
  scan_id: string;
  category: string;
  title: string;
  description: string;
  impact: string | null;
  severity: string;
  confidence: number | null;
  evidence: Record<string, unknown> | null;
  ai_prompt: string | null;
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ scanId: string; issueId: string }>;
}) {
  const { scanId, issueId } = await params;
  const supabase = await createClient();

  const { data: issue } = await supabase
    .from("issues")
    .select("*")
    .eq("id", issueId)
    .maybeSingle();

  if (!issue) notFound();
  const i = issue as unknown as IssueRow;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link href={`/scan/${scanId}`} className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to scan results
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <IssueBadge severity={i.severity} />
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-400">
            {i.category.replace("_", " ")}
          </span>
          {i.confidence !== null && (
            <span className="text-xs text-zinc-500">Confidence: {i.confidence}%</span>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold text-white">{i.title}</h1>

        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold text-white">What is wrong?</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{i.description}</p>
        </section>

        {i.impact && (
          <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="font-semibold text-white">Why does it matter?</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{i.impact}</p>
          </section>
        )}

        <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold text-white">Evidence</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
            {JSON.stringify(i.evidence ?? {}, null, 2)}
          </pre>
        </section>

        <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">AI Fix Prompt</h2>
            {i.ai_prompt && <CopyButton text={i.ai_prompt} label="Copy Prompt" />}
          </div>
          <textarea
            readOnly
            value={i.ai_prompt ?? "No prompt generated for this issue."}
            rows={16}
            className="mt-3 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300 focus:outline-none"
          />
        </section>
      </main>
    </>
  );
}

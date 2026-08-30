"use client";

/**
 * ScanStatus — polls the scan API while running, then refreshes the page.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Props {
  scanId: string;
  initialStatus: string;
}

export default function ScanStatus({ scanId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  const done = status === "completed" || status === "failed";

  useEffect(() => {
    if (done) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scans", filter: `id=eq.${scanId}` },
        (payload: RealtimePostgresChangesPayload<{ status: string }>) => {
          const next = payload.new as { status?: string } | null;
          if (next?.status) setStatus(next.status);
        }
      )
      .subscribe();

    // Fallback polling in case realtime isn't enabled on the project.
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (res.ok) {
          const data = (await res.json()) as { scan?: { status?: string } };
          if (data.scan?.status) setStatus(data.scan.status);
        }
      } catch {
        // ignore transient errors
      }
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [scanId, done]);

  useEffect(() => {
    if (done) router.refresh();
  }, [done, router]);

  if (status === "failed") {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center">
        <p className="font-medium text-red-300">Scan failed</p>
        <p className="mt-1 text-sm text-zinc-400">
          We couldn&apos;t scan this website. Check the URL is public and reachable, then try again.
        </p>
      </div>
    );
  }

  if (!done) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <span className="mx-auto mb-4 block h-3 w-3 animate-pulse rounded-full bg-accent" />
        <p className="font-medium text-white">Scanning your website…</p>
        <p className="mt-1 text-sm text-zinc-400">
          This usually takes 15–60 seconds. The page will update automatically.
        </p>
      </div>
    );
  }

  return null;
}

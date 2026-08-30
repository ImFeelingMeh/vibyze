"use client";

/**
 * RescanButton — re-runs a scan for the same project URL without going
 * through the New Scan form.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  url: string;
  projectName?: string;
}

export default function RescanButton({ url, projectName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRescan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, projectName }),
      });
      const data = (await res.json()) as { scanId?: string; error?: string };
      if (!res.ok || !data.scanId) {
        setError(data.error ?? "Could not start a rescan.");
        setLoading(false);
        return;
      }
      router.push(`/scan/${data.scanId}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleRescan}
        disabled={loading}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-accent/60 hover:text-accent disabled:opacity-50 transition-colors"
      >
        {loading ? "Starting…" : "Rescan"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

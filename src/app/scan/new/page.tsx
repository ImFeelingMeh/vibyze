/**
 * New Scan — URL form with validation and loading state.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NewScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic client-side sanity check; server validates properly.
    let candidate = url.trim();
    if (candidate && !/^https?:\/\//i.test(candidate)) {
      candidate = `https://${candidate}`;
    }
    try {
      new URL(candidate);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: candidate, projectName: projectName.trim() || undefined }),
      });
      const data = (await res.json()) as { scanId?: string; error?: string };
      if (!res.ok || !data.scanId) {
        setError(data.error ?? "Something went wrong starting the scan.");
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
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-bold text-white">New Scan</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Enter your website URL. Vibyze will analyze it and generate AI fix prompts.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-zinc-300">
              Website URL
            </label>
            <input
              id="url"
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
              Project name <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My SaaS"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Starting scan…" : "Start Scan"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-center text-sm text-zinc-400">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
            Queuing your scan…
          </div>
        )}
      </main>
    </>
  );
}

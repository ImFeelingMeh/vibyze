"use client";

/**
 * Login page — magic-link (passwordless) sign-in via Supabase Auth.
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser to Google — no further action needed here.
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8" aria-label="Vibyze home">
        <Image src="/logo.png" alt="Vibyze" width={300} height={100} className="h-12 w-auto" priority />
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-xl font-semibold text-white">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-400">
          We&apos;ll email you a magic link — no password needed.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-300">
            Check your inbox! Click the link in the email we sent to{" "}
            <strong>{email}</strong> to sign in.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 py-2 font-medium text-white hover:border-zinc-500 disabled:opacity-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.65z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.31 14.32c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32V6.59H1.3A11.98 11.98 0 000 12c0 1.93.46 3.76 1.3 5.41z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.59l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"
                />
              </svg>
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            <div className="mt-6 flex items-center gap-3 text-xs text-zinc-500">
              <div className="h-px flex-1 bg-zinc-800" />
              or
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <form onSubmit={handleSendLink} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-accent focus:outline-none"
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
                className="w-full rounded-md bg-accent py-2 font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

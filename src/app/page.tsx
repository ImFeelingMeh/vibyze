/**
 * Landing Page — public marketing page for Vibyze.
 */
import Image from "next/image";
import Link from "next/link";
import IssueBadge from "@/components/IssueBadge";

const steps = [
  { n: "01", title: "Enter your URL", desc: "Paste the link to the website you built with AI." },
  { n: "02", title: "Vibyze scans it", desc: "Deterministic checks for SEO, accessibility, performance, mobile and security." },
  { n: "03", title: "Get plain-English issues", desc: "Every issue is explained like a senior dev would explain it to you." },
  { n: "04", title: "Copy the AI fix prompt", desc: "Paste it into your coding AI, fix the issue, and rescan." },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#0b0a08]/85 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-[#0b0a08]/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Image src="/logo.png" alt="Vibyze" width={300} height={100} className="h-12 w-auto" priority />
          <Link
            href="/login"
            className="rounded-md border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:border-accent/60 hover:text-accent transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-28 pb-16 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Build with AI. <span className="text-accent">Review with Vibyze.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Vibyze analyzes your website, explains what&apos;s wrong in plain English,
            and gives your coding AI a prompt to fix it.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/scan/new"
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground hover:bg-accent-hover transition-colors"
            >
              Scan my website — free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-300 hover:border-accent/60 hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Example issue */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
            <div className="flex items-center gap-3">
              <IssueBadge severity="medium" />
              <h2 className="font-semibold">Images without alt text</h2>
              <span className="ml-auto text-sm text-zinc-500">Confidence: 98%</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              Your homepage has 4 images missing alt attributes. Screen readers can&apos;t
              describe them to visually impaired visitors, and search engines can&apos;t index them properly.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
{`You are working on my website project.

Vibyze detected: Images without alt text (Medium)

Evidence: 4 images on the homepage have no alt attribute.

Task:
Add meaningful alt text to each affected image.
Use empty alt="" for purely decorative images.

Verify all images pass an accessibility audit afterwards.`}
            </pre>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <h2 className="text-center text-2xl font-bold">How Vibyze works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="border-t-2 border-accent pt-4">
                <span className="text-sm font-semibold text-accent">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Score concept */}
        <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <h2 className="text-2xl font-bold">One score for your whole site</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Every scan produces a Vibyze Score from 0–100, with per-category breakdowns so
            you know exactly where to focus.
          </p>
          <div className="mt-8 inline-flex items-baseline gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-10 py-6">
            <span className="text-5xl font-extrabold text-accent">84</span>
            <span className="text-lg text-zinc-400">/ 100 · Good</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
          Vibyze — AI-powered website analysis for vibe coders.
        </footer>
      </main>
    </>
  );
}

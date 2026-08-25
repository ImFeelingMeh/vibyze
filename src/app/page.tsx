/**
 * Landing Page — public marketing page for Vibyze.
 */
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center bg-gradient-to-b from-indigo-50 to-white">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl">
          Fix your website — even if you&apos;re not a developer.
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-xl">
          Vibyze scans your website, explains every issue in plain English, and
          gives you a ready-to-use AI prompt to fix it instantly.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/scan/new"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
          >
            Scan my website
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How Vibyze works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
          {[
            { step: "1", title: "Enter your URL", desc: "Paste the URL of any website you want to analyse." },
            { step: "2", title: "We scan it", desc: "Vibyze checks for performance, SEO, accessibility, and more." },
            { step: "3", title: "Plain-English issues", desc: "Every problem is explained so anyone can understand it." },
            { step: "4", title: "Copy the AI fix", desc: "Get a ready-made prompt to paste into ChatGPT or Cursor." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold">
                {step}
              </span>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        &copy; {new Date().getFullYear()} Vibyze. Built for vibe coders everywhere.
      </footer>
    </main>
  );
}

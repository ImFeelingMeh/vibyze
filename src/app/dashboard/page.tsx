/**
 * Dashboard — shows all of the user's projects and their latest scan status.
 */
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link
            href="/scan/new"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            + New Scan
          </Link>
        </div>

        {/* TODO: Replace with real data from the database */}
        <div className="rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-lg">No projects yet.</p>
          <p className="mt-2 text-sm">
            Add your first website and run a scan to get started.
          </p>
          <Link
            href="/scan/new"
            className="mt-6 inline-block text-sm text-indigo-600 hover:underline"
          >
            Start your first scan →
          </Link>
        </div>
      </main>
    </>
  );
}

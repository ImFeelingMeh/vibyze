/**
 * Scan Results page — lists all issues found in a specific scan.
 */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import IssueBadge from "@/components/IssueBadge";
import { scanStatusLabel } from "@/lib/utils";

interface Props {
  params: Promise<{ scanId: string }>;
}

export default async function ScanResultsPage({ params }: Props) {
  const { scanId } = await params;

  // TODO: Fetch real scan + issues from the database using `scanId`
  const scan = {
    id: scanId,
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
    project: { name: "My Website", url: "https://example.com" },
  };

  const issues = [
    {
      id: "issue-1",
      title: "Missing alt text on images",
      severity: "HIGH",
      category: "Accessibility",
    },
    {
      id: "issue-2",
      title: "Page load time exceeds 3 seconds",
      severity: "MEDIUM",
      category: "Performance",
    },
    {
      id: "issue-3",
      title: "Missing meta description",
      severity: "LOW",
      category: "SEO",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{scan.project.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{scan.project.url}</p>
          </div>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1">
            {scanStatusLabel(scan.status)}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Issues found ({issues.length})
        </h2>

        <ul className="space-y-3">
          {issues.map((issue) => (
            <li key={issue.id}>
              <Link
                href={`/scan/${scanId}/issue/${issue.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <IssueBadge severity={issue.severity} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{issue.category}</p>
                  </div>
                </div>
                <span className="text-gray-300 text-lg">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

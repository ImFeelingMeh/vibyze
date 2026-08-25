/**
 * Individual Issue page — full description + AI fix prompt.
 */
import Link from "next/link";
import Navbar from "@/components/Navbar";
import IssueBadge from "@/components/IssueBadge";
import CopyButton from "@/components/CopyButton";

interface Props {
  params: Promise<{ scanId: string; issueId: string }>;
}

export default async function IssuePage({ params }: Props) {
  const { scanId, issueId } = await params;

  // TODO: Fetch real issue data from the database using `issueId`
  const issue = {
    id: issueId,
    title: "Missing alt text on images",
    severity: "HIGH",
    category: "Accessibility",
    affectedElement: "img:not([alt])",
    description:
      "Several images on your page are missing alt text. Alt text is a short written description of an image. " +
      "Screen readers — tools used by visually impaired people — read this text aloud so everyone can understand " +
      "what the image shows. Without it, those users miss out on your content, and search engines also struggle " +
      "to understand your page.",
    aiPrompt:
      "I have a website and some of my images are missing alt text, which is causing accessibility issues. " +
      "Please help me add meaningful alt text to all images on my page. " +
      "Here is my HTML: [PASTE YOUR HTML HERE]. " +
      "For each image, suggest a short, descriptive alt attribute that explains what the image shows.",
  };

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href={`/scan/${scanId}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to scan results
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <IssueBadge severity={issue.severity} />
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {issue.category}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{issue.title}</h1>

        {issue.affectedElement && (
          <div className="mb-6 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Affected element</p>
            <code className="text-sm text-gray-700">{issue.affectedElement}</code>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            What does this mean?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            AI fix prompt
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Copy and paste this prompt into ChatGPT, Claude, or your AI coding tool.
          </p>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
            {issue.aiPrompt}
          </div>
          <CopyButton text={issue.aiPrompt} label="Copy AI prompt" />
        </section>
      </main>
    </>
  );
}

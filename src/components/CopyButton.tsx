/**
 * CopyButton — copies text to clipboard and shows feedback.
 */
"use client";

import { useState } from "react";

interface Props {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Copy" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

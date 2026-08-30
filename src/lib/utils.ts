/**
 * Utility helpers used throughout Vibyze.
 */

/**
 * Returns a Tailwind colour class based on issue severity.
 */
export function severityColour(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-red-400 bg-red-950/60 border border-red-900";
    case "high":
      return "text-orange-400 bg-orange-950/60 border border-orange-900";
    case "medium":
      return "text-accent bg-accent-muted/60 border border-accent-muted";
    case "low":
      return "text-sky-400 bg-sky-950/60 border border-sky-900";
    default:
      return "text-zinc-400 bg-zinc-800 border border-zinc-700";
  }
}

/**
 * Returns a human-readable label for a scan status.
 */
export function scanStatusLabel(status: string): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Scanning…";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

/**
 * Formats an ISO date string to a readable date.
 */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns a time ago string.
 */
export function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

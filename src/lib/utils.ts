/**
 * Utility helpers used throughout Vibyze.
 */

/**
 * Returns a Tailwind colour class based on issue severity.
 */
export function severityColour(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "text-red-600 bg-red-50";
    case "HIGH":
      return "text-orange-600 bg-orange-50";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-green-600 bg-green-50";
  }
}

/**
 * Returns a human-readable label for a scan status.
 */
export function scanStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Queued";
    case "RUNNING":
      return "Scanning…";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

/**
 * Formats an ISO date string to a readable date.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

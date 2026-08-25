import { z } from "zod";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * URL validation + SSRF protection.
 * All user-supplied URLs must pass through here before any fetch happens.
 */

export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048)
  .url("Enter a valid URL (including https://)")
  .refine((u) => /^https?:$/.test(new URL(u).protocol), {
    message: "Only http:// and https:// URLs are supported",
  });

export function validateUrl(input: string): { ok: true; url: string } | { ok: false; error: string } {
  const parsed = urlSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid URL" };
  }

  let hostname: string;
  try {
    hostname = new URL(parsed.data).hostname;
  } catch {
    return { ok: false, error: "Invalid URL" };
  }

  // Block obvious hostnames used for internal access / cloud metadata.
  const blockedHosts = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "[::1]",
    "::1",
    "metadata.google.internal",
    "169.254.169.254",
  ]);
  if (blockedHosts.has(hostname.toLowerCase())) {
    return { ok: false, error: "This URL is not allowed." };
  }
  if (hostname.endsWith(".localhost") || hostname.endsWith(".internal")) {
    return { ok: false, error: "This URL is not allowed." };
  }

  // Block raw IPs in private/reserved ranges.
  if (isIP(hostname)) {
    if (!isPublicIp(hostname)) {
      return { ok: false, error: "Private IP addresses are not allowed." };
    }
  }

  return { ok: true, url: parsed.data };
}

function isPublicIp(ip: string): boolean {
  if (ip === "::1") return false;
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 10 || a === 127 || a === 0) return false; // private/loopback
    if (a === 172 && b >= 16 && b <= 31) return false; // private
    if (a === 192 && b === 168) return false; // private
    if (a === 169 && b === 254) return false; // link-local (incl. cloud metadata)
    if (a >= 224) return false; // multicast/reserved
    return true;
  }
  // IPv6: block loopback, link-local (fe80::), unique-local (fc00::/7)
  const lower = ip.toLowerCase();
  if (lower === "::" || lower.startsWith("fe80") || lower.startsWith("fc") || lower.startsWith("fd")) {
    return false;
  }
  return true;
}

/**
 * Resolve the hostname and verify it doesn't point at a private address.
 * Call immediately before fetching to prevent DNS-rebinding style SSRF.
 */
export async function assertResolvableAndPublic(url: string): Promise<void> {
  const hostname = new URL(url).hostname.replace(/^\[|\]$/g, "");
  if (isIP(hostname)) return; // already validated as public

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) {
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }
  for (const record of records) {
    if (!isPublicIp(record.address)) {
      throw new Error("The website resolves to a private address, which is not allowed.");
    }
  }
}

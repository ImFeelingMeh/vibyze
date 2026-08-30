import * as cheerio from "cheerio";

/**
 * Deterministic website checks. Each check returns raw evidence;
 * interpretation/severity is applied by the issue engine.
 */

export interface CheckResult {
  category: "seo" | "accessibility" | "performance" | "mobile" | "security" | "ux";
  id: string; // stable check identifier
  title: string;
  evidence: Record<string, unknown>;
  /** true = issue detected */
  issue: boolean;
  /** suggested severity before AI review */
  severity: "critical" | "high" | "medium" | "low" | "info";
}

export interface PageFetch {
  url: string;
  finalUrl: string;
  status: number;
  html: string;
  headers: Record<string, string>;
  loadMs: number;
  htmlBytes: number;
}

export async function fetchPage(url: string, timeoutMs = 20000): Promise<PageFetch> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VibyzeBot/1.0)" },
    });
    const html = await res.text();
    return {
      url,
      finalUrl: res.url || url,
      status: res.status,
      html,
      headers: Object.fromEntries(res.headers.entries()),
      loadMs: Date.now() - started,
      htmlBytes: Buffer.byteLength(html),
    };
  } finally {
    clearTimeout(timer);
  }
}

export function runChecks(page: PageFetch): CheckResult[] {
  const results: CheckResult[] = [];
  const $ = cheerio.load(page.html);

  // ── SEO ────────────────────────────────────────────────────────────────
  const title = $("head title").first().text().trim();
  results.push({
    category: "seo",
    id: "missing-title",
    title: "Missing page title",
    evidence: { found: title.length > 0, title },
    issue: !title,
    severity: "high",
  });

  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  results.push({
    category: "seo",
    id: "missing-meta-description",
    title: "Missing meta description",
    evidence: { length: metaDescription.length },
    issue: metaDescription.length === 0,
    severity: "medium",
  });

  // Heading structure
  const h1Count = $("h1").length;
  const headings = $("h1, h2, h3, h4, h5, h6").length;
  let hierarchySkips = 0;
  let prevLevel = 0;
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = Number(el.tagName[1]);
    if (prevLevel > 0 && level > prevLevel + 1) hierarchySkips++;
    prevLevel = level;
  });
  results.push({
    category: "seo",
    id: "heading-structure",
    title: "Heading structure problems",
    evidence: { h1Count, totalHeadings: headings, hierarchySkips },
    issue: h1Count !== 1 || (headings > 0 && hierarchySkips > 0),
    severity: h1Count === 0 ? "medium" : "low",
  });

  const ogTags = ['og:title', 'og:description', 'og:image'].filter(
    (p) => $(`meta[property="${p}"]`).length === 0
  );
  results.push({
    category: "seo",
    id: "missing-open-graph",
    title: "Missing Open Graph metadata",
    evidence: { missing: ogTags },
    issue: ogTags.length > 0,
    severity: "low",
  });

  // Broken internal links (checked separately in linkCheck below)
  const links = $("a[href]").map((_, el) => $(el).attr("href")!).get();
  results.push({ category: "seo", id: "_links", title: "Links", evidence: { links }, issue: false, severity: "info" });

  // ── Accessibility ──────────────────────────────────────────────────────
  const imagesWithoutAlt = $("img:not([alt])").length;
  results.push({
    category: "accessibility",
    id: "img-missing-alt",
    title: "Images without alt text",
    evidence: { count: imagesWithoutAlt },
    issue: imagesWithoutAlt > 0,
    severity: imagesWithoutAlt > 3 ? "medium" : "low",
  });

  const inputs = $("input:not([type=hidden]):not([type=submit]):not([type=button])");
  let unlabeledInputs = 0;
  inputs.each((_, el) => {
    const $el = $(el);
    const id = $el.attr("id");
    const hasLabel =
      (id && $(`label[for="${id}"]`).length > 0) ||
      $el.attr("aria-label") ||
      $el.attr("aria-labelledby") ||
      $el.closest("label").length > 0;
    if (!hasLabel) unlabeledInputs++;
  });
  results.push({
    category: "accessibility",
    id: "form-missing-labels",
    title: "Form inputs without labels",
    evidence: { count: unlabeledInputs },
    issue: unlabeledInputs > 0,
    severity: "medium",
  });

  const unnamedButtons = $("button").filter((_, el) => {
    const $el = $(el);
    return (
      !$el.text().trim() &&
      !$el.attr("aria-label") &&
      !$el.attr("title") &&
      $el.find("img[alt], svg[aria-label]").length === 0
    );
  }).length;
  results.push({
    category: "accessibility",
    id: "buttons-no-accessible-name",
    title: "Buttons without accessible names",
    evidence: { count: unnamedButtons },
    issue: unnamedButtons > 0,
    severity: "medium",
  });

  const landmarks = $("main, [role=main], nav, header, footer").length;
  results.push({
    category: "accessibility",
    id: "missing-landmarks",
    title: "No landmark elements",
    evidence: { count: landmarks },
    issue: landmarks === 0,
    severity: "low",
  });

  const langAttr = $("html").attr("lang");
  results.push({
    category: "accessibility",
    id: "html-lang",
    title: "Missing lang attribute on <html>",
    evidence: { lang: langAttr ?? null },
    issue: !langAttr,
    severity: "low",
  });

  // ── Performance ────────────────────────────────────────────────────────
  const scripts = $("script[src]").length;
  const inlineScriptBytes = $("script:not([src])")
    .map((_, el) => Buffer.byteLength($(el).html() ?? ""))
    .get()
    .reduce((a, b) => a + b, 0);
  results.push({
    category: "performance",
    id: "excessive-scripts",
    title: "Large amount of JavaScript",
    evidence: { externalScripts: scripts, inlineScriptBytes },
    issue: scripts > 15 || inlineScriptBytes > 100_000,
    severity: scripts > 30 ? "medium" : "low",
  });

  const renderBlocking = $("link[rel=stylesheet]:not([media='print']):not([defer])").length;
  results.push({
    category: "performance",
    id: "render-blocking-css",
    title: "Render-blocking stylesheets",
    evidence: { count: renderBlocking },
    issue: renderBlocking > 4,
    severity: "low",
  });

  const largeImages = $("img[src]").filter((_, el) => {
    const src = $(el).attr("src") ?? "";
    return /\.(png|jpe?g|bmp|tiff?)($|\?)/i.test(src) && !src.includes("?w=") && !src.includes("&w=");
  }).length;
  results.push({
    category: "performance",
    id: "unoptimized-images",
    title: "Possibly unoptimized raster images",
    evidence: { count: largeImages },
    issue: largeImages > 5,
    severity: "low",
  });

  results.push({
    category: "performance",
    id: "slow-response",
    title: "Slow server response",
    evidence: { loadMs: page.loadMs, status: page.status },
    issue: page.loadMs > 3000,
    severity: page.loadMs > 8000 ? "high" : "medium",
  });

  // ── Mobile ─────────────────────────────────────────────────────────────
  const viewport = $('meta[name="viewport"]').attr("content") ?? "";
  results.push({
    category: "mobile",
    id: "viewport-meta",
    title: "Missing or invalid viewport meta tag",
    evidence: { viewport: viewport || null },
    issue: !viewport.includes("width=device-width"),
    severity: "high",
  });

  const fixedWidth = $('[style*="width:"]').filter((_, el) =>
    /width:\s*\d{4,}px/i.test($(el).attr("style") ?? "")
  ).length;
  results.push({
    category: "mobile",
    id: "fixed-width-elements",
    title: "Fixed-width elements may cause horizontal overflow on mobile",
    evidence: { count: fixedWidth },
    issue: fixedWidth > 0,
    severity: "low",
  });

  // ── Security ───────────────────────────────────────────────────────────
  if (!page.finalUrl.startsWith("https://")) {
    results.push({
      category: "security",
      id: "insecure-http",
      title: "Website served over insecure HTTP",
      evidence: { url: page.finalUrl },
      issue: true,
      severity: "critical",
    });
  }

  const missingHeaders = [
    "strict-transport-security",
    "content-security-policy",
    "x-content-type-options",
    "x-frame-options",
  ].filter((h) => !(h in page.headers));
  results.push({
    category: "security",
    id: "missing-security-headers",
    title: "Missing security response headers",
    evidence: { missing: missingHeaders },
    issue: missingHeaders.length > 0,
    severity: missingHeaders.includes("content-security-policy") ? "medium" : "low",
  });

  // Mixed content: http:// subresources on an https page
  if (page.finalUrl.startsWith("https://")) {
    const mixed = $("script[src^='http:'], img[src^='http:'], iframe[src^='http:'], link[href^='http:']").length;
    results.push({
      category: "security",
      id: "mixed-content",
      title: "Mixed content (insecure resources on HTTPS page)",
      evidence: { count: mixed },
      issue: mixed > 0,
      severity: mixed > 0 ? "high" : "info",
    });
  }

  // Secrets that should never legitimately appear in client-facing HTML.
  // Client-restricted keys (Google/Firebase/Maps API keys, etc.) are deliberately
  // public by design (restricted server-side by referrer/quota) and are excluded
  // to avoid flagging normal sites like YouTube/Google Maps embeds.
  const secretPatterns: Array<{ name: string; pattern: RegExp; severity: CheckResult["severity"] }> = [
    { name: "AWS access key ID", pattern: /\bAKIA[0-9A-Z]{16}\b/, severity: "critical" },
    { name: "Private key block", pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, severity: "critical" },
    { name: "Stripe secret key", pattern: /\bsk_(live|test)_[0-9a-zA-Z]{24,}\b/, severity: "critical" },
    { name: "Slack token", pattern: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/, severity: "critical" },
  ];
  const secretsFound = secretPatterns
    .filter(({ pattern }) => pattern.test(page.html))
    .map(({ name }) => name);

  // JWT-shaped strings are common for legitimately public tokens (analytics,
  // ID tokens), so only flag ones that actually decode as a JWT header, and
  // treat them as a lower-confidence signal rather than a hard secret match.
  const jwtMatch = page.html.match(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/);
  if (jwtMatch && looksLikeJwt(jwtMatch[0])) {
    secretsFound.push("Possible JWT / bearer token");
  }

  const maxSeverity = secretsFound.some((s) => s !== "Possible JWT / bearer token") ? "critical" : "medium";
  results.push({
    category: "security",
    id: "exposed-secrets",
    title: "Possible credentials exposed in page source",
    evidence: { matches: secretsFound },
    issue: secretsFound.length > 0,
    severity: maxSeverity,
  });

  return results;
}

/** Decode a JWT's header segment and check it looks like real JWT metadata. */
function looksLikeJwt(token: string): boolean {
  try {
    const header = token.split(".")[0];
    const json = Buffer.from(header, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { alg?: unknown; typ?: unknown };
    return typeof parsed.alg === "string";
  } catch {
    return false;
  }
}

/** Check up to N unique same-origin links for broken responses. */
export async function checkLinks(page: PageFetch, limit = 10): Promise<string[]> {
  const base = new URL(page.finalUrl);
  const hrefs = [...new Set(
    (page.html.match(/href="(\/[^"]*)"/g) ?? [])
      .map((m) => m.slice(6, -1))
      .slice(0, limit)
  )];
  const broken: string[] = [];
  await Promise.all(
    hrefs.map(async (path) => {
      try {
        const abs = new URL(path, base).toString();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(abs, { method: "HEAD", signal: controller.signal, redirect: "follow" });
        clearTimeout(timer);
        if (res.status >= 400) broken.push(`${path} (${res.status})`);
      } catch {
        broken.push(`${path} (unreachable)`);
      }
    })
  );
  return broken;
}

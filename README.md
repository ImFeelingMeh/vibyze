# Vibyze

**AI-powered website analysis for vibe coders.** Vibyze scans your website, explains what's wrong in plain English, and generates a copy-pasteable AI fix prompt so your coding AI (Cursor, Copilot, Claude) can fix it.

```
Enter URL → Scan → Categorized issues → Plain-English explanations → Copy AI fix prompt → Fix → Rescan
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (magic link) |
| AI | OpenAI-compatible chat API (server-side only) |
| Validation | Zod |
| HTML analysis | cheerio |

## Project Structure

```
src/
  app/                  # Pages & API routes
    api/scans/          # POST create scan, GET scan status
    api/projects/       # GET/POST projects
    auth/callback/      # Supabase OAuth/magic-link exchange
    dashboard/          # Projects overview + recent scans
    login/              # Magic-link sign-in
    scan/new/           # New scan form
    scan/[scanId]/      # Scan results (score, issues)
    scan/[scanId]/issue/[issueId]/   # Issue detail + AI prompt
    settings/           # Profile
  components/           # Navbar, IssueBadge, CopyButton, ScanStatus…
  lib/
    supabase/           # Server/browser Supabase clients
    scanner/            # urlGuard (SSRF), checks (deterministic), scanRunner
    ai/                 # aiService, promptGenerator
    scoring/            # scoreCalculator (centralized scoring)
    utils.ts
supabase/
  migrations/           # SQL schema + RLS policies
  config.toml           # Local Supabase CLI config
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to get it | Visibility |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page | **Secret** — server-only, never expose |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | **Secret** — server-only. Optional: without it, scans still work using deterministic template prompts |
| `AI_MODEL` | Optional override, default `gpt-4o-mini` | Public |
| `OPENAI_BASE_URL` | Optional — point at Groq/Ollama/etc. | Public |
| `NEXT_PUBLIC_APP_URL` | Your app URL, e.g. `http://localhost:3000` | Public |

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` and add redirect URL `http://localhost:3000/auth/callback`.
3. Magic-link emails are sent by Supabase automatically (rate-limited on the free tier).

### 2. Run migrations

In the Supabase Dashboard open **SQL Editor**, paste the contents of `supabase/migrations/00001_initial_schema.sql`, and run it.

Or with the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

This creates `profiles`, `projects`, `scans`, `issues` with Row Level Security enforcing that users can only ever read/write their own data (enforced in the database, not just the UI).

### 3. Configure env & run

```bash
cp .env.example .env    # fill in your values
npm install
npm run dev
```

Open http://localhost:3000, sign in with a magic link, and start scanning.

## How Scanning Works

1. **Validation & SSRF protection** — URLs are validated with Zod; DNS is resolved and checked against private/reserved IP ranges before any request (`src/lib/scanner/urlGuard.ts`). localhost, `.internal`, cloud metadata endpoints, and private IPs are blocked.
2. **Deterministic checks** — the page is fetched once and analyzed with cheerio: SEO (title, meta description, headings, OG tags, broken links), accessibility (alt text, form labels, button names, landmarks, lang), performance (script count, render-blocking CSS, response time), mobile (viewport, fixed-width elements), security (HTTPS, security headers, mixed content, exposed credential patterns).
3. **AI enrichment** — each detected issue is sent to the LLM *with its evidence* to produce a beginner-friendly explanation and a specific AI fix prompt. If no API key is set or the call fails, deterministic template content is used instead — scans never break because of AI.
4. **Scoring** — severity-weighted deductions from 100, centralized in `scoreCalculator.ts`.

## Known Limitations (MVP)

- Single-page scan only — no crawling of subpages.
- No headless browser: no rendered-layout checks, real Core Web Vitals, or JS-executed contrast analysis.
- Scans run in-process (fire-and-forget); a queue/worker would be needed for scale.
- Contrast checking and full WCAG auditing not included.
- Profile editing / account deletion are placeholders.

## Roadmap

- **V2**: GitHub integration, private repo/code scanning, dependency vulnerability analysis, scan comparisons, continuous monitoring.
- **V3**: AI fix verification, GitHub PR generation, Cursor/Claude Code integrations, team workspaces, notifications, billing.

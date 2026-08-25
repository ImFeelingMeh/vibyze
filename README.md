# Vibyze

> AI-powered website analysis for vibe coders, beginners, and anyone using AI coding tools.

**User enters a URL → Vibyze scans the site → identifies issues → explains each one in plain English → provides a copy-pasteable AI prompt to fix it.**

---

## Recommended Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router, TypeScript) | Full-stack React framework; great DX and performance |
| **Styling / UI** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first; fast to build clean UIs without a design system |
| **Backend** | Next.js API Routes (Route Handlers) | Co-located with the frontend; no separate server needed for MVP |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) or [Railway](https://railway.app/) | Managed, free tier available, simple to connect |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe DB queries; great for beginners |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) | OAuth (GitHub / Google) + credentials out of the box |
| **Website Scanning** | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) / [Playwright](https://playwright.dev/) | Lighthouse for performance/SEO/a11y; Playwright for DOM checks |
| **AI Prompts** | Generated server-side from issue templates | Simple string templating for MVP; hook up to OpenAI later |
| **Deployment** | [Vercel](https://vercel.com/) | Zero-config Next.js deployment |

---

## Project Structure

```
vibyze/
├── prisma/
│   └── schema.prisma          # Database schema (User, Project, Scan, Issue, AIPrompt)
├── public/                    # Static assets (favicon, images)
├── src/
│   ├── app/                   # Next.js App Router pages + API routes
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout (fonts, global CSS)
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard — lists all projects
│   │   ├── scan/
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # New Scan form
│   │   │   └── [scanId]/
│   │   │       ├── page.tsx   # Scan Results — issue list
│   │   │       └── issue/
│   │   │           └── [issueId]/
│   │   │               └── page.tsx  # Individual Issue + AI prompt
│   │   ├── settings/
│   │   │   └── page.tsx       # Account / Settings
│   │   └── api/
│   │       ├── scans/
│   │       │   └── route.ts   # POST /api/scans
│   │       └── projects/
│   │           └── route.ts   # GET & POST /api/projects
│   ├── components/
│   │   ├── Navbar.tsx         # Top navigation
│   │   ├── IssueBadge.tsx     # Severity colour badge
│   │   └── CopyButton.tsx     # Clipboard copy button
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Shared helper functions
│   └── types/
│       └── index.ts           # Shared TypeScript interfaces
├── .env.example               # Required environment variables
├── package.json
└── README.md
```

---

## Core Data Models

### User
Managed by NextAuth. Stores basic profile info and owns many Projects.

### Project
Represents a website the user wants to analyse. Has a `name` and `url`. Belongs to a User and has many Scans.

### Scan
One analysis run on a Project. Tracks `status` (`PENDING → RUNNING → COMPLETED / FAILED`) and timestamps. Has many Issues.

### Issue
A single problem found during a Scan. Includes:
- `title` — short name
- `description` — beginner-friendly plain-English explanation
- `severity` — `LOW | MEDIUM | HIGH | CRITICAL`
- `category` — e.g. Performance, SEO, Accessibility
- `affectedElement` — CSS selector or URL

### AIPrompt
A copy-pasteable AI prompt attached 1:1 to an Issue. Contains the `prompt` text.

---

## Core Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Marketing page; hero, how-it-works, CTA |
| Dashboard | `/dashboard` | All projects and latest scan status |
| New Scan | `/scan/new` | Form to enter a URL and start a scan |
| Scan Results | `/scan/[scanId]` | List of issues found in a scan |
| Issue Detail | `/scan/[scanId]/issue/[issueId]` | Full explanation + AI fix prompt |
| Settings | `/settings` | Account details |

---

## Basic User Flow

```
Sign up (OAuth or email/password)
  └─→ Dashboard
        └─→ New Scan  (enter URL + project name)
              └─→ Scan runs in background
                    └─→ Scan Results page  (issue list)
                          └─→ Individual Issue page
                                └─→ Read plain-English explanation
                                └─→ Copy AI fix prompt  →  paste into ChatGPT / Cursor
                          └─→ Re-scan  (button on results page)
```

---

## MVP Scope

### ✅ Build for MVP
- User authentication (GitHub OAuth via NextAuth)
- Add a website (project) with a URL
- Trigger a scan and show a loading state
- Run Lighthouse analysis against the URL
- Store results as Issues in the database
- Display issues with severity and plain-English descriptions
- Generate a basic AI fix prompt per issue (template-based)
- Copy prompt to clipboard
- Re-scan a project

### 🔜 Save for later
- Email / password authentication
- Team / organisation support
- Scheduled / continuous monitoring
- GitHub integration (scan PRs / branches)
- AI-generated prompts via OpenAI API
- AI fix verification (auto-check if the fix worked)
- Full scan history with diffs between runs
- Custom scan rules / checklists
- PDF / shareable reports
- API access for CI/CD integration

---

## Future Features

| Feature | Description |
|---|---|
| **GitHub integration** | Scan a repo's preview deployments or PR branches automatically |
| **Codebase analysis** | Detect issues at the source level (missing meta tags in JSX, etc.) |
| **Continuous monitoring** | Schedule daily/weekly scans and alert on regressions |
| **AI fix verification** | Re-run the scan after a fix and confirm the issue is resolved |
| **Scan history & diffs** | Track how a site improves over time |
| **Team features** | Share projects and scans across team members |
| **OpenAI-powered prompts** | Generate dynamic, context-aware AI prompts with GPT-4 |
| **Embeddable badge** | Show a "Vibyze score" badge on your GitHub README |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/ImFeelingMeh/vibyze.git
cd vibyze
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### 3. Set up the database

```bash
npx prisma db push       # push the schema to your database
npx prisma studio        # optional: open the Prisma visual DB browser
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See `.env.example` for the full list of required variables.

# Nuppu Deployment Guide

Architecture: **single Vercel deployment** serves both the static frontend (`dist/`) and the
backend (`api/index.js`, an Express app running as a Vercel Serverless Function). Frontend and
API share one `.fi` domain, e.g. `https://nuppu.fi` and `https://nuppu.fi/api/...`. This keeps
DNS simple (no separate API subdomain) and matches how `api/index.js` is already written
(it exports the Express `app` directly with no `app.listen()` call — the Vercel Node.js
runtime wraps it automatically).

> If a future requirement needs a long-running Node process (e.g. websockets, heavier background
> jobs), the backend can instead be deployed standalone on Railway/Render/Fly with a separate
> `api.nuppu.fi` subdomain — see "Alternative: standalone backend" at the bottom.

Replace `nuppu.fi` everywhere below with the real registered domain once it's chosen.

---

## 0. Repo hygiene: things that need a decision before launch

**Note on an earlier version of this section:** a previous pass of this doc claimed a `.env`
file with real Paytrail credentials had been committed at a specific commit hash. That commit
does not exist in this repo's actual git history (checked 2026-07-18 — the repo has only three
commits, and `.env` was never tracked in any of them; `.gitignore` already excludes it). That
claim appears to have been written against a different repo state and should not be treated as
a confirmed incident. If you know of a `.env` (or any real secret) having been committed and
pushed anywhere at any point, rotate the relevant credentials regardless of what this doc says —
but don't take the specific commit-hash claim above at face value.

**What is actually true right now, and does need attention:**
- `node_modules/` (tens of thousands of files) is still tracked in git, even though
  `.gitignore` already excludes it — untracking only stops *new* changes from being tracked, it
  doesn't remove what's already committed. Clean up with `git rm -r --cached node_modules` in a
  dedicated commit.
- `dist/` (build output) is also still tracked for the same reason — same fix,
  `git rm -r --cached dist`.
- Going forward, only `.env.example` (placeholder values) should ever be committed. Real values
  live in Vercel's environment variable dashboard and each developer's local `.env`.

---

## 1. Register the domain

Register a `.fi` domain (e.g. via Louhi, Domain.fi, Fonecta, or a `.fi`-eligible Vercel/Cloudflare
partner). `.fi` domains require a Finnish Y-tunnus (business ID) or EU/EEA residency for the
registrant — confirmed this is already satisfied per the project brief.

## 2. DNS records (at your registrar)

Point the domain at Vercel:

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| A | `@` (apex, e.g. `nuppu.fi`) | `76.76.21.21` (Vercel's current apex IP — confirm the current value in Vercel's dashboard when you add the domain, as it can change) | Apex domain |
| CNAME | `www` | `cname.vercel-dns.com` | `www.nuppu.fi` |

Vercel shows the exact records to create the moment you add the domain in
**Project → Settings → Domains** — always use what Vercel shows you there over the values above,
since Vercel's anycast IPs are occasionally updated.

Because this project uses the single-domain architecture, **no separate `api.nuppu.fi` DNS
record is needed** — `/api/*` is served from the same Vercel deployment via the rewrite in
`vercel.json`.

HTTPS is automatic (Vercel issues and renews a Let's Encrypt certificate once DNS is verified).
`vercel.json` also sets `Strict-Transport-Security` and other security headers on every response
(see "Security headers" below), and `api/index.js` sets the same headers itself as a fallback in
case it's ever run outside Vercel.

## 3. MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas), create an M0
   (free tier) cluster in an **EU region** (e.g. `eu-west-1` / Frankfurt/Ireland) — this matters
   for the GDPR "EU-based storage" claim in `GDPR-NOTES.md`.
2. Database Access → create a database user (username + strong password).
3. Network Access → since Vercel Functions have no fixed IP range, add `0.0.0.0/0` (allow from
   anywhere) and rely on the database username/password + a non-guessable database name for
   protection. (Atlas encrypts data at rest by default; connections use TLS.)
4. Connect → "Connect your application" → copy the `mongodb+srv://...` connection string for
   `MONGODB_URI`.

## 4. Paytrail merchant account

1. While developing/demoing, do nothing — `paytrailClient.js` automatically falls back to
   Paytrail's published test merchant (ID `375917`, secret `SAIPPUAKAUPPIAS`) whenever
   `PAYTRAIL_MERCHANT_ID` / `PAYTRAIL_SECRET_KEY` are unset. Full checkout → redirect → callback →
   status update flow works end-to-end against Paytrail's real test API this way.
2. Before launch, apply for a real Paytrail merchant agreement at
   [paytrail.com](https://www.paytrail.com/en) (or via their merchant panel at
   [merchant.paytrail.com](https://merchant.paytrail.com) once onboarded). Once approved, copy
   the real merchant ID and secret key into Vercel's environment variables — no code change is
   needed, the client switches out of test mode automatically.

## 5. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (for Production, and
separately for Preview if you want preview deployments to work too), and in your local `.env`
for development. See `.env.example` for the full list with comments. Summary:

| Variable | Production value |
|---|---|
| `CLIENT_URL` | `https://nuppu.fi` |
| `VITE_API_BASE_URL` | `https://nuppu.fi/api` |
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_REQUIRED` | `true` |
| `ADMIN_TOKEN` | long random string (`openssl rand -hex 32`) |
| `CRON_SECRET` | long random string, different from `ADMIN_TOKEN` |
| `PAYTRAIL_MERCHANT_ID` / `PAYTRAIL_SECRET_KEY` | real values once the merchant agreement is live; otherwise leave unset |
| `PAYTRAIL_API_BASE_URL` | `https://services.paytrail.com` (default, only override if Paytrail tells you to) |
| `NUPPU_EMAIL`, `MAIL_FROM`, `SMTP_*` | your transactional email provider (see below) |

`NODE_ENV` is set automatically by Vercel — no need to set it manually.

## 6. Email (contact form + booking notifications)

`SMTP_*` is currently unset, so email notifications are silently skipped (`sendContactInterestEmail`
logs a warning and continues). Before launch, set up a transactional email provider (e.g.
SendGrid, Mailgun, or Postmark — all have EU-friendly options) and fill in `SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. The `nodemailer` dependency was missing from
`package.json` (the code imported it but it was never installed) — I've added it; run
`npm install` after pulling these changes.

## 7. Deploy

1. Push this repo to GitHub (or your git host of choice).
2. In Vercel: **New Project → Import** the repo. Vercel auto-detects the Vite build
   (`npm run build`, output `dist/`).
3. Add the environment variables from step 5.
4. Deploy. Add the `nuppu.fi` domain under **Settings → Domains** and follow Vercel's DNS
   instructions (step 2).

## 8. Retention/anonymisation cron

`vercel.json` registers a daily cron (`0 3 * * *`, 03:00 UTC) that calls
`GET /api/payments/anonymize-expired` to anonymise payment records whose 6-year Kirjanpitolaki
retention period has expired. Vercel automatically sends `Authorization: Bearer <CRON_SECRET>`
on cron-triggered requests when `CRON_SECRET` is set as a project env var — make sure it's set
before relying on this.

**Flagged for you to confirm:** Vercel Cron Jobs' availability/frequency limits depend on your
plan (Hobby vs Pro) and have changed over time — check your current Vercel plan's cron limits
before launch. If daily crons aren't available on your plan, you can trigger the same endpoint
manually (with `x-admin-token`) via an external scheduler (e.g. GitHub Actions on a schedule, or
a simple `cron-job.org` ping) as a fallback.

## 9. Testing after deploy

```bash
# Health check
curl https://nuppu.fi/api/health

# Contact form
curl -X POST https://nuppu.fi/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"parent","message":"Test message"}'

# Start a payment (test credentials, if PAYTRAIL_* unset) - open the returned url in a browser
curl -X POST https://nuppu.fi/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{"service":"emotional-support","customerName":"Test User","customerEmail":"test@example.com"}'
```

Then manually walk the full flow in a browser: `/emotional-support` → fill name/email → "Book &
Pay — €29" → complete (or cancel) on Paytrail's test checkout → confirm you land back on
`/emotional-support?payment=success` (or `cancelled`) with the right banner, and that
`GET /api/payments` (with `x-admin-token`) shows the record with the correct status.

---

## Alternative: standalone backend (Railway / Render / Fly)

If you outgrow serverless functions, deploy `api/index.js` as a normal long-running Node
process instead:

1. There is no separate `backend-package.json` in this repo — the backend's dependencies
   (express, mongoose, cors, dotenv, nodemailer, twilio, node-fetch) live in the root
   `package.json` alongside the frontend's. Point your host's build at `api/index.js` using
   that file, or extract just the backend dependencies into a standalone `package.json` for
   the separate deploy if you'd rather not ship frontend deps to that host.
2. Deploy to Railway/Render/Fly, set the same environment variables as above, except:
   - `CLIENT_URL` stays the frontend's domain (`https://nuppu.fi`)
   - Add a DNS `CNAME`/`ALIAS` for `api.nuppu.fi` pointing at the host's provided address
   - Set `VITE_API_BASE_URL=https://api.nuppu.fi/api` in the Vercel frontend project
3. `api/index.js`'s CORS `allowedOrigins` already reads from `CLIENT_URL`, so no code change is
   needed there. Paytrail's redirect/callback URLs are built from the incoming request's own
   host (`req.protocol`/`req.get("host")`), so they'll automatically point at `api.nuppu.fi` in
   this setup too.

---

## Troubleshooting

- **404 on `/api/...` in production** — check `vercel.json`'s `rewrites` deployed correctly, and
  that `api/index.js` exports `app` as the default export (it does).
- **CORS errors** — `CLIENT_URL` must exactly match the frontend's origin (scheme + host, no
  trailing slash).
- **Payments stuck on "pending"** — Paytrail's webhook (`/api/payments/callback`) may not be
  reaching your deployment (check it's publicly reachable, not behind auth) or `MONGODB_URI` may
  be unset in that environment.
- **"Database is temporarily unavailable"** — `MONGODB_REQUIRED` must be `true` and
  `MONGODB_URI` must be a reachable Atlas connection string in production.

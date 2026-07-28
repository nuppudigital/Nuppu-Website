# Deployment

Single Vercel deployment serves both the static frontend (`dist/`) and the
backend (`api/index.js`, an Express app running as a Vercel serverless
function). Frontend and API share one domain, e.g. `https://your-domain/` and
`https://your-domain/api/...` — no separate API subdomain needed, since
`api/index.js` exports the Express `app` directly with no `app.listen()` call
and the Vercel Node runtime wraps it automatically.

Replace `your-domain` below with the real domain once it's registered.

## 1. Register the domain

Pick a registrar for whichever TLD you're using. A `.fi` domain requires a
Finnish Y-tunnus (business ID) or EU/EEA residency for the registrant.

## 2. DNS

Point the domain at Vercel — **Project → Settings → Domains** shows the exact
records to create the moment you add the domain there (an `A` record for the
apex and a `CNAME` for `www`, typically). Always use what Vercel shows you
over any values written down elsewhere, since its anycast IPs occasionally
change.

HTTPS is automatic (Vercel issues and renews the certificate once DNS
verifies). `vercel.json` sets `Strict-Transport-Security` and a few other
security headers on every response; `api/index.js` sets the same headers
itself as a fallback in case it's ever run outside Vercel.

## 3. MongoDB Atlas

1. Create a free M0 cluster in an **EU region** (Frankfurt or Ireland) — this
   matters for the EU-storage claim in `GDPR-NOTES.md`.
2. Database Access → create a database user.
3. Network Access → add `0.0.0.0/0` (Vercel Functions have no fixed IP range)
   and rely on the username/password plus a non-guessable database name.
4. Connect → "Connect your application" → copy the connection string into
   `MONGODB_URI`.

## 4. Paytrail

While developing, do nothing — `paytrailClient.js` falls back to Paytrail's
published test merchant (ID `375917`) whenever `PAYTRAIL_MERCHANT_ID` /
`PAYTRAIL_SECRET_KEY` are unset, and the full checkout → redirect → callback
flow works end-to-end against Paytrail's real test API this way.

Before launch, apply for a real merchant agreement at
[paytrail.com](https://www.paytrail.com/en). Once approved, put the real
merchant ID and secret key in Vercel's environment variables — no code change
needed, the client switches out of test mode automatically.

## 5. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**
(Production, and Preview too if you want preview deployments to work), and in
your local `.env` for development. Full list with comments: `.env.example`.

| Variable | Production value |
|---|---|
| `CLIENT_URL` | `https://your-domain` |
| `VITE_API_BASE_URL` | `https://your-domain/api` |
| `VITE_SITE_URL` | `https://your-domain` |
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_REQUIRED` | `true` |
| `ADMIN_TOKEN` | long random string (`openssl rand -hex 32`) |
| `CRON_SECRET` | long random string, different from `ADMIN_TOKEN` |
| `PAYTRAIL_MERCHANT_ID` / `PAYTRAIL_SECRET_KEY` | real values once live, otherwise leave unset |
| `NUPPU_EMAIL`, `MAIL_FROM`, `SMTP_*` | your transactional email provider |

`NODE_ENV` is set automatically by Vercel.

## 6. Email

`SMTP_*` unset means email notifications are silently skipped. Before launch,
set up a transactional provider (SendGrid, Mailgun, Postmark all have EU
regions) and fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

## 7. Deploy

1. Push to GitHub (or your git host).
2. Vercel → New Project → Import the repo (Vite build auto-detected: `npm run build`, output `dist/`).
3. Add the environment variables from step 5.
4. Deploy, then add the domain under Settings → Domains and follow Vercel's DNS instructions.

## 8. Retention/anonymisation cron

`vercel.json` registers a daily cron (`0 3 * * *` UTC) hitting
`GET /api/payments/anonymize-expired`, which anonymises payment records past
their 6-year Kirjanpitolaki retention window. Vercel sends
`Authorization: Bearer <CRON_SECRET>` automatically on cron-triggered
requests once `CRON_SECRET` is set as a project env var.

Vercel Cron availability/frequency depends on your plan — check it covers a
daily job. If not, trigger the same endpoint from an external scheduler (a
GitHub Actions cron, or a service like cron-job.org) with the admin token
instead.

## 9. Testing after deploy

```bash
curl https://your-domain/api/health

curl -X POST https://your-domain/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"parent","message":"Test message"}'
```

Then walk the full booking flow in a browser: `/emotional-support` → fill in
the form → pay on Paytrail's test checkout → confirm you land back on
`/emotional-support?payment=success` (or `cancelled`) with the right banner,
and that `GET /api/payments` (with `x-admin-token`) shows the record.

---

## Alternative: standalone backend

If serverless functions stop being enough (websockets, long-running jobs),
deploy `api/index.js` as a normal Node process on Railway/Render/Fly instead.
Its dependencies (express, mongoose, cors, dotenv, nodemailer, twilio) live in
the root `package.json` — point the host's build at `api/index.js`.

- `CLIENT_URL` stays the frontend's domain.
- Add a DNS record for the API host (e.g. `api.your-domain`) and set
  `VITE_API_BASE_URL` to match on the frontend.
- No code changes needed — CORS reads `allowedOrigins` from `CLIENT_URL`, and
  Paytrail's redirect/callback URLs are built from the incoming request's own
  host.

## Troubleshooting

- **404 on `/api/...`** — check `vercel.json`'s rewrites deployed, and that `api/index.js` exports `app` as the default export.
- **CORS errors** — `CLIENT_URL` must exactly match the frontend's origin (scheme + host, no trailing slash).
- **Payments stuck on "pending"** — the webhook (`/api/payments/callback`) may not be reaching the deployment, or `MONGODB_URI` may be unset.
- **"Database is temporarily unavailable"** — `MONGODB_REQUIRED` must be `true` and `MONGODB_URI` must point at a reachable Atlas cluster.

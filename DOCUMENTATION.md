# Nuppu Website — Project Documentation

This repository is the monorepo behind **nuppuapp.fi**: a marketing/informational website, an internal admin dashboard, and a design prototype of the Nuppu children's app, all deployed as one Vercel project sharing a single Express/MongoDB API.

Nuppu itself is a child-first emotional-learning product (stories, mindfulness, mood tracking) for children roughly ages 2–12, aimed at parents, teachers, and healthcare professionals. The public site also sells a paid "emotional support" consultation booking, handled through the Finnish payment provider **Paytrail**.

---

## 1. High-level architecture

```
Nuppu-Website/
├── src/                    Main marketing site (React + Vite) — served at "/"
│   ├── app/                 Routes, pages, components, i18n
│   └── server/               Mongoose models + business logic shared by the API
├── api/
│   └── index.js              Single Express app — all backend routes (Vercel serverless function)
├── admin-dashboard/          Standalone Vite React app — built separately, mounted at "/admin"
├── app-prototype/             Standalone Vite React app — the Nuppu app UI prototype, mounted at "/app-preview"
├── public/                    Static assets; admin-dashboard & app-prototype builds get copied here
├── dist/                      Build output of the main site (gitignored)
└── vercel.json                 Rewrites, security headers, and the cron job
```

**One Express app, one MongoDB, three frontends.** `api/index.js` is the only backend. It is imported by Vercel as a serverless function (`vercel.json` rewrites `/api/*` to it) and, when run outside Vercel, also serves the built static files itself and starts an HTTP listener.

The three frontends are independent Vite projects with their own `package.json`, `node_modules`, and build step:

| App | Source | Mounted at | Purpose |
|---|---|---|---|
| Main site | `src/` (root `package.json`) | `/` | Public marketing site: home, characters, about, contact, legal pages, paid consultation booking |
| Admin dashboard | `admin-dashboard/` | `/admin` | Internal tool for staff: view/manage contact messages, bookings/payments, and consultation availability |
| App prototype | `app-prototype/` | `/app-preview` | Click-through design prototype of the actual Nuppu child-facing app (stories, mood check-ins, parent "Adult Corner") |

The root build script builds `admin-dashboard` and `app-prototype` first, copies their `dist/` output into `public/admin` and `public/app-preview`, then builds the root Vite app — so a single `npm run build` (or `vercel-build`) produces one static `dist/` containing all three apps.

---

## 2. Tech stack

- **Frontend:** React 18, TypeScript, React Router 7, Vite 6, Tailwind CSS 4, `motion` (Framer Motion successor) for animation, `lucide-react` icons, Radix UI primitives + `class-variance-authority`/`clsx`/`tailwind-merge` for the small internal UI kit (`src/app/components/ui`).
- **Backend:** Node.js, Express 5, Mongoose 9 (MongoDB), deployed as a Vercel serverless function.
- **Integrations:** Paytrail (payments), Nodemailer/SMTP (email), Twilio (SMS receipts).
- **Tooling:** ESLint 9 + typescript-eslint, TypeScript 6 (`tsc --noEmit` for the root app), no test runner is configured in this repo.

---

## 3. Main site (`src/`)

### Entry & routing

- `src/main.tsx` mounts `<App />` from `src/app/App.tsx`.
- `App.tsx` wraps the app in `LanguageProvider` (i18n) and `RouterProvider` (`react-router-dom`, `createBrowserRouter`).
- `src/app/routes.tsx` defines routes, all nested under `Root` (`src/app/Root.tsx`), which renders `Navigation`, `Footer`, `CookieConsent`, and an `<Outlet />`, and scrolls to top on navigation.

Routes:

| Path | Page |
|---|---|
| `/` | `Home.tsx` |
| `/characters` | `Characters.tsx` — the four Nuppu characters (Nuppu, Muru, Hippu, Lumo) |
| `/about` | `About.tsx` |
| `/contact` | `Contact.tsx` — contact form |
| `/privacy` | `Privacy.tsx` |
| `/terms` | `Terms.tsx` |
| `/cookies` | `Cookies.tsx` |
| `/emotional-support` | `EmotionalSupport.tsx` — paid consultation booking flow |
| `*` | `NotFound.tsx` |

`RouteError` is the router's `ErrorBoundary`.

### i18n

- `src/app/i18n/LanguageContext.tsx` implements a minimal custom i18n system (no external library): dot-path key lookup (`t("home.heroTitle")`, `tList("emotionalSupport.forWhom.items")`) into `en.json` / `fi.json`.
- Language defaults to Finnish (`fi`), persists in `localStorage` under `nuppu-lang`, and falls back to English then to the raw key if a translation is missing.
- `usePageMeta` hook (`src/app/hooks/usePageMeta.ts`) sets per-page `<title>`/meta description from translated strings.

### Key components

- `Navigation.tsx`, `Footer.tsx` — site chrome.
- `CookieConsent.tsx` — cookie banner (see `Cookies.tsx` page for the actual policy).
- `ImageWithFallback.tsx` — image component with a fallback for broken/missing images.
- `components/ui/` — small internal design-system primitives (`button.tsx`, `card.tsx`) built on Radix + CVA, shared styling utility in `utils.ts`.

### The booking flow (`EmotionalSupport.tsx`)

This is the most complex page on the main site:

1. Fetches currently bookable slots from `GET /api/availability/slots` (public — returns only open ISO instants, never who booked what).
2. User fills in name/email/phone/message and picks a date + time slot (all times are Europe/Helsinki, computed client-side purely for display via `Intl.DateTimeFormat`).
3. Submits to `POST /api/payments/create`, which validates everything server-side (price, slot availability, contact fields), creates a `Payment` record, and returns a Paytrail redirect URL.
4. Browser is redirected to Paytrail's hosted checkout; Paytrail then redirects back to `/api/payments/success|cancel`, which verifies the signature, updates the `Payment` status, and redirects to `/emotional-support?payment=success|cancelled|pending|error`.
5. A hardcoded pause window (`BOOKING_PAUSED_FROM` / `BOOKING_PAUSED_UNTIL` constants at the top of the file) can temporarily hide the booking form with a "temporarily unavailable" notice without a redeploy — just a plain browser-clock check re-evaluated on every page load.

### API client (`src/app/config/api.ts`)

Thin `fetch` wrapper (`apiRequest`) plus three grouped clients: `contactAPI`, `paymentsAPI`, `availabilityAPI`, `healthAPI`. `API_BASE_URL` comes from `VITE_API_BASE_URL` in production (build fails loudly if it's unset in a production build) and defaults to `http://localhost:5050/api` in dev.

---

## 4. Backend API (`api/index.js` + `src/server/`)

Single Express app, all routes prefixed `/api`. No separate router files — every endpoint is declared directly in `api/index.js`; supporting logic (Mongoose models, availability math, Paytrail client) lives under `src/server/`.

### Data models (`src/server/models/`)

- **`Payment.js`** — one row per consultation booking/payment attempt.
  - Fields: `paytrailTransactionId` (unique), `paytrailReference`, `service` (currently only `"emotional-support"`), `amountCents`, `status` (`pending|paid|cancelled|failed|refunded`), customer name/email/phone/message, `scheduledAt`, `paidAt`, `retentionExpiresAt`, `anonymizedAt`.
  - Partial unique index on `{service, scheduledAt}` (only for `pending`/`paid` status) — the authoritative double-booking guard at the database level.
  - `computeRetentionExpiry()` — Finnish accounting law (Kirjanpitolaki) requires financial records kept 6 years from the end of the fiscal year; this computes that expiry date at creation time. Records aren't deleted after that — personal fields are anonymized (see §6).
- **`AdminAuth.js`** — `AdminOtp`, `AdminSession`, `RateLimitHit` collections. These exist specifically because the API runs on Vercel serverless functions: separate lambda instances/cold starts don't share process memory, so admin OTP codes, sessions, and rate-limit counters must live in MongoDB (with TTL indexes for cleanup) rather than an in-process `Map`. When Mongo isn't connected (e.g. local dev without a DB), `api/index.js` transparently falls back to in-memory `Map`s for all three.
- **`AvailabilityBlock.js`** — manually blocked slots (`date` + optional `startTime`; `startTime: null` blocks the whole day), layered on top of the default working-hours template.

### Availability engine (`src/server/availability/slots.js`)

Computes bookable consultation slots without any date library — hand-rolled Helsinki timezone conversion on top of the native `Intl` API:

- Fixed template: Mon–Fri, 09:00–16:00 Europe/Helsinki, 45-minute consultations, one slot per hour.
- `helsinkiLocalToUtc` / `helsinkiPartsFromUtc` do local↔UTC conversion, correctly handling DST by re-checking the offset once at the guessed UTC instant.
- `computeSlotStatuses({from, to})` merges the template with `AvailabilityBlock` rows and `Payment` rows to produce a full per-slot status (`available|blocked|booked|past`) for a date range, clamped to ±42 days (`BOOKING_WINDOW_DAYS`) around today.
- `isSlotBookable(date)` re-validates a client-picked slot server-side (exact slot instant, weekday, within the booking window, not blocked, not already held) before creating a payment.
- `reclaimExpiredHold(service, scheduledAt)` releases a slot held by an abandoned checkout after `PENDING_HOLD_MINUTES` (30 min), so an unfinished Paytrail redirect doesn't lock a slot forever.

### Paytrail integration (`src/server/payments/paytrailClient.js`)

Implements Paytrail's HMAC-SHA256 request signing scheme directly (no SDK): sorts `checkout-*` headers alphabetically, joins as `key:value\n`, appends the request body, and signs with the merchant secret. The same function verifies inbound redirect/webhook signatures.

- Falls back to Paytrail's published **test** merchant credentials (`375917` / `SAIPPUAKAUPPIAS`) when `PAYTRAIL_MERCHANT_ID`/`PAYTRAIL_SECRET_KEY` aren't set — lets the whole checkout flow be built/demoed before a real merchant agreement exists. Setting real credentials in the environment switches to live charges with no code changes.
- `createPayment()` — creates the hosted checkout session Paytrail redirects the customer to.
- `verifyCallbackSignature()` — used by both the browser-redirect return endpoints and the webhook.
- `getPaymentStatus()` — exists but not currently wired into a route; would allow an authoritative admin "re-sync from Paytrail" action later.

### Admin authentication

Two ways to authenticate as admin (both checked by `requireAdmin` middleware via the `x-admin-token` header):

1. **Static `ADMIN_TOKEN`** — a long shared secret, compared with a timing-safe equality check. Useful for scripts/curl and as a fallback independent of email delivery.
2. **Emailed one-time code (OTP)** — `POST /api/admin/otp/request` (email must be in `ADMIN_OTP_EMAILS`) sends a 6-digit code valid 10 minutes, max 5 attempts; `POST /api/admin/otp/verify` exchanges a valid code for a session token (12-hour TTL). Both endpoints return an identical generic response regardless of whether the email is recognized, to prevent enumerating admin emails.

`requireCronOrAdmin` additionally accepts a `Bearer <CRON_SECRET>` header, which is how Vercel Cron authenticates to the daily anonymization job.

### Rate limiting

`createRateLimiter({name, windowMs, max})` is a sliding-window-ish limiter keyed by IP, backed by the `RateLimitHit` collection (falls back to in-memory when Mongo is down). Separate named limiters exist for: contact form, admin routes generally, OTP request/verify (much looser outside production), availability slot lookups, and payment creation.

### Full route reference

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /api/health` | — | Liveness check |
| `POST /api/admin/otp/request` | rate-limited | Send an admin sign-in code by email |
| `POST /api/admin/otp/verify` | rate-limited | Exchange OTP for a session token |
| `POST /api/contact` | rate-limited | Public contact form submission → saved + emailed to `NUPPU_EMAIL` |
| `GET /api/contact` | admin | List contact messages (paginated, filter by `status`) |
| `PATCH /api/contact/:id` | admin | Update a message's status (`new/read/replied`) |
| `DELETE /api/contact/:id` | admin | Delete one contact message |
| `DELETE /api/contact` | admin | Bulk-delete **all** contact messages (booking/payment messages are explicitly excluded — see §6) |
| `GET /api/availability/slots` | rate-limited, public | Open bookable slots only (no identity data) |
| `GET /api/availability/calendar` | admin | Full per-slot status for a date range, with block IDs |
| `POST /api/availability/blocks` | admin | Block a specific hour or a whole day |
| `DELETE /api/availability/blocks/:id` | admin | Remove a block |
| `POST /api/payments/create` | rate-limited | Validate booking request, create `Payment`, start Paytrail checkout |
| `GET /api/payments/success` \| `/cancel` | signature-verified | Browser-redirect targets from Paytrail; update status, redirect to frontend |
| `GET`/`POST /api/payments/callback` | signature-verified | Paytrail server-to-server webhook (Paytrail actually calls with GET; POST kept in case that changes) |
| `GET /api/payments/export` | admin | GDPR data export for a given customer email |
| `GET /api/payments/anonymize-expired` | cron or admin | Manually trigger the retention-expiry anonymization sweep |
| `GET /api/payments` | admin | List payments (paginated, filter by `status`) |
| `GET /api/payments/:id` | admin | Fetch one payment |
| `PATCH /api/payments/:id` | admin | Rectify name/email or change status (also how a slot is freed by cancelling/refunding) |
| `DELETE /api/payments/:id/personal-data` | admin | GDPR erasure — anonymizes one booking's personal fields |

### Notifications

On a confirmed payment, `notifyPaymentConfirmed()` fires three notifications in parallel via `Promise.allSettled` (each failure is logged, none blocks the others): a receipt email to the customer, a summary email to the company (`NUPPU_EMAIL` + `BOOKING_NOTIFY_EMAIL` recipients), and an SMS receipt via Twilio if a phone number was given. Email sending is a no-op (with a console warning) when SMTP env vars aren't configured; same for SMS/Twilio.

### Security headers & CORS

- CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` are set both in Express middleware (`api/index.js`) and in `vercel.json` (kept in sync intentionally — Vercel's edge headers cover the static frontend, Express covers direct API hits and non-Vercel deployments).
- CORS is an explicit allowlist (`allowedOrigins`): `CLIENT_URL`, localhost dev ports for both the main site and admin dashboard, and `ADMIN_DASHBOARD_URL` if the admin dashboard is ever split into its own Vercel deployment (cross-origin) rather than served at the same origin's `/admin` path.

### Local vs. Vercel execution

- On Vercel, `api/index.js` is imported per-request as a serverless function — it must not call `app.listen()`, and doesn't (guarded by `process.env.VERCEL`).
- Run locally as a standalone server with `npm run server`; it also serves the built `dist/` directory itself (SPA fallback, plus a specific fallback to `dist/admin/index.html` for `/admin/*`) so the whole site works without Vercel.
- Node's DNS resolver is pinned to `8.8.8.8`/`1.1.1.1` at startup — some networks (e.g. mobile hotspots) hand out a resolver that can't do the SRV lookups `mongodb+srv://` needs even though the OS's own resolver works fine.

---

## 5. Admin dashboard (`admin-dashboard/`)

Standalone Vite/React/TypeScript app, built with `ADMIN_BASE_PATH=/admin/` and copied into `public/admin` (dev) or served at `/admin` via `vercel.json` rewrites (prod). Talks to the **same** backend as the main site (`API_BASE_URL`, defaulting to the local dev server).

- `src/app/App.tsx` — the whole dashboard UI: sign-in (OTP or pasted admin token, stored in `sessionStorage` under `nuppu_admin_token`), then tabs for payments and messages (contact-form + booking messages unified into one inbox view), plus an availability calendar.
- `src/app/components/AvailabilityCalendar.tsx` — visual calendar for blocking/unblocking consultation slots.
- `src/app/config/api.ts` — typed API client (`adminAPI`, `authAPI`) mirroring the backend's admin/auth routes; also duplicates `ADMIN_EMAILS` from the backend's default `ADMIN_OTP_EMAILS` list purely for local UI hints (there's no unauthenticated endpoint to fetch the real list — must be kept manually in sync).
- Small local UI kit: `Button.tsx`, `Card.tsx`, `Input.tsx`.

Has its own `vercel.json`, suggesting it can also be deployed as an independent Vercel project (in which case `ADMIN_DASHBOARD_URL` on the main API enables the cross-origin CORS case).

---

## 6. App prototype (`app-prototype/`)

Standalone Vite/React/TypeScript app — a **click-through design prototype** of the actual Nuppu child-facing mobile app (not the production app; no App Store/Play Store build). Copied into `public/app-preview`, served at `/app-preview`.

- `src/app/routes.tsx` — a much larger route tree than the marketing site, covering the full app experience: onboarding (`/signup` → `/add-child` → `/preferences` → `/privacy` → `/tutorial`), core loop (`/home`, `/library`, `/story/:id`, `/playback/:id`, `/emotion-check`, `/breathing`, `/completion/:id`, `/progress`), settings/sitemap, and a parent-facing **"Adult Corner"** (`/adult-corner` and subroutes: subscription, about, letters, tips library, feedback).
- `src/app/context/ChildContext.tsx` — global app state: child profile (`name`, `ageGroup` — `little` (2–4) / `big` (5–8) / `super` (9–12) —, avatar, interests), current emotion, generated stories, plan tier (`freemium`/`premium`), daily mood, story playback mode (`book`/`audio`).
- `src/app/services/geminiService.ts` — story generation via Google's Gemini API, intended for personalized story text based on the child's name/emotion/interests/age group. **`GEMINI_API_KEY` is currently a placeholder string** (`'YOUR_GEMINI_API_KEY_HERE'`) in the source — this integration is not live; a curated `FALLBACK_SUGGESTIONS` list and per-emotion color/theme maps back it for prototype purposes.
- `src/app/services/textToSpeech.ts` — audio playback support for story mode.
- `src/app/data/{moods,stories}.ts` — static content used by the prototype screens.
- `src/app/components/ParentAccessModal.tsx` — a parental-gate pattern, consistent with the product being aimed at young children with adult-only sections gated off.

Because this is a prototype, treat its data and integrations (Gemini, subscription screens) as **illustrative of the intended product**, not as production-ready or connected to real billing/AI infrastructure.

---

## 7. Privacy, GDPR, and data retention

The codebase implements real GDPR mechanics, even though the referenced `GDPR-NOTES.md` file (mentioned in comments in `Payment.js` and `api/index.js`) is **not present in this repository** — worth creating or locating if a fuller written policy exists elsewhere.

Concretely, in code:

- **Retention:** `Payment.computeRetentionExpiry()` sets a 6-year expiry (Finnish accounting law) from the end of the fiscal year a payment was made in, at creation time.
- **Automatic anonymization:** a daily Vercel Cron job (`vercel.json`, `0 3 * * *`, hits `GET /api/payments/anonymize-expired` with `CRON_SECRET`) nulls out `customerName`/`customerEmail`/`customerPhone`/`customerMessage` on any payment whose `retentionExpiresAt` has passed, setting `anonymizedAt`. Amounts, dates, and transaction IDs are kept — this preserves the accounting trail while erasing personal data.
- **Right to erasure (manual):** `DELETE /api/payments/:id/personal-data` performs the same anonymization immediately for one booking, admin-triggered.
- **Right to rectification:** `PATCH /api/payments/:id` lets an admin correct a stored name/email.
- **Right to access/portability:** `GET /api/payments/export?email=...` returns all payment records for a given customer email.
- **Scope boundary:** the bulk `DELETE /api/contact` endpoint is deliberately restricted to contact-form messages only — booking-derived personal data lives on `Payment` records, which are erasure-only via the per-record endpoint above (since they carry a statutory retention obligation, they can't just be bulk-deleted).
- **Contact messages** also store the submitter's IP address (`ContactMessage.ipAddress`), with no explicit retention/anonymization policy currently applied to that collection.

---

## 8. Configuration & environment variables

No `.env.example` currently exists in the repo (git status shows one was deleted); the variable names below were reconstructed from `api/index.js` and `src/app/config/api.ts`. Recreating a checked-in `.env.example` (names only, no real secrets) is recommended so new environments can be set up without reading the source.

| Variable | Used by | Purpose / default |
|---|---|---|
| `PORT` | API | Local server port, default `5050` |
| `MONGODB_URI` | API | Default `mongodb://localhost:27017/nuppu` |
| `MONGODB_REQUIRED` | API | `"true"` to connect to Mongo at boot; otherwise most DB-backed routes degrade to a 503 or in-memory fallback |
| `CLIENT_URL` | API | Main site origin, used for CORS and Paytrail return-URL construction; default `http://localhost:5173` |
| `ADMIN_DASHBOARD_URL` | API | Extra CORS origin, only needed once the admin dashboard is deployed as its own (cross-origin) Vercel project |
| `ADMIN_TOKEN` | API | Static admin bearer secret |
| `ADMIN_OTP_EMAILS` | API | Comma-separated emails allowed to sign in via OTP; defaults to the current admin team |
| `CRON_SECRET` | API | Bearer secret Vercel Cron uses to hit the anonymization endpoint |
| `NODE_ENV` | API | Affects OTP rate-limit strictness |
| `NUPPU_EMAIL` | API | Recipient for contact-form and payment notifications; default `info@nuppuapp.fi` |
| `BOOKING_NOTIFY_EMAIL` | API | Extra comma-separated recipients for paid-booking notifications only |
| `MAIL_FROM` | API | From-address for all outgoing email |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | API | SMTP transport for Nodemailer; email sending is disabled (logged, not sent) if any required piece is missing |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | API | SMS payment receipts; disabled if any is missing. `TWILIO_FROM_NUMBER` must be a plain purchased number, not a branded sender name, per current Finnish telecom regulation for alphanumeric senders |
| `PAYTRAIL_MERCHANT_ID`, `PAYTRAIL_SECRET_KEY` | API | Real Paytrail credentials; falls back to Paytrail's published test merchant when unset |
| `PAYTRAIL_API_BASE_URL` | API | Default `https://services.paytrail.com` |
| `VITE_API_BASE_URL` | Main site, admin dashboard, app prototype (build time) | Backend base URL; **required** in production builds of the main site (build throws if unset) |
| `VITE_SITE_URL` | Main site (build time) | Used to fill absolute Open Graph/Twitter meta URLs in `index.html` |

---

## 9. Build & deploy

### Scripts (root `package.json`)

| Script | Effect |
|---|---|
| `npm run dev` | Runs `scripts/dev-prebuild.js` (builds `admin-dashboard`/`app-prototype` into `public/` only if not already built — keeps `npm run dev` fast on subsequent runs), then `vite` |
| `npm run build` / `npm run vercel-build` | Always rebuilds `admin-dashboard` and `app-prototype` from scratch, copies their output into `public/admin` / `public/app-preview`, then runs the root `vite build` |
| `npm run build:admin` | `cd admin-dashboard && npm install && ADMIN_BASE_PATH=/admin/ npm run build`, then copies `dist` → `../public/admin` |
| `npm run build:prototype` | Same pattern for `app-prototype` → `../public/app-preview` |
| `npm run server` | Runs the Express API standalone (`node api/index.js`), also serving the built static site |
| `npm run lint` | ESLint over the root app |
| `npm run typecheck` | `tsc --noEmit` |

`admin-dashboard` and `app-prototype` each have their own `dev`/`build`/`preview` scripts and can be developed independently by `cd`-ing into them and running `npm install && npm run dev`.

### Vercel (`vercel.json`)

- Rewrites: `/api/*` → the Express function; `/admin/*` and `/app-preview/*` → their respective `index.html` (SPA fallback per sub-app); everything else → the main site's `index.html`.
- Security headers applied at the edge for all paths (mirrors the Express middleware).
- One cron job: daily payment-anonymization sweep at 03:00 UTC.
- `admin-dashboard/vercel.json` exists too, implying it's set up to also be deployable as a standalone Vercel project if/when it's split off to its own origin.

### Path aliasing & shared code

- Root app uses `@/*` → `src/*` (configured in both `tsconfig.json` and `vite.config.ts`). `admin-dashboard` and `app-prototype` are fully separate TS projects/dependency trees — no shared package between the three frontends; duplication (e.g. `ADMIN_EMAILS`, API base URL fallback logic) is manual and called out in code comments where it matters.
- `vite.config.ts` has a small custom dev-server middleware (`staticSubAppFallback`) so that hitting `/admin` or `/app-preview` in Vite's dev server serves the copied sub-app's `index.html` instead of the main site's SPA fallback.

---

## 10. Notable design decisions & gotchas

- **No date library.** All Helsinki-timezone conversion in the availability engine is hand-rolled on the native `Intl` API rather than pulling in a dependency for a single use case.
- **Price trust boundary.** The client only ever sends a `service` name to `/api/payments/create`; the price (`SERVICE_PRICES_CENTS`) is looked up server-side so a tampered request can't under-pay.
- **Double-booking is guarded twice**: an application-level check (`isSlotBookable`) avoids most conflicts before calling Paytrail, and a partial unique MongoDB index is the actual authoritative guard (handles the race where two checkouts start for the same slot near-simultaneously).
- **Abandoned checkouts self-heal.** A `pending` payment holds its slot for 30 minutes (`PENDING_HOLD_MINUTES`); after that, `reclaimExpiredHold` frees it automatically the next time someone tries to book that slot.
- **Everything backed by MongoDB degrades gracefully when Mongo is down** (`requireDatabase` middleware returns a clean 503 for DB-dependent routes; admin OTP/session/rate-limit state falls back to in-memory `Map`s) — useful for local development without running a database, but means those fallbacks are inherently per-process and not suitable for a real multi-instance production outage.
- **Timing-safe comparisons** are used everywhere a secret is compared to user input (`ADMIN_TOKEN`, OTP codes, `CRON_SECRET`, Paytrail signatures) to avoid timing side-channel attacks.
- **The admin token lives in `sessionStorage`** in the admin dashboard — this is why the CSP's `script-src` deliberately excludes `'unsafe-inline'`/`'unsafe-eval'` (XSS is the main threat model for that token), while `style-src 'unsafe-inline'` is accepted as a much smaller risk (needed for React inline styles and Tailwind's generated `<style>` tag).
- **`GDPR-NOTES.md` is referenced but missing** from the current repo — several source comments point to it for retention-policy rationale.
- **The app prototype's Gemini integration is a stub** (placeholder API key) — don't assume AI story generation is live anywhere in this codebase.
- **Booking can be paused without a deploy** via two hardcoded `Date` constants in `EmotionalSupport.tsx`.

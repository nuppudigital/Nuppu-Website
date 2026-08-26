# Nuppu Guide

Internal notes on how this codebase is put together — what's where, why some things are built the
way they are, and the gotchas that aren't obvious from reading a file once. Assumes you already
know React, TypeScript, Express, Vite, Tailwind and Mongoose; this isn't an intro to any of those.

## Contents

- [Project setup](#project-setup)
- [App shell & routing](#app-shell--routing)
- [i18n](#i18n)
- [Shared components](#shared-components)
- [Pages](#pages)
- [Frontend → backend bridge](#frontend--backend-bridge)
- [The backend — api/index.js](#the-backend--apiindexjs)
- [Domain logic](#domain-logic)
- [Styling](#styling)
- [Build & deployment files](#build--deployment-files)
- [Compliance docs](#compliance-docs)
- [The two side projects](#the-two-side-projects)
- [Common maintenance tasks](#common-maintenance-tasks)
- [Troubleshooting](#troubleshooting)

---

## Project setup

`package.json` scripts worth knowing:

```json
"build": "npm run build:admin && npm run build:prototype && vite build",
"dev": "npm run build:admin && npm run build:prototype && vite",
"build:admin": "cd admin-dashboard && npm install && npm run build && rm -rf ../public/admin && cp -r dist ../public/admin",
"build:prototype": "cd app-prototype && npm install && npm run build && rm -rf ../public/app-preview && cp -r dist ../public/app-preview",
"server": "node api/index.js",
"typecheck": "tsc --noEmit"
```

`build:admin` and `build:prototype` each step into their own fully separate Vite project
(`admin-dashboard/`, `app-prototype/`), build it, and copy the output into `public/admin` /
`public/app-preview` so they end up served at `your-domain/admin` and `your-domain/app-preview`
even though neither is part of this app's own router — `vercel.json`'s rewrites handle routing
requests to them in production (see Build & deployment files below). `build` and `dev` both run
both first — meaning `npm run dev` rebuilds both sub-apps every time, which is why first startup
is slower than you'd expect. `server` runs the Express API directly with plain Node, in a second
terminal, separate from the Vite dev server.

`index.html` has `%VITE_SITE_URL%` placeholders in the Open Graph/Twitter meta tags — Vite
substitutes any `%VITE_*%` token at build time, so those URLs point at the real domain without
hardcoding it.

`src/main.tsx` is the entire bridge from static HTML to the app — `createRoot(...).render(<App/>)`
into the empty `#root` div, after a side-effect import of `styles/index.css` (which itself pulls
in Tailwind, theme variables, and fonts).

`vite.config.ts` has one non-obvious piece: a hand-written `adminFallback()` plugin. Vite's dev
server normally rewrites any unknown extensionless path to `/index.html` for SPA routing —
without this plugin, visiting `/admin` in dev would load *this* app's `index.html` instead of the
admin dashboard's. The plugin intercepts any request under `/admin` whose last path segment has
no `.` in it and rewrites it to `/admin/index.html`. Only matters in dev; production handles the
same problem via `vercel.json` rewrites instead. Also worth knowing: `resolve.alias '@' → ./src`
is why imports look like `@/app/components/ui/card`, and `server.proxy '/api'` (dev-only)
forwards `fetch("/api/...")` to `localhost:5050` so frontend and backend don't hit CORS in local
dev even though they're two processes on two ports.

`tsconfig.json` runs with `strict: true` — this is why the code is full of
`error instanceof Error ? error.message : ...` patterns: a caught error's type is `unknown` under
strict mode, not `Error`, so it has to be narrowed before reading `.message`.

`eslint.config.js` explicitly ignores `admin-dashboard` and `app-prototype` — they're separate,
independently-tooled codebases that happen to live in this repo.

## App shell & routing

`App.tsx` is four lines: `LanguageProvider` wraps `RouterProvider`, in that order specifically,
so routed pages (rendered inside `RouterProvider`) can call `useLanguage()`.

`routes.tsx` uses React Router v7's data-router config (`createBrowserRouter`, not JSX
`<Routes>`). One top-level route (`path: "/"`, `Component: Root`) renders every page inside
`Root`'s `<Outlet/>`; children cover `/`, `characters`, `about`, `contact`, `privacy`, `terms`,
`cookies`, `emotional-support`, and a `path: "*"` catch-all for `NotFound`. `ErrorBoundary:
RouteError` on the parent route means any render-time throw anywhere under it shows `RouteError`
instead of a blank screen.

`Root.tsx` is the permanent layout: `Navigation`, `<Outlet/>`, `Footer`, `CookieConsent`. Its one
bit of logic is a `useEffect` keyed on `location.pathname` that scrolls to top on every route
change — without it, navigating from the bottom of a long page would leave you scrolled down on
the next page too.

`RouteError.tsx` deliberately does **not** call `useLanguage()` — it hardcodes both languages
inline instead. If `LanguageProvider` itself ever failed to initialize, `useLanguage()` would
throw, which would defeat an error boundary whose whole job is to catch failures. It distinguishes
a real 404 (`isRouteErrorResponse(error) && error.status === 404`) from any other unexpected
throw, logs to console only in dev (`import.meta.env.DEV`), and its "go home" link is a plain
`<a href="/">` rather than a router `<Link>` so it still works if the router itself is broken.

## i18n

`src/app/i18n/LanguageContext.tsx` — default language is Finnish (`DEFAULT_LANG = "fi"`), stored
under the `nuppu-lang` localStorage key. Every localStorage read/write in this file is wrapped in
try/catch (Safari private browsing and similar can throw) and falls back to the default rather
than crashing.

`t(key)` and `tList(key)` both walk a dotted key path (`"home.heroTitle"` →
`translations.fi.home.heroTitle`) via a small `.reduce()` lookup, and both follow the same
fallback chain: current language → English → the raw key itself (`t()`) or a one-item array of it
(`tList()`). Returning the raw key on total failure is intentional — a visibly wrong string like
`home.missingKey` on the live page gets noticed immediately; a silently blank string might ship
for months.

`en.json` / `fi.json` share the same top-level keys (`nav`, `footer`, `home`, `characters`, etc.)
but **nothing enforces they stay in sync** — add a key to one and forget the other, and nothing
errors; it just silently falls back to English for Finnish users. Always edit both together.

`useLanguage()` throws if called outside `LanguageProvider` — a deliberate fail-loud guard so a
missing provider is an obvious error, not a silent `undefined` three renders later.

## Shared components

**Navigation.tsx** — `navLinks` is a data array mapped to `<Link>`s, not five hand-written
elements. The active-tab underline uses `motion`'s `layoutId="activeTab"` trick: when multiple
elements across renders share a `layoutId`, `motion` animates *between* their positions instead of
popping the indicator from one nav item to the next — that's the sliding-underline effect. The
mobile menu's open/close uses `AnimatePresence` so the collapse animation gets to play before the
menu actually leaves the DOM.

**Footer.tsx** — the `/admin` link is a plain `<a target="_blank">`, not a router `<Link>`,
because `/admin` is the separate admin-dashboard build and isn't a route this router knows about;
a `<Link>` there would try to client-side-navigate into nothing. Copyright year is
`new Date().getFullYear()` so it's never stale.

**CookieConsent.tsx** — unlike `LanguageContext`, this one does *not* initialize state from
localStorage directly. It starts at `consent: null, hydrated: false` and only checks storage
inside a `useEffect` (client-only, post-mount) to avoid a server/static-render vs. client
hydration mismatch. The banner currently doesn't gate anything — see GDPR-NOTES.md.

**ui/utils.ts** — `cn()` is `twMerge(clsx(inputs))`, the standard shadcn/ui pattern: `clsx`
combines a mix of strings/conditionals/arrays into one class string, `twMerge` then resolves
Tailwind-specific conflicts (e.g. `"p-4"` and a later `"p-8"` both being passed — plain
concatenation would apply both, `twMerge` keeps only the last).

**ui/button.tsx** — `cva` (class-variance-authority) builds the variant/size class combinations;
`asChild` is the Radix pattern where the button renders `<Slot>` instead of a real `<button>`,
merging its styles onto whatever single child you pass. That's how
`<Button asChild><Link to="/contact">...</Link></Button>` makes a router `Link` look like a
button without nesting an actual `<button>` around an `<a>` (invalid HTML).

**ui/card.tsx** — building-block components (`Card`, `CardHeader`, `CardTitle`, etc.), each a
styled div/heading/paragraph with `cn()` for override support.

**media/ImageWithFallback.tsx** — `ERROR_IMG_SRC` is a broken-image icon encoded as a base64 data
URI, so the fallback itself never depends on a network request that could also fail. Defaults
`loading="lazy"` / `decoding="async"` unless the caller overrides them (Home's above-the-fold hero
image passes `loading="eager" fetchPriority="high"`). On `onError`, it swaps to the fallback
branch while keeping the original failed URL in `data-original-url` for debugging.

**hooks/usePageMeta.ts** — every page calls
`usePageMeta(t("page.meta.title"), t("page.meta.description"))` near the top. Since this is a
single-page app with one `index.html`, each route has to set its own document title/description
on mount — this hook is the substitute for what a multi-page site gets for free.

## Pages

Every page except EmotionalSupport, Contact, and NotFound follows the same shape: `usePageMeta()`,
a data array or two sourced via `t()`/`tList()`, and a sequence of `<section>` blocks wrapped in
`motion.div` fade/slide-ins. Once you've read one you've read the pattern for all of them, so
below is just what's actually unique per page.

**Home.tsx** — the one static page with real state: a testimonial-style carousel. `nextSlide` /
`prevSlide` step the index with modulo wraparound; the `+ whyNuppuSlides.length` before the modulo
in `prevSlide` matters because JS's `%` on a negative number doesn't wrap the way you'd want on
its own (`-1 % 3 === -1`, not `2`). The slide transition uses `key={currentSlide}` on the
`motion.div` — changing `key` tells React "this is a different element," which is what triggers
the exit animation before the next slide's enter animation (`AnimatePresence mode="wait"` keeps
them from overlapping).

**Characters.tsx** — character `name`s ("Nuppu", "Muru", "Hippu", "Lumo") are hardcoded, not
translated — they're proper nouns. Only `personality`/`description`/`emotions` go through `t()`.
Character images are real `.webp` imports that Vite turns into hashed, cache-busted URLs at build
time.

**About.tsx** — same data-array pattern, four arrays (`values`, `frameworks`, `features`,
`whyItems`). One cross-link worth knowing: `<a href="/app-preview/" target="_blank">` to the
app-prototype's hosted build — plain `<a>`, same reasoning as the `/admin` link in Footer (points
outside this router's known routes).

**Contact.tsx** — the first real form. One `handleInputChange` for every field, keyed by each
element's `name` attribute (`{ ...prev, [name]: value }` — the `name` attribute has to exactly
match the `formData` key). `validateForm()` checks name/email/role/message in order,
short-circuiting on the first failure; the email check (`/\S+@\S+\.\S+/`) is a loose sanity check,
not a strict validator — client-side validation here is only ever a UX nicety, the backend
re-validates with the same regex as the actual security boundary. On submit: `e.preventDefault()`,
`contactAPI.submit(formData)`, clear the form and show a success banner that auto-hides after 5
seconds via `setTimeout`; on failure, `error instanceof Error` narrows the caught `unknown` before
reading `.message` (required under `strict: true`).

**EmotionalSupport.tsx** — the paid booking flow for the 45-minute consultation, and the most
complex page in the app.

- Fetches open slots from `availabilityAPI.listSlots()` on mount and groups them client-side by
  Helsinki calendar date (via `Intl.DateTimeFormat` + `formatToParts`, same pattern as the
  backend's timezone helper - grouping keys need exact numeric parts, not a locale-format guess).
  Renders a row of date pills (only dates with at least one open slot) and a time-button grid for
  whichever date is selected; the chosen ISO instant is required by `validate()` alongside
  name/email/message. If `paymentsAPI.create()` comes back with a 409 (`ApiError`, checked via
  `error.status`), that means someone else took the slot while this customer was filling in the
  form - the picker clears the selection and re-fetches slots rather than just showing a generic
  error.
- `useSearchParams()` reads `?payment=success|cancelled|pending|error` — how the page knows a
  customer just came back from Paytrail's checkout. A `useEffect` starts an 8-second timer to
  strip that param back out of the URL (with `{ replace: true }`, so it doesn't leave a phantom
  history entry) — without this, a page refresh after payment would re-show a stale banner
  indefinitely.
- Validation mirrors Contact.tsx, plus an optional-phone check: the regex
  (`/^\+?[0-9\s-]{6,20}$/`) only runs if a phone number was actually entered.
- `handleBookAndPay` calls `paymentsAPI.create(...)`, then does
  `window.location.href = redirectUrl` — a real browser navigation, not a `fetch` or router
  `navigate()`. That's deliberate: the destination is Paytrail's hosted checkout on a different
  domain entirely, so there's no way to stay inside client-side routing for this step.
  `customerPhone: formData.phone.trim() || undefined` sends `undefined` rather than `""` for an
  empty phone, because the backend's Mongoose schema only treats the field as genuinely optional
  when it's absent, not when it's an empty string.
- The render shows one of four colored banners based on `returnStatus`, each with
  `role="status"`/`role="alert"` plus `aria-live` so screen readers announce it automatically.

**Privacy.tsx / Terms.tsx / Cookies.tsx** — same tiny pattern: a `sections` array of key
fragments (e.g. `["what", "how", "manage"]`) mapped into heading+paragraph pairs via
template-literal translation keys (`` t(`cookies.${key}.title`) ``). Adding a new legal section is
just adding a string to that array plus the matching keys in both JSON files — no JSX changes.
`Privacy.tsx` additionally has a small `rich()` helper that splits a string on `**` and wraps
odd-indexed pieces in `<strong>`, so translation strings can contain simple `**bold**` markers.

**NotFound.tsx** — no unique logic: 404 heading, a router `<Link to="/">` home, and a
`window.history.back()` button.

## Frontend → backend bridge

`src/app/config/api.ts` is the entire surface area between frontend and backend. `API_BASE_URL`
comes from `VITE_API_BASE_URL`, and building for production without that var set throws
immediately at build time (`import.meta.env.PROD` check) — better than silently shipping a
`localhost` API URL baked into the bundle, which would fail quietly with confusing network errors
instead.

`apiRequest<T>()` is the one shared `fetch` wrapper everything goes through: merges caller headers
with a default `Content-Type: application/json`, and throws a real `Error` using the backend's own
`data.message` field on any non-2xx response — that message is exactly what shows up in
Contact/EmotionalSupport's catch blocks.

Three thin wrapper objects sit on top: `contactAPI.submit()`, `paymentsAPI.create()`,
`healthAPI.check()`. Adding a new backend route means adding a matching function here — this file
is the only place the frontend needs to know a route's URL/shape.

## The backend — api/index.js

One file, just under 1,000 lines, no separate router/controller files — small enough that
splitting it up would add indirection without benefit.

**Setup.** Every env var is read once, up front, with a local-dev default via `??` (nullish
coalescing — only falls back on `null`/`undefined`, unlike `||`). `MONGODB_REQUIRED === "true"` —
env vars are always strings, even the conceptually-boolean ones. `canSendEmail` / `canSendSms` are
derived booleans gating whether the app even attempts to send mail/SMS, letting it run in a
degraded-but-functional mode without those creds configured (`console.warn`s explain why, in the
logs). One Finland-specific detail worth remembering: a 2025 Traficom order means branded
alphanumeric SMS sender names sent to Finnish numbers need pre-registration or get flagged as
spam — using a plain purchased number as `TWILIO_FROM_NUMBER` sidesteps that entirely.

**Middleware.** `app.set("trust proxy", 1)` is necessary because Vercel sits in front as a reverse
proxy — without it, `req.ip` would return the proxy's IP for every request, not the visitor's,
which would break the per-IP rate limiters below. CORS checks `origin` against an
`allowedOrigins` Set (`CLIENT_URL` plus the Vite dev ports 5173/5174); requests with no `Origin`
header (curl, server-to-server) are always allowed, since CORS is a browser-only mechanism. Body
size is capped at 20kb — a cheap defense against a client sending an oversized payload to exhaust
memory/bandwidth before the handler even runs. A manual middleware sets HSTS,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy` on every
response — defense-in-depth, since Vercel's edge already sets these for the static frontend per
`vercel.json`, but this covers direct API hits and any non-Vercel deployment.

**Rate limiting.** Both the contact-form limiter and the payments one
(`createRateLimiter({ windowMs, max })`) are hand-rolled with an in-memory `Map` keyed by IP — no
Redis or `express-rate-limit` needed at this traffic scale. Contact: 5 submissions per 60-second
window. Payments: 10 per 60 seconds. Worth remembering as the maintainer: this state lives in
plain server memory, which on Vercel serverless can reset between invocations (warm instances
persist it for a while, cold ones don't) — it's "best effort," fine for deterring casual
spam-clicking, not a defense against a determined distributed attacker. (`rateLimitContact`
predates the `createRateLimiter` factory and duplicates the same logic by hand rather than being
refactored onto it — harmless, just two copies of one pattern.)

**Auth.** `requireAdmin` checks a single shared secret (`x-admin-token` header against
`ADMIN_TOKEN`) — no JWT, no sessions, no per-user accounts, just one token that whoever the site
operator hands out. If `ADMIN_TOKEN` was never set, admin routes fail closed with 503 rather than
treating a missing token as "let everyone in." The comparison is a plain `!==`, not timing-safe
(unlike `verifyCallbackSignature` in `paytrailClient.js`, which correctly uses
`crypto.timingSafeEqual`) — an acceptable simplification for a single static admin token against a
low-sophistication threat model, worth revisiting if this admin surface ever gets exposed more
broadly. `requireDatabase` checks `mongoose.connection.readyState === 1` and fails with a clear
503 rather than letting a query hang; contrast with the contact route, which checks the connection
inline and just degrades (skips the DB write, still sends the email) instead of rejecting — a lost
contact message is recoverable, a "sold" payment that was never recorded wouldn't be.
`requireCronOrAdmin` accepts either `Authorization: Bearer <CRON_SECRET>` (what Vercel Cron sends
automatically) or a normal admin token, so a human can also trigger the retention sweep manually.

**Notification helpers.** `anonymizeExpiredPayments()` is one `updateMany` — filters on
`retentionExpiresAt <= now AND anonymizedAt not set` (the second condition makes it safely
re-runnable), nulls the personal fields, stamps `anonymizedAt`. Runs with `runValidators: false`
since the schema marks those fields `required: true` and nulling them is the one legitimate
exception to that rule. All monetary amounts are integer cents everywhere except `formatEuros()`,
the one place they get turned into a display string — standard practice to avoid floating-point
rounding issues in money math. Payment receipt emails/SMS (`sendPaymentReceiptToCompany`,
`...ToCustomer`, `...Sms`) run through `notifyPaymentConfirmed()` via `Promise.allSettled` rather
than `Promise.all`, specifically so one notification failing (bad phone number, SMTP hiccup)
doesn't skip the other two — each rejection just gets logged individually. The SMS send
additionally wraps its own Twilio call in a local try/catch, since email is the authoritative
confirmation and SMS is a nice-to-have that should never be able to break the payment flow.

**Contact routes.** `POST /api/contact` (rate-limited): manual field/email/role checks first, then
a DB write attempt (skipped with a warning if Mongo's down, not a hard failure) and an email
notification, replying to the visitor even though it's sent `to` the company inbox. `GET
/api/contact` and `PATCH /api/contact/:id` are admin-only, following the same pagination shape
(`page`/`limit` clamped to sane bounds, `.sort({ createdAt: -1 })`, a separate `countDocuments`
for the total) reused by the payments list endpoint.

**Availability routes.** `src/server/availability/slots.js` computes the consultant's bookable
slots: a fixed Mon-Fri 9:00-17:00 Europe/Helsinki template (`SLOT_HOURS`, hourly, 15-min buffer
after each 45-min consultation), minus `AvailabilityBlock` docs (consultant-set exceptions - a
specific hour, or a whole day via `startTime: null`), minus whatever's already in `Payment`
(`paid`, or `pending` within `PENDING_HOLD_MINUTES` of an abandoned checkout). No date library
anywhere in this repo, so the Helsinki-local ⇄ UTC conversion is hand-rolled on the native `Intl`
API - worth reading if you ever touch it, since Finland observes DST and the naive
guess-then-correct-once approach there is the whole reason it stays correct across the March/October
changeovers. `GET /api/availability/slots` (public) only ever returns `available` instants - never
who's booked what. `GET /api/availability/calendar` (admin) returns every slot's status plus block
IDs, for the admin dashboard's `AvailabilityCalendar.tsx`. `POST /api/availability/blocks` /
`DELETE /api/availability/blocks/:id` create/remove blocks; creating a whole-day block also deletes
any specific-hour blocks already on that date, so unblocking the whole-day row later can't let
stale hour-blocks resurface. Double-booking is actually prevented at the database layer, not just
in app logic: `Payment` has a partial unique index on `{service, scheduledAt}` (only matching
`pending`/`paid` rows, and only rows where `scheduledAt` exists at all - that `$exists` clause
matters, since every pre-scheduling paid row lacks the field and would otherwise collide with each
other as the same `null` value and fail the index build on every cold start).

**Payment routes.** `SERVICE_PRICES_CENTS = { "emotional-support": 2900 }` (2900 cents = EUR
29.00) is the single source of truth for price — the frontend only ever sends a `service` key
string; the actual amount charged is always looked up here, server-side, never trusted from the
client. This is the one line to edit to change the price.

`handlePaytrailReturn` is the security-critical entry point for both the redirect and the webhook:
nothing in `req.query` is trusted until `verifyCallbackSignature` passes. A failed webhook check
gets a plain 400 (server-to-server, no browser involved); a failed redirect gets sent to the
frontend with `?payment=error` instead of a raw JSON blob. Paytrail's own status vocabulary
(`ok`/`pending`/`delayed`/`fail`) gets translated into this app's (`paid`/`pending`/`failed`). A
`wasAlreadyPaid` check before firing `notifyPaymentConfirmed` matters because **both** the
redirect and the separate webhook call this same handler for the same payment — without the
check, a payment could trigger duplicate receipt emails/SMS, once from each call; the guard makes
notifications fire only on the transition *into* paid. That notification call is deliberately not
`await`ed (fire-and-forget with a `.catch` so failures still get logged) — the HTTP response to
Paytrail/the browser doesn't wait on email/SMS delivery.

Four thin route registrations delegate to `handlePaytrailReturn` with a different `isWebhook`
flag each: `GET /api/payments/success` and `GET /api/payments/cancel` (both `isWebhook: false`),
`GET /api/payments/callback` and `POST /api/payments/callback` (both `isWebhook: true`). The
GET/POST pair on `/callback` exists because Paytrail's callbacks are currently GET requests with
query params identical to the redirect URLs — POST is kept only as a forward-compatible alias in
case that changes, not because anything currently sends it that way.

`POST /api/payments/create` now also requires `scheduledAt` (the ISO instant the customer picked
on the booking page). Before touching Paytrail it: (1) reclaims any expired hold on that exact
slot (`Payment.updateMany(..., { status: "pending", createdAt: { $lt: now - PENDING_HOLD_MINUTES } }, { $set: { status: "cancelled" } })`
— without this, an abandoned checkout would lock the slot behind the DB unique index forever, even
though the UI shows it as free again after the hold window), then (2) calls `isSlotBookable()` as a
pre-check (409 if it's not actually open - blocked, already booked, outside working hours, in the
past, or just not a canonical slot instant). It then re-validates everything else the frontend
already validated (never trust the client), builds the `Payment` document with a temporary
`pending-<uuid>` transaction ID, calls out to Paytrail, and only *then* saves to Mongo — if the
Paytrail call throws, nothing gets persisted, so there's no orphaned pending record stuck with a
fake transaction ID forever. The `isSlotBookable` pre-check is just to avoid wasting a Paytrail
call in the common case; the actual double-booking guard is the partial unique index, so
`payment.save()` is wrapped in its own try/catch for a Mongo duplicate-key error (code `11000`) →
409, in case two requests raced past the pre-check. Returns `502` for a genuine Paytrail failure
(not `500`) because that failure mode is "upstream service call failed," not "our own logic broke."

`GET /api/payments` and `GET /api/payments/:id` are admin-only — the same paginated list pattern
as contact messages, and a single-document lookup (GDPR right of access) respectively. The rest of
the payments routes map directly onto GDPR rights: `GET /api/payments/export?email=`
(portability, Article 20 — no pagination, deliberately returns everything for one person rather
than a page of results), `GET /api/payments/anonymize-expired` (the daily retention sweep, cron-
or admin-triggered), `PATCH /api/payments/:id` (rectification — touches whichever of
`customerName`/`customerEmail`/`status` was actually present in the body, so sending one doesn't
wipe the others; setting `status` to `cancelled`/`refunded` is also how a booked slot gets freed up
again, since the availability partial index only matches `pending`/`paid` - the admin dashboard's
Bookings table has a status dropdown per row for exactly this), `DELETE /api/payments/:id/personal-data`
(erasure implemented as anonymisation rather than a real delete, since a full delete isn't legally
permitted inside the 6-year bookkeeping retention window — see GDPR-NOTES.md).

**Fallback handlers & startup.** A bare `app.use((req, res) => ...)` 404s anything unmatched; a
4-argument `app.use((err, req, res, next) => ...)` is Express's error-handler signature, catching
anything thrown/passed via `next(err)` and logging server-side without leaking details to the
client. `mongoose.connect()` is only attempted if `MONGODB_REQUIRED === "true"`, so the server
boots and runs in a degraded mode with zero database configured (contact form still emails,
non-DB routes still work). The final `if (!process.env.VERCEL) { app.listen(...) }` is the crux of
the whole single-deployment setup: Vercel sets `process.env.VERCEL` automatically and imports the
exported `app` itself, invoking it per-request without ever calling `.listen()`; anywhere else
(local dev, a plain Node host per DEPLOYMENT.md's standalone-backend alternative) this actually
starts a real server.

## Domain logic

**`src/server/models/Payment.js`** — `computeRetentionExpiry(date)` builds "December 31st,
23:59:59.999 UTC of the payment's year" via `Date.UTC(year, 11, 31, ...)` (month is zero-indexed,
so `11` is December), then pushes it forward `RETENTION_YEARS = 6` years. UTC throughout avoids
any ambiguity from server timezone config. This assumes a calendar-year fiscal year — flagged in
GDPR-NOTES.md as an open item to confirm with the accountant. The schema's personal-data fields
(`customerName`, `customerEmail`, `customerPhone`, `customerMessage`) are exactly what the
anonymisation logic in `api/index.js` nulls out — if a new personal-data field ever gets added
here, the anonymisation functions need to stay in sync with it. `paytrailTransactionId` is
`unique: true` (a real Mongo unique index, not just app-level checking); `service` is a
single-value enum today (`["emotional-support"]`), structured so a second paid service is just one
more string here plus a matching `SERVICE_PRICES_CENTS` entry. `scheduledAt` plus its partial
unique index (`{service, scheduledAt}`, only matching `pending`/`paid` rows that actually have the
field set) is the double-booking guard for the availability calendar - see the "Availability
routes" note above for why the `$exists` clause in that index is load-bearing, not decorative.

**`src/server/payments/paytrailClient.js`** — `TEST_MERCHANT_ID`/`TEST_SECRET_KEY`
(`375917` / `SAIPPUAKAUPPIAS`) are Paytrail's own publicly documented test credentials, not a
leaked secret; the client falls back to them via `||` (not `??`, since an empty-string env var
should also fall through) whenever real `PAYTRAIL_*` vars aren't set, and `usingTestCredentials`
flags when that's happening.

The signing recipe (`calculateHmac`) matters byte-for-byte: every `checkout-*` param, sorted
alphabetically by key, each turned into `key:value`, newline-joined, with the raw request body
appended as the last line, HMAC-SHA256'd with the shared secret. `createPayment()` builds the
checkout session — `vatPercentage: 25.5` (Finland's standard VAT rate) is informational only,
Paytrail doesn't use it to recompute the charged amount. Both `callbackUrls.success` and
`callbackUrls.cancel` point at the same URL, since `handlePaytrailReturn` already branches on the
actual `checkout-status` value — no need for two separate webhook endpoints.
`verifyCallbackSignature()` is the inverse check, using `crypto.timingSafeEqual` (not `===`)
specifically to avoid a timing attack, where a naive comparison's early-exit-on-mismatch behavior
could theoretically leak how many leading bytes were correct.

`getPaymentStatus()` is exported but not currently called from any route — available for a future
"re-sync a payment's status from Paytrail" admin feature.

## Styling

`src/styles/index.css` chains in `fonts.css` → `tailwind.css` → `theme.css`, in that order (fonts
before anything references a font-family, Tailwind's utilities before the theme layer overrides).

`theme.css` defines the brand palette as CSS custom properties plus a semantic layer
(`--background`, `--primary`, etc.) that Tailwind's `@theme inline` block turns into utility
classes (`bg-primary`, `text-foreground`). Worth knowing: most hand-written page components
(Home, Characters, About, ...) don't use these semantic classes at all — they use raw hex
arbitrary values directly (`text-[#6B9AC4]`, `bg-[#A8D5E2]/20`), so the variable system really
only gets exercised by the small shared `ui/` library. There's also a full `.dark` class override
block in this file, inherited from the shadcn/ui template this started from — nothing in the app
currently toggles a `.dark` class anywhere, so it's dormant. A `prefers-reduced-motion` media
query globally zeroes out animation/transition durations, which is what neutralizes every `motion`
fade/slide across the whole app for visitors with that OS/browser preference set — one CSS rule,
no per-component logic needed.

`fonts.css` loads Poppins (body, set via CSS on `body`) and Nunito (headings) from Google Fonts in
one request. Nunito isn't applied via a CSS class, though — every heading sets
`style={{ fontFamily: 'Nunito, sans-serif' }}` inline, which is why that exact inline style is
repeated on nearly every `h1`/`h2`/`h3` across every page.

## Build & deployment files

`vercel.json` rewrites, checked in order: `/api/...` → the Express function, `/admin/...` → the
admin dashboard's own `index.html` (its own SPA router takes over from there), everything else →
this app's `index.html` (production equivalent of the dev-only `adminFallback` plugin). Its
`headers` block duplicates the same security headers `api/index.js` sets manually, applied by
Vercel's edge network to static frontend responses. `crons` registers the daily `0 3 * * *` UTC
hit on `/api/payments/anonymize-expired` — Vercel adds the `Authorization: Bearer <CRON_SECRET>`
header itself once `CRON_SECRET` is set as a project env var.

`.env.example` is the actual source of truth for what env vars this app needs — fully commented,
grouped by concern. `.env` itself is gitignored.

## Compliance docs

GDPR-NOTES.md is the team's internal Article 30 processing record (not the public Privacy
Policy — that's `Privacy.tsx`). Covers what payment data is collected and why (Article 6(1)(b)
contract necessity + Article 6(1)(c) — bookkeeping obligation under the Finnish Accounting Act,
*Kirjanpitolaki* 1336/1997), the 6-year retention/anonymisation policy and which code implements
it (`computeRetentionExpiry`/`anonymizeExpiredPayments`, above), which processors touch personal
data (Paytrail, MongoDB Atlas, Vercel, the eventual SMTP provider) and their EU-hosting status,
and a table mapping each GDPR data-subject right to the API route that implements it. Read it
before touching the `Payment` model, the anonymisation logic, or anything else that touches
customer data — it's the record of *why* that code is shaped the way it is, and any change to that
shape should update the doc too.

ATTRIBUTIONS.md: the `ui/` component library is built on shadcn/ui (MIT), and everything in
`src/assets/` is original Nuppu artwork.

## The two side projects

Both are separate, independently-tooled codebases that happen to live in this repo (confirmed by
`eslint.config.js`'s ignore list) — the root `vite build` command itself never touches either
directory, and neither is part of this app's own React Router config. They do still end up served
in production, though: `build:admin`/`build:prototype` build each one and copy its output into
`public/admin`/`public/app-preview`, and `vercel.json`'s rewrites route `/admin/*` and
`/app-preview/*` to them. So "not part of this app" and "not reachable in production" are two
different things — they're the former, not the latter.

**admin-dashboard/** — a separate Vite + React + TS project, own `package.json`. Built by the root
`build:admin` script into `public/admin/`, served at `your-domain/admin` in production; can also
run standalone (`cd admin-dashboard && npm run dev`, port 5174). Almost everything lives in one
`App.tsx`; the one exception is `components/AvailabilityCalendar.tsx`, which owns its own
week-navigation state and data fetching rather than being hoisted into `App.tsx` like
Bookings/Messages are — a deliberate, scoped break from that file's usual centralized-fetching
pattern, since the calendar's state genuinely doesn't share anything with the rest of the
dashboard. Uses `sessionStorage` (not `localStorage`) for the admin token, so it clears when the
tab closes rather than persisting indefinitely — a reasonable precaution for a credential that
grants access to customer personal data. Loads payments and messages with `Promise.all` (fine
here, since both are read-only fetches where either failing should abort the whole load —
different situation from the independent notification sends in the main backend, where partial
success matters). Merges contact messages and payment bookings-with-messages into one unified,
sorted list, since both are just "a message from a prospective customer" from the business's point
of view. Its own `config/api.ts` (`adminRequest`) always attaches `x-admin-token` and talks to the
same backend as the main site — there's only one backend in this whole system; the admin dashboard
is a second frontend on top of it. `adminRequest` supports `method`/`body` (not just GET) purely
for the availability-blocking calls; everything else on this page is still GET.

**app-prototype/** — a much larger standalone project: a clickable concept-validation prototype of
the actual Nuppu kids' app (stories, breathing exercises, emotion check-ins), entirely disconnected
from any real backend — everything is `localStorage`-backed via `ChildContext.tsx`. Built by
`build:prototype` into `public/app-preview/`, served at `your-domain/app-preview` in production
(that's the `<a href="/app-preview/">` link from About.tsx). Reuses the marketing site's brand
colors/fonts so the two feel like one product in a demo. Has its own
detailed doc, `app-prototype/PROTOTYPE_OVERVIEW.md` — read that directly rather than this file
duplicating it; it's kept up to date by whoever's actually working on that code.

## Common maintenance tasks

Change a service's price → edit `SERVICE_PRICES_CENTS` in `api/index.js`. Nothing else needs to
change; the frontend never hardcodes a price.

Edit page copy → find the key in `en.json`, edit it, make the same edit in `fi.json`. No automated
check keeps them in sync — double check both before committing.

Add a page/route → new file in `src/app/pages/` following the pattern above, register it in
`routes.tsx`'s `children`, add a nav link in `Navigation.tsx` if it should appear in the menu, add
translation keys to both JSON files.

Add a backend route → add it in `api/index.js` near the nearest existing pattern, then add a
matching wrapper in `config/api.ts` for the frontend to call it through.

Add a second paid service → add an entry to `SERVICE_PRICES_CENTS`, add it to the `service` enum
in `Payment.js`, update `paymentsAPI.create`'s type signature in `config/api.ts`.

Change working hours, slot length, or how far ahead people can book → all in the constants at the
top of `src/server/availability/slots.js` (`WORKING_WEEKDAYS`, `SLOT_HOURS`,
`CONSULTATION_MINUTES`, `BOOKING_WINDOW_DAYS`). Nothing else needs to change - the admin calendar
and the public picker both derive everything from these.

A booked slot needs freeing up (customer cancelled, no-show, etc.) → in the admin dashboard,
change that booking's status to `cancelled` or `refunded` in the Bookings table. That's the only
way to free a paid slot; there's no automatic release for a completed payment. (A `pending` one
frees itself after `PENDING_HOLD_MINUTES` if the customer never finishes checkout.)

Rotate the admin token → generate a new one (`openssl rand -hex 32`), update `ADMIN_TOKEN` in
Vercel, redeploy. It's a single shared secret, not per-user, so the old one stops working
immediately.

Check whether email/SMS/Paytrail are actually configured in production → no dashboard for this,
check Vercel's function logs right after a deploy for the `console.warn` lines (`"SMS receipts
disabled: ..."`, the Paytrail test-credentials fallback warning).

A payment stuck on "pending" → check whether the webhook (`/api/payments/callback`) is actually
reaching the deployment (Vercel function logs), and confirm `MONGODB_URI`/`MONGODB_REQUIRED` are
set correctly. Usually means either the callback never arrived or the DB write inside
`handlePaytrailReturn` silently failed.

## Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| `/admin` 404s locally | The `adminFallback` Vite plugin isn't matching, or `admin-dashboard` was never built | `vite.config.ts`; run `npm run build:admin` manually |
| `/admin` 404s in production | `vercel.json` rewrites didn't deploy, or `public/admin` wasn't populated at build time | `vercel.json`; confirm `npm run build` actually ran `build:admin` |
| CORS errors in the browser console | `CLIENT_URL` doesn't exactly match the frontend's real origin (scheme + host, no trailing slash) | `allowedOrigins` in `api/index.js` |
| Contact form "succeeds" but nothing shows up anywhere | `MONGODB_REQUIRED`/`MONGODB_URI` unset (DB write skipped) *and* SMTP unset (email skipped) — the route still returns 200 either way | Server logs for `console.warn` lines |
| Payment stuck on "pending" forever | Webhook not reaching the server, or DB down when the webhook did arrive | `DEPLOYMENT.md` troubleshooting; `handlePaytrailReturn` in `api/index.js` |
| "Database is temporarily unavailable" on payments routes | `MONGODB_REQUIRED` isn't `"true"`, or `MONGODB_URI` is unreachable | `requireDatabase` in `api/index.js` |
| A translated string shows the raw key (e.g. literally `"home.someKey"`) on screen | That key is missing from **both** `en.json` and `fi.json` | `t()`'s fallback chain — this is by design, meant to be visible so it gets noticed |
| Adding real analytics later and unsure how to respect cookie consent | `CookieConsent.tsx` currently gates nothing (no non-essential cookies exist yet) | Check `getStoredConsent() === "accepted"` before loading any such script — GDPR-NOTES.md flags this explicitly as a manual step |

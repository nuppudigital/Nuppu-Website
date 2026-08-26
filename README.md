# Nuppu

Bilingual (Finnish/English) marketing and booking site for Nuppu, a children's
emotional-learning platform. Visitors can read about the product, contact the
team, and book a paid 45-minute parent emotional-support consultation through
Paytrail.

## Stack

- React 18 + TypeScript, React Router 7 (`createBrowserRouter`), Tailwind CSS 4, Motion for animations
- Express 5 API (`api/index.js`) backed by MongoDB/Mongoose, deployed as a single Vercel serverless function alongside the frontend
- Paytrail for payments (redirect checkout), Nodemailer for email notifications, Twilio for optional SMS receipts

## Project layout

```
src/app/            React app: pages, components, i18n, routing
src/server/         Payment model + Paytrail client, shared with api/index.js
src/styles/         Tailwind entry point, theme variables, fonts
api/index.js         Express API (contact form, payments, admin routes, cron)
```

Two unrelated projects also live in this repo, each with its own `package.json` and its own
React app — not part of this site's router, but still built and served in production at their
own paths (`/admin`, `/app-preview`) via the `build:admin`/`build:prototype` scripts and
`vercel.json`'s rewrites:

- `admin-dashboard/` — an early admin UI for the API's contact/payment data. Run it standalone with `cd admin-dashboard && npm install && npm run dev` (port 5174).
- `app-prototype/` — a clickable prototype of the actual Nuppu kids' app (stories, breathing exercises, etc.), unrelated to the marketing site beyond sharing its branding. Same deal: `cd app-prototype && npm install && npm run dev`.

## Pages

`/` `/characters` `/about` `/contact` `/emotional-support` `/privacy` `/terms` `/cookies`, plus a catch-all 404.

Text lives in `src/app/i18n/en.json` and `fi.json` — edit both together. A few
strings (the contact email, mostly) are hardcoded in components instead.

## API

| Route | Purpose |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/contact` | Submit the contact form (rate-limited) |
| `GET /api/contact`, `PATCH /api/contact/:id` | Admin: list/update messages |
| `GET /api/availability/slots` | Public: open consultation time slots (Mon–Fri, 9–17 Europe/Helsinki) |
| `GET /api/availability/calendar` | Admin: full slot status (open/blocked/booked/past) for the availability calendar |
| `POST /api/availability/blocks`, `DELETE /api/availability/blocks/:id` | Admin: block/unblock a specific hour or a whole day |
| `POST /api/payments/create` | Start a Paytrail checkout for a chosen slot (rate-limited) |
| `GET /api/payments/success`, `/cancel` | Paytrail redirect targets |
| `GET\|POST /api/payments/callback` | Paytrail webhook |
| `GET /api/payments`, `/:id`, `PATCH /:id` | Admin: list/get/update payments (including status - cancelling/refunding frees the booked slot) |
| `DELETE /api/payments/:id/personal-data` | Anonymise a payment record |
| `GET /api/payments/export?email=` | Export a customer's payment history |
| `GET /api/payments/anonymize-expired` | Retention sweep (daily cron or admin) |
| `POST /api/admin/otp/request`, `POST /api/admin/otp/verify` | Admin sign-in: email a one-time code, then exchange it for a session token |

Admin routes require an `x-admin-token` header matching either `ADMIN_TOKEN` (a long static token, still supported for scripts/emergency access) or a session token issued by `/api/admin/otp/verify` (what the dashboard's sign-in flow uses day-to-day). Who can request a code is controlled by `ADMIN_OTP_EMAILS` (comma-separated; see `.env.example`).

## Running it locally

```bash
npm install
cp .env.example .env   # fill in what you need — see comments in that file
npm run dev             # frontend, http://localhost:5173
npm run server           # backend, http://localhost:5050 (separate terminal)
```

Without `MONGODB_URI` + `MONGODB_REQUIRED=true`, database-backed routes just
no-op. Without `PAYTRAIL_*`, payments run against Paytrail's public test
merchant. Without `SMTP_*`, email notifications are skipped with a log
warning.

## Deploying

See [DEPLOYMENT.md](DEPLOYMENT.md) — domain/DNS, MongoDB Atlas, Paytrail
onboarding, environment variables, the retention cron.

## Compliance

See [GDPR-NOTES.md](GDPR-NOTES.md) for the data-processing record behind the
payment flow, and [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party code.

## License

Proprietary — all rights reserved.

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

Two unrelated projects also live in this repo but are **not part of the
deployed site**:

- `admin-dashboard/` — an early admin UI for the API's contact/payment data. Has its own `package.json`; run it with `cd admin-dashboard && npm install && npm run dev`.
- `app-prototype/` — a prototype of the actual Nuppu kids' app (stories, breathing exercises, etc.), unrelated to the marketing site. Same deal: `cd app-prototype && npm install && npm run dev`.

Neither is built or routed by the root `vite build` — they're kept here for
reference/future work, not shipped to the public domain.

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
| `POST /api/payments/create` | Start a Paytrail checkout (rate-limited) |
| `GET /api/payments/success`, `/cancel` | Paytrail redirect targets |
| `GET\|POST /api/payments/callback` | Paytrail webhook |
| `GET /api/payments`, `/:id`, `PATCH /:id` | Admin: list/get/update payments |
| `DELETE /api/payments/:id/personal-data` | Anonymise a payment record |
| `GET /api/payments/export?email=` | Export a customer's payment history |
| `GET /api/payments/anonymize-expired` | Retention sweep (daily cron or admin) |

Admin routes require an `x-admin-token` header matching `ADMIN_TOKEN`.

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

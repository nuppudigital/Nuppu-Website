# GDPR Notes — Payment Processing

Internal Article 30 processing record, covering the payment flow added for the emotional support
consultation. Not the public Privacy Policy — that's `src/app/pages/Privacy.tsx`. This is the
working note for us.

## Consultation payment

We collect a customer's name, email, and payment amount/status in order to sell and fulfil the
paid 45-minute emotional support consultation, and because bookkeeping law requires it. The
actual fields stored are `customerName`, `customerEmail`, `amountCents`, `currency`, `status`,
`paytrailTransactionId`, `paytrailReference`, `paidAt`, plus timestamps — see
`src/server/models/Payment.js`.

We never see card numbers, CVV, bank account details, or any other payment instrument data.
Paytrail's checkout is redirect-based, so the customer enters that directly on Paytrail's own
page — it never touches Nuppu's server or database, which means there's nothing on our side to
encrypt, leak, or bring into PCI-DSS scope.

Legal basis under GDPR Article 6: Art. 6(1)(b) — contract, we need this data to deliver what the
customer paid for — and Art. 6(1)(c) — legal obligation, bookkeeping records have to be kept per
the Finnish Accounting Act (*Kirjanpitolaki* 1336/1997).

Retention is 6 years from the end of the fiscal year the payment was made in
(`Payment.retentionExpiresAt`, computed at creation by `computeRetentionExpiry()` in
`Payment.js`). After that the record gets anonymised — name/email cleared — rather than deleted,
so the accounting trail (amount, date, status, transaction ID) survives while the personal data
doesn't. A daily Vercel Cron job hits `/api/payments/anonymize-expired` to run this sweep
(DEPLOYMENT.md §8).

Open item: `computeRetentionExpiry()` currently assumes a calendar-year fiscal year (Jan 1–Dec
31). If Nuppu's actual fiscal year runs differently, that function is where to fix it — confirm
with the company's accountant before changing it.

Data subject rights, as currently implemented:

| Right | How |
|---|---|
| Access | `GET /api/payments/:id` (admin-token protected) |
| Rectification | `PATCH /api/payments/:id` — correct name/email |
| Erasure | `DELETE /api/payments/:id/personal-data` — anonymises (can't fully delete while inside the statutory retention window, per the legal-obligation basis above) |
| Portability/export | `GET /api/payments/export?email=...` — returns the customer's payment history as JSON |

All of these currently require the site operator's `ADMIN_TOKEN` — there's no self-service
customer portal yet. Building one (customers exercising these rights themselves instead of
emailing hello@nuppu.app) would need customer auth, which doesn't exist here. That's a later
product decision, not something worth building ahead of need.

## Processors (Article 30 records)

| Processor | Role | Data | EU-based storage? |
|---|---|---|---|
| **Paytrail Oyj** (business ID 2122839-7) | Payment service provider, licensed by FIN-FSA | Payment/card/bank details entered directly by the customer on Paytrail's checkout; Paytrail sends back only a transaction ID, reference, and status | Yes — Finnish company, EU-based infrastructure |
| **MongoDB Atlas** | Database hosting | Contact messages, payment records (name, email, amount, status) | Yes, *if* the cluster region is actually set to an EU region (Frankfurt/Ireland) — worth double-checking this was selected when the cluster was created (DEPLOYMENT.md §3) |
| **Vercel** | Frontend hosting + serverless API + cron | HTTP request logs; no persistent customer data stored by Vercel itself | US company; request routing/edge may not be EU-only unless region-pinned. Not really a processor of *stored* personal data (no database on their side), but flagging it since it handles all traffic including payment redirects |
| SMTP provider (TBD — see `.env.example`) | Transactional email (contact form, booking confirmations) | Customer name/email, message content | Depends which one we pick — confirm EU hosting when choosing (SendGrid/Mailgun both have EU regions) |

Still need a signed Data Processing Agreement with each processor above before launch. Paytrail's
merchant agreement includes standard DPA terms; MongoDB Atlas and whichever SMTP provider we land
on both publish standard DPAs that just need reviewing and accepting via their admin console.

## Cookie consent

Added a cookie consent banner (`src/app/components/CookieConsent.tsx`) mostly pre-emptively —
payment confirmation pages are exactly where marketing pixels tend to get bolted on later, and
it's easier to have the consent plumbing in place already than to retrofit it. Right now Nuppu
sets **no non-essential cookies** at all (no analytics, no marketing pixels), so the banner just
records a preference without gating anything yet. Whenever analytics (Plausible, say) gets added,
it needs to be wired to only load after `localStorage["nuppu-cookie-consent"] === "accepted"` —
that check isn't automatic, it has to happen at integration time.

## Children's data

The marketing site itself doesn't collect data *from* children — the contact form and payment
flow are both filled in by adults (parents/professionals) about themselves. If the actual Nuppu
app (see `app-prototype/`) ever collects data from children aged 3–8 directly, that pulls in GDPR
Article 8 (parental consent for information society services offered to children), which is out
of scope for this marketing-site work and needs revisiting once that product actually gets built.

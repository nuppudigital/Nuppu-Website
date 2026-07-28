# GDPR Notes — Payment Processing

Internal reference for Nuppu's records of processing activities (GDPR Article 30). Covers the
new payment processing activity added for the emotional support consultation. This is a working
note for the team, not the public-facing Privacy Policy (see `src/app/pages/Privacy.tsx` for
that).

## Processing activity: consultation payment

**What:** Collecting a customer's name, email, and payment amount/status to sell and fulfil a
paid 45-minute emotional support consultation, and to meet statutory bookkeeping requirements.

**Data collected:** `customerName`, `customerEmail`, `amountCents`, `currency`, `status`,
`paytrailTransactionId`, `paytrailReference`, `paidAt`, timestamps. See `src/server/models/Payment.js`.

**Data explicitly NOT collected:** card numbers, CVV, bank account/credentials, or any other
payment instrument data. Paytrail's redirect-based checkout means the customer enters this
directly on Paytrail's own page — it never reaches Nuppu's server or database, so there's nothing
here to encrypt, leak, or need PCI-DSS scope for.

**Legal basis (GDPR Article 6):**
- Art. 6(1)(b) — contract: processing is necessary to deliver the consultation the customer paid for.
- Art. 6(1)(c) — legal obligation: bookkeeping records must be retained per the Finnish
  Accounting Act (*Kirjanpitolaki* 1336/1997).

**Retention:** 6 years from the end of the fiscal year the payment was made in
(`Payment.retentionExpiresAt`, computed at creation — see `computeRetentionExpiry()` in
`src/server/models/Payment.js`). After that, the record is **anonymised** (name/email cleared),
not deleted, so the accounting trail (amount, date, status, transaction ID) survives while
personal data does not. A daily Vercel Cron job (`/api/payments/anonymize-expired`) performs
this sweep — see `DEPLOYMENT.md` §8.

**Open item:** retention is currently computed assuming a calendar-year fiscal year (Jan 1 – Dec
31). If Nuppu's actual fiscal year differs, update `computeRetentionExpiry()` accordingly —
confirm with the company's accountant.

**Data subject rights implemented:**
| Right | How |
|---|---|
| Access | `GET /api/payments/:id` (admin-token protected) |
| Rectification | `PATCH /api/payments/:id` — correct name/email |
| Erasure | `DELETE /api/payments/:id/personal-data` — anonymises (cannot fully delete while inside the statutory retention window, per the legal-obligation basis above) |
| Portability/export | `GET /api/payments/export?email=...` — returns the customer's payment history as JSON |

All of the above currently require the site operator's `ADMIN_TOKEN` — there is no self-service
customer portal yet. A self-service portal (customers exercising these rights themselves instead
of emailing hello@nuppu.app) would need customer auth, which doesn't exist here — that's a
product decision for later, not something to build speculatively.

## Processors (Article 30 records)

| Processor | Role | Data | EU-based storage? |
|---|---|---|---|
| **Paytrail Oyj** (business ID 2122839-7) | Payment service provider, licensed by FIN-FSA | Payment/card/bank details entered directly by the customer on Paytrail's checkout; Paytrail sends back only a transaction ID, reference, and status | Yes — Finnish company, EU-based infrastructure |
| **MongoDB Atlas** | Database hosting | Contact messages, payment records (name, email, amount, status) | Yes, *if* the cluster region is set to an EU region (e.g. Frankfurt/Ireland) — confirm this was actually selected when the Atlas cluster was created (see `DEPLOYMENT.md` §3) |
| **Vercel** | Frontend hosting + serverless API + cron | HTTP request logs; no persistent customer data stored by Vercel itself | Vercel is a US company; request routing/edge may not be EU-only unless region-pinned. Not a data processor for *stored* personal data (no database), but flagging since it handles all traffic including payment redirects. |
| SMTP provider (TBD — see `.env.example`) | Transactional email (contact form, booking confirmations) | Customer name/email, message content | Depends on provider chosen — confirm EU hosting when selecting one (e.g. SendGrid/Mailgun both have EU regions) |

**Open item:** a signed Data Processing Agreement should be in place with each processor above
before launch. Paytrail's merchant agreement includes standard DPA terms; MongoDB Atlas and the
eventual SMTP provider each publish standard DPAs that just need reviewing and accepting via
their admin console.

## Cookie consent

A cookie consent banner (`src/app/components/CookieConsent.tsx`) was added, since payment
confirmation pages are exactly where marketing pixels tend to get added later, and it's better
to have consent infrastructure in place before that happens rather than retrofit it. At the time
of writing, Nuppu sets **no non-essential cookies** (no analytics, no marketing pixels), so the
banner currently records a preference but doesn't gate anything. If/when analytics (e.g.
Plausible) gets added, wire it to only load after the visitor has accepted
(`localStorage["nuppu-cookie-consent"] === "accepted"`) — that's not automatic and needs doing at
integration time.

## Children's data

Nuppu's marketing site itself does not collect data *from* children — the contact form and
payment flow are both filled in by adults (parents/professionals) about themselves. If the actual
Nuppu app (see `app-prototype/`) ever collects data from children aged 3–8 directly, that
triggers additional GDPR obligations (Article 8 — parental consent for information society
services offered to children) that are out of scope for this marketing-site work and should be
revisited when that product is built.

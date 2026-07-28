# Nuppu - Children's Emotional Learning App

A safe, ad-free, GDPR-compliant digital platform for children's emotional learning and mindfulness, with a bookable paid emotional-support consultation for parents.

## 🌟 Project Overview

Nuppu is a bilingual (Finnish/English) marketing and booking site for a children's emotional-intelligence platform, offering:
- Personalized stories with four friendly characters
- Interactive emotional exercises
- A paid 45-minute parent emotional-support consultation (booked and paid via Paytrail)
- Classroom and healthcare integration messaging

## 🎨 Design Philosophy

- **Warm & Child-Friendly**: Honey & eucalyptus pastel palette (gold, sage, ivory, cream)
- **Trustworthy**: Built for parents, teachers, and healthcare professionals
- **Safe**: GDPR-compliant, ad-free, psychologically sound

## 🚀 Tech Stack

### Frontend
- **React 18.3** (Functional components, Hooks)
- **React Router 7.13** (Multi-page architecture, `createBrowserRouter`)
- **Tailwind CSS 4.1** (Modern styling, mobile-first)
- **Motion (Framer Motion)** (Animations & transitions)
- **TypeScript**
- **Custom i18n** (`LanguageContext`) — Finnish (default) and English, 263 translation keys, kept in sync

### Backend
- **Node.js + Express 5** (`api/index.js`), deployed as a single Vercel serverless function
- **MongoDB + Mongoose 9**
- **Paytrail** payment integration (redirect checkout; falls back to Paytrail's published test merchant when no real credentials are set)
- **Nodemailer** for contact/booking email notifications
- **Twilio** for optional SMS payment receipts
- **CORS**, rate limiting, and a Vercel Cron job for GDPR data retention

## 📁 Project Structure

```
/src
  /app
    /components
      - Navigation.tsx (Sticky nav with mobile menu)
      - Footer.tsx (Global footer)
      - CookieConsent.tsx (Cookie consent banner)
      - RouteError.tsx (Router error boundary)
      /media
        - ImageWithFallback.tsx
      /ui (shadcn/ui-based components)
    /pages
      - Home.tsx
      - Characters.tsx
      - About.tsx
      - Contact.tsx
      - EmotionalSupport.tsx (paid consultation booking + Paytrail checkout)
      - Privacy.tsx
      - Terms.tsx
      - Cookies.tsx
      - NotFound.tsx
    /i18n
      - LanguageContext.tsx
      - en.json / fi.json
    /hooks
      - usePageMeta.ts
    /config
      - api.ts
    - App.tsx / Root.tsx / routes.tsx
  /server
    /models
      - Payment.js
    /payments
      - paytrailClient.js
  /styles
    - fonts.css (Google Fonts: Poppins, Nunito)
    - theme.css (Custom color palette)
    - tailwind.css / index.css

/api/index.js (Express backend, deployed as a Vercel serverless function)
/.env.example (Environment variables template)
/vercel.json (rewrites, security headers, cron schedule)
```

## 🎭 Characters

| Character | Personality | Focus |
|-----------|-------------|-------|
| **Nuppu Bunny** | Emotional Guide and Friendship | Recognizing emotions, empathy, self-regulation |
| **Muru Bear** | Safety & Comfort | Security, calming down, coping with disappointment |
| **Hippu Cat** | Curiosity and Practicing Boundaries | Expressing one's own will, boundaries, courage |
| **Lumo Fox** | Thinking and Problem-Solving | Handling disappointment, conflict resolution, flexibility |

## 🛠️ Setup Instructions

### Frontend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Configure Environment**
   - Copy `.env.example` to `.env`
   - See `.env.example` for the full list of variables (API base URL, MongoDB, Paytrail, SMTP, Twilio, admin/cron tokens)

### Backend Setup

The backend is a real Express app at `api/index.js`, meant to run as a Vercel serverless function (see `DEPLOYMENT.md`). To run it locally:

```bash
npm run server   # node api/index.js
```

Without `MONGODB_URI` set (and `MONGODB_REQUIRED=true`), database-backed routes will no-op or error gracefully — see `.env.example`.

### API Endpoints

- `GET /api/health` — Health check
- `POST /api/contact` — Submit contact form (rate-limited)
- `GET /api/contact` — List messages (admin)
- `PATCH /api/contact/:id` — Update message status (admin)
- `POST /api/payments/create` — Start a Paytrail checkout (rate-limited)
- `GET /api/payments/success` / `GET /api/payments/cancel` — Paytrail redirect returns
- `GET|POST /api/payments/callback` — Paytrail webhook
- `GET /api/payments` — List payments (admin)
- `GET /api/payments/:id` — Get a payment (admin)
- `PATCH /api/payments/:id` — Update a payment (admin)
- `DELETE /api/payments/:id/personal-data` — Anonymise a payment record (admin)
- `GET /api/payments/export` — Export a customer's payment history by email (admin)
- `GET /api/payments/anonymize-expired` — Retention sweep (cron or admin)

## 📱 Pages & Features

### Home Page (`/`)
- Hero section with CTA, "Why Nuppu" carousel, target audience section, bottom CTA

### Characters Page (`/characters`)
- Grid showcase of the 4 characters with personalities and emotion focus

### About Page (`/about`)
- Mission, values, psychological frameworks, privacy & security commitment

### Contact Page (`/contact`)
- Contact form (name, email, role, message) submitting to the live `/api/contact` endpoint

### Emotional Support Page (`/emotional-support`)
- Paid 45-minute parent consultation, booking form, Paytrail checkout redirect, success/cancel banners

### Privacy / Terms / Cookies (`/privacy`, `/terms`, `/cookies`)
- Legal pages; see `GDPR-NOTES.md` for the underlying data-processing records

### 404 (any unmatched route)

## 🎨 Color Palette

```css
--nuppu-honey: #E8C468;
--nuppu-eucalyptus: #A8C5BA;
--nuppu-ivory: #FAF7F2;
--nuppu-gold: #D4AF5E;
--nuppu-sage: #B8D4C7;
--nuppu-cream: #F5F0E8;
--primary: #A8C5BA;
```

## 🔒 Security & Privacy

- GDPR-compliant (see `GDPR-NOTES.md` for the full processing-activity record)
- No advertisements, no non-essential cookies (cookie consent banner in place for future use)
- Card/bank details never touch Nuppu's servers (handled entirely by Paytrail's redirect checkout)
- 6-year payment record retention per Finnish bookkeeping law, then anonymised (not deleted) via a daily cron job
- Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) set in `vercel.json`

## 🌐 Deployment

Single Vercel deployment serves both the static frontend and the backend (`api/index.js` as a serverless function) on one domain — see `DEPLOYMENT.md` for full instructions, DNS setup, MongoDB Atlas, and Paytrail onboarding steps.

> **Domain:** the final production domain (`.fi` vs `.app`) is still being confirmed — see `DEPLOYMENT.md`.

## 📝 Database Models

### ContactMessage
```javascript
{
  name: String (required, max 100 chars)
  email: String (required, validated)
  role: Enum ['parent', 'teacher', 'healthcare', 'other']
  message: String (required, max 2000 chars)
  status: Enum ['new', 'read', 'replied']
  ipAddress: String
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Payment (`src/server/models/Payment.js`)
```javascript
{
  customerName: String
  customerEmail: String
  amountCents: Number
  currency: String
  status: String
  paytrailTransactionId: String
  paytrailReference: String
  paidAt: Date
  retentionExpiresAt: Date  // computed at creation, 6 years from fiscal year end
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## 🎯 Key Features

✅ Multi-page architecture with React Router
✅ Bilingual (Finnish/English) with persisted language preference
✅ Responsive design (mobile, tablet, desktop)
✅ Smooth animations with Motion
✅ Interactive carousel
✅ Live contact form and Paytrail-backed booking/payment flow
✅ Cookie consent banner
✅ Accessible (ARIA labels, semantic HTML)
✅ SEO-friendly

## ✅ Pre-Launch Checklist

- Confirm the final production domain and update `index.html`'s Open Graph tags and `DEPLOYMENT.md` accordingly
- Set `VITE_API_BASE_URL` in frontend hosting environment
- Set backend `CLIENT_URL`, `MONGODB_URI`, `MONGODB_REQUIRED=true`, `ADMIN_TOKEN`, `CRON_SECRET`
- Apply for a real Paytrail merchant agreement and set `PAYTRAIL_MERCHANT_ID` / `PAYTRAIL_SECRET_KEY`
- Set up a transactional email provider and fill in `SMTP_*` variables
- Verify legal pages (`/privacy`, `/terms`, `/cookies`) in production
- Submit a real contact form entry and a test Paytrail payment; verify DB persistence
- Confirm social preview image and metadata render correctly
- Sign DPAs with MongoDB Atlas, Paytrail, and the chosen SMTP provider (see `GDPR-NOTES.md`)

## 📧 Contact

- **Email**: hello@nuppu.app

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ for children's emotional wellbeing.

# 🎯 Nuppu Project - Complete Overview

## 📋 Project Summary

**Project Name:** Nuppu
**Type:** Children's Emotional Learning & Mindfulness marketing site, with a paid parent consultation booking flow
**Status:** ✅ Feature-complete; pending final domain, real Paytrail merchant credentials, and SMTP setup before launch
**Architecture:** Bilingual multi-page React application with a live Express/MongoDB backend deployed as a single Vercel serverless function

---

## 🌟 What Has Been Built

### ✅ Frontend (React + TypeScript)

**Pages (8 + 404):**
1. **Home** (`/`) - Hero, carousel, target audiences, CTAs
2. **Characters** (`/characters`) - 4 character showcases with animations
3. **About** (`/about`) - Mission, values, frameworks, security
4. **Contact** (`/contact`) - Contact form, submits to the live `/api/contact` endpoint
5. **Emotional Support** (`/emotional-support`) - Paid 45-minute consultation booking with Paytrail checkout
6. **Privacy** (`/privacy`) - Privacy policy
7. **Terms** (`/terms`) - Terms of service
8. **Cookies** (`/cookies`) - Cookie policy
9. **404 Page** - Custom not found page, plus a router `ErrorBoundary` (`RouteError.tsx`)

**Global Components:**
- **Navigation** - Sticky navbar with mobile hamburger menu
- **Footer** - Multi-column footer with links
- **CookieConsent** - Cookie consent banner (records a preference; nothing is currently gated by it since no non-essential cookies are set)
- **All UI Components** - shadcn/ui-based components

**Internationalization:**
- Custom `LanguageContext` (no external i18n library), Finnish (default) and English
- 263 translation keys per language, fully in sync (no missing keys in either direction)
- Language preference persisted to `localStorage`; `<html lang>` updated reactively

**Key Features:**
✅ Fully responsive (mobile, tablet, desktop)
✅ Smooth animations with Motion (Framer Motion)
✅ Interactive carousel on homepage
✅ Form validation with error/success states
✅ SEO-friendly semantic HTML, per-page meta via `usePageMeta`
✅ Accessibility (ARIA labels, alt text)
✅ Custom "honey & eucalyptus" color palette
✅ Google Fonts integration (Poppins, Nunito)

---

### ✅ Backend (Node.js + Express 5 + MongoDB/Mongoose 9) — Live, deployed as a Vercel serverless function

**Status:** Real backend, not a reference/demo. Deployed from a single repo alongside the frontend (see `DEPLOYMENT.md`).

**Key Files:**
- `/api/index.js` - Express API server (~950 lines): contact form, Paytrail payments, admin routes, cron endpoint
- `/src/server/models/Payment.js` - Payment model, including retention-expiry computation
- `/src/server/payments/paytrailClient.js` - Paytrail integration client
- `/.env.example` - Environment variables template

**API Endpoints (13 total):**
- `GET /api/health`
- `POST /api/contact`, `GET /api/contact`, `PATCH /api/contact/:id`
- `POST /api/payments/create`
- `GET /api/payments/success`, `GET /api/payments/cancel`
- `GET|POST /api/payments/callback` (Paytrail webhook)
- `GET /api/payments`, `GET /api/payments/:id`, `PATCH /api/payments/:id`
- `DELETE /api/payments/:id/personal-data`
- `GET /api/payments/export`
- `GET /api/payments/anonymize-expired` (daily Vercel Cron job, see `vercel.json`)

**Integrations:**
- **Paytrail** - redirect checkout for the €29 consultation; falls back to Paytrail's published test merchant when real credentials aren't set
- **Nodemailer** - contact/booking email notifications (silently skipped if `SMTP_*` is unset)
- **Twilio** - optional SMS payment receipts

**Database Schema:**
- `ContactMessage` model with validation
- `Payment` model with GDPR-driven 6-year retention + anonymisation, not deletion
- Timestamps and status tracking on both

---

## 📁 Complete File Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   ├── RouteError.tsx
│   │   │   ├── media/ImageWithFallback.tsx
│   │   │   └── ui/ (shadcn/ui-based components)
│   │   ├── pages/
│   │   │   ├── Home.tsx / Characters.tsx / About.tsx / Contact.tsx
│   │   │   ├── EmotionalSupport.tsx
│   │   │   ├── Privacy.tsx / Terms.tsx / Cookies.tsx
│   │   │   └── NotFound.tsx
│   │   ├── i18n/
│   │   │   ├── LanguageContext.tsx
│   │   │   └── en.json / fi.json
│   │   ├── hooks/usePageMeta.ts
│   │   ├── config/api.ts
│   │   └── App.tsx / Root.tsx / routes.tsx
│   ├── server/
│   │   ├── models/Payment.js
│   │   └── payments/paytrailClient.js
│   └── styles/
│       ├── fonts.css / theme.css / tailwind.css / index.css
│
├── Backend:
│   └── api/index.js (Express + MongoDB, deployed as a Vercel function)
│
├── Documentation:
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── GDPR-NOTES.md
│   ├── PROJECT_OVERVIEW.md (this file)
│   └── QUICK_START.md
│
└── Configuration:
    ├── package.json / vite.config.ts / postcss.config.mjs / tsconfig.json
    └── vercel.json (rewrites, security headers, cron)
```

---

## 🎨 Design System

### Color Palette
```css
/* Nuppu Brand Colors — Honey & Eucalyptus */
--nuppu-honey: #E8C468;
--nuppu-eucalyptus: #A8C5BA;  /* Primary */
--nuppu-ivory: #FAF7F2;
--nuppu-gold: #D4AF5E;
--nuppu-sage: #B8D4C7;
--nuppu-cream: #F5F0E8;
```

### Typography
- **Primary:** Poppins (400, 500, 600, 700)
- **Secondary:** Nunito (400, 500, 600, 700)

### Animations
- Page transitions, hover effects, carousel slides, form states, loading spinners

---

## 🎭 Characters

| Character | Personality | Focus | Description source |
|-----------|-------------|-------|---------------------|
| **Nuppu Bunny** | Emotional Guide and Friendship | Recognizing emotions, empathy, self-regulation | `i18n: characters.nuppu` |
| **Muru Bear** | Safety & Comfort | Security, calming down, coping with disappointment | `i18n: characters.muru` |
| **Hippu Cat** | Curiosity and Practicing Boundaries | Expressing one's own will, boundaries, courage | `i18n: characters.hippu` |
| **Lumo Fox** | Thinking and Problem-Solving | Handling disappointment, conflict resolution, flexibility | `i18n: characters.lumo` |

---

## 🚀 How to Use This Project

1. `npm install`
2. `npm run dev` for the frontend, `npm run server` (`node api/index.js`) for the backend
3. Copy `.env.example` to `.env` and fill in values — without `MONGODB_URI`/`MONGODB_REQUIRED=true`, database-backed routes no-op or error gracefully, and without `PAYTRAIL_*`, payments run against Paytrail's public test merchant
4. **See `/DEPLOYMENT.md` for full production deployment instructions** (single Vercel deployment, MongoDB Atlas, Paytrail onboarding, DNS, cron)

---

## 📦 Technologies Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | ^6.0.3 | Type safety |
| React Router | 7.13.0 | Navigation |
| Tailwind CSS | 4.1.12 | Styling |
| Motion | 12.23.24 | Animations |
| Vite | 6.3.5 | Build tool |
| Lucide React | 0.487.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0.0 | Runtime |
| Express | ^5.2.1 | Web framework |
| MongoDB | - | Database |
| Mongoose | ^9.3.3 | ODM |
| CORS | ^2.8.6 | CORS handling |
| Nodemailer | ^9.0.3 | Email notifications |
| Twilio | ^5.13.1 | SMS receipts |
| node-fetch | ^2.7.0 | Paytrail API calls |

---

## ✅ Quality Checklist

### Functionality
- [x] All pages render correctly
- [x] Navigation works on all pages
- [x] Mobile menu functions properly
- [x] Form validation works (contact + booking)
- [x] Loading states implemented
- [x] Error handling in place
- [x] Success messages display
- [x] 404 page and router error boundary in place
- [x] Live contact form and Paytrail checkout flow

### Design
- [x] Responsive on mobile/tablet/desktop
- [x] Consistent color palette
- [x] Proper typography hierarchy
- [x] Smooth animations
- [x] Hover states on interactive elements
- [x] Loading indicators

### Accessibility
- [x] Semantic HTML elements
- [x] ARIA labels on buttons
- [x] Alt text on images
- [x] Keyboard navigation support
- [x] Focus states visible

### Internationalization
- [x] Finnish and English fully translated (263/263 keys)
- [x] Language preference persisted
- [x] `<html lang>` kept in sync with selected language

### Performance
- [x] Code splitting with routes
- [x] Tree shaking (Vite)
- [x] CSS purging (Tailwind)

### SEO
- [x] Semantic HTML structure
- [x] Per-page meta title/description via `usePageMeta`
- [x] Clean URL structure

---

## 🔧 Configuration Files

- `package.json` - Frontend + backend dependencies (single package)
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript settings
- `postcss.config.mjs` - PostCSS for Tailwind
- `vercel.json` - API rewrites, security headers, daily cron job
- `.env.example` - Full environment variable reference (server, database, admin/cron auth, email, SMS, Paytrail, frontend API URL)

---

## 📊 Key Metrics

- **Total Pages:** 9 (8 routed pages + 404)
- **Total API Endpoints:** 13 (live, not reference code)
- **Languages:** 2 (Finnish default, English), 263 keys each
- **Supported Devices:** All (mobile, tablet, desktop)

---

## 🎯 Open Items Before Launch

- Confirm the final production domain (`.fi` vs `.app` — currently referenced inconsistently across docs/code; see `DEPLOYMENT.md`)
- Apply for a real Paytrail merchant agreement (currently running against Paytrail's public test credentials)
- Choose and configure a transactional email provider (`SMTP_*` currently unset)
- Sign DPAs with MongoDB Atlas, Paytrail, and the chosen SMTP provider (see `GDPR-NOTES.md`)
- Confirm the MongoDB Atlas cluster region is EU-based (required for the GDPR EU-storage claim)
- Decide whether historical `node_modules/`/`dist/` build output should be purged from git tracking (see repo hygiene note in `DEPLOYMENT.md`/git history)

### Future Enhancements (not started)
- Admin dashboard UI (admin routes exist, no UI yet — currently token-only via `x-admin-token`)
- Self-service customer data-rights portal (currently staff-mediated via `hello@nuppu.app`)
- Analytics (e.g. Plausible) — must be wired to respect cookie consent when added
- Automated tests (unit/integration/E2E) — none exist yet
- CI/CD pipeline, error monitoring (e.g. Sentry)

---

## 🆘 Support & Resources

### Documentation Files
- `/README.md` - Project overview & setup
- `/DEPLOYMENT.md` - Deployment instructions
- `/GDPR-NOTES.md` - Data-processing record for payments
- `/PROJECT_OVERVIEW.md` - This file
- `/QUICK_START.md` - Quick reference

### Contact
- Email: hello@nuppu.app

---

Built with ❤️ for children's emotional wellbeing

Last Updated: 2026-07-18

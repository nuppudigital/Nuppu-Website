# ⚡ Quick Start Guide - Nuppu Website

## 🎯 Get Running Locally

### Step 1: Install & Run

```bash
npm install
npm run dev          # frontend, http://localhost:5173
npm run server       # backend, node api/index.js (in a second terminal, optional)
```

Copy `.env.example` to `.env` first if you want the contact form or booking flow to work locally — see that file for the full variable list.

### Step 2: Navigate the Site
- **Home (/)** - Main landing page with hero and carousel
- **Characters (/characters)** - Meet the 4 Nuppu friends
- **About (/about)** - Learn about our mission
- **Contact (/contact)** - Contact form (submits to the real `/api/contact` endpoint)
- **Emotional Support (/emotional-support)** - Paid consultation booking + Paytrail checkout
- **Privacy / Terms / Cookies** - Legal pages

The site is bilingual (Finnish default, English) — there's a language toggle in the nav, and the preference is remembered.

---

## 📂 Project Files Overview

### Main Pages
```
/src/app/pages/
├── Home.tsx
├── Characters.tsx
├── About.tsx
├── Contact.tsx
├── EmotionalSupport.tsx  ← Booking + Paytrail checkout
├── Privacy.tsx
├── Terms.tsx
├── Cookies.tsx
└── NotFound.tsx
```

### Components
```
/src/app/components/
├── Navigation.tsx    ← Sticky nav (desktop + mobile)
├── Footer.tsx         ← Global footer
├── CookieConsent.tsx ← Cookie consent banner
└── RouteError.tsx    ← Router error boundary
```

### Configuration
```
/src/app/
├── App.tsx           ← Router setup
├── Root.tsx           ← Layout wrapper
├── routes.tsx         ← Route configuration
└── i18n/              ← LanguageContext + en.json / fi.json
```

### Backend
```
/api/index.js                       ← Express API (contact + Paytrail payments)
/src/server/models/Payment.js       ← Payment model
/src/server/payments/paytrailClient.js  ← Paytrail integration
```

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `/src/styles/theme.css`:
```css
:root {
  --nuppu-honey: #E8C468;       ← Change this
  --nuppu-eucalyptus: #A8C5BA;  ← Change this
  --primary: #A8C5BA;           ← Change this
}
```

### Change Fonts
Edit `/src/styles/fonts.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'YourFont', sans-serif;
}
```

### Change Images
Replace the files in `/src/assets` and update references in page components; images render via the `ImageWithFallback` component. All current images are local assets (no external image CDN is used).

### Change Text Content
Almost all visible text lives in `/src/app/i18n/en.json` and `/src/app/i18n/fi.json` — edit both files together to keep languages in sync. A handful of hardcoded strings (e.g. the contact email) live directly in the page/component files.

---

## 🚀 Deploy to Production

This is a **single Vercel deployment** — one project serves both the static frontend and the backend (`api/index.js` runs as a Vercel Serverless Function, no separate hosting needed).

1. Push code to GitHub
2. In Vercel: New Project → Import the repo (Vite build auto-detected)
3. Add the environment variables from `.env.example` under Project → Settings → Environment Variables
4. Deploy

**See `/DEPLOYMENT.md` for the full walkthrough** (domain/DNS, MongoDB Atlas, Paytrail onboarding, the retention cron job).

---

## 🔌 Backend Status

### Current State
✅ Contact form and the emotional-support booking flow both submit to the real `/api/index.js` backend — this is not mock/reference code.

### To Run It in Production
1. Deploy this repo to Vercel (backend deploys automatically alongside the frontend — see above)
2. Set up MongoDB Atlas and set `MONGODB_URI` / `MONGODB_REQUIRED=true`
3. Set `CLIENT_URL` to your production frontend origin
4. Apply for a real Paytrail merchant agreement (or leave `PAYTRAIL_*` unset to keep using Paytrail's public test merchant)
5. Configure `SMTP_*` for email notifications

**See `/DEPLOYMENT.md` for complete backend setup.**

---

## 📱 Test Responsive Design

### Desktop (1920px+)
- Full navigation bar, multi-column layouts, large images and text

### Tablet (768px - 1024px)
- Adjusted layouts, readable text sizes, touch-friendly buttons

### Mobile (< 768px)
- Hamburger menu, single column layouts, optimized for touch

**Tip:** Use browser DevTools to test different screen sizes!

---

## ✅ What's Included

### Pages
- ✅ Home, Characters, About, Contact, Emotional Support (booking), Privacy, Terms, Cookies, 404

### Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Bilingual (Finnish/English), 263 translation keys, fully in sync
- ✅ Smooth animations
- ✅ Form validation (contact + booking)
- ✅ Cookie consent banner
- ✅ Mobile menu
- ✅ SEO-friendly, per-page meta tags
- ✅ Accessible (ARIA labels)

### Backend (Live, not reference code)
- ✅ Node.js + Express server (`/api/index.js`)
- ✅ MongoDB schema (contact messages + payments)
- ✅ Paytrail payment integration
- ✅ Email (Nodemailer) and optional SMS (Twilio) notifications
- ✅ CORS + rate limiting
- ✅ Daily cron job for GDPR data retention

---

## 🎯 Common Tasks

### Add a New Page
1. Create file: `/src/app/pages/NewPage.tsx`
2. Add route in `/src/app/routes.tsx`:
   ```typescript
   { path: "newpage", Component: NewPage }
   ```
3. Add nav link in `/src/app/components/Navigation.tsx`
4. Add any text you need to both `en.json` and `fi.json`

### Change Logo
Edit `Navigation.tsx` and replace the logo div with your image.

### Update Contact Email
The email `hello@nuppu.app` appears in `Footer.tsx`, `Contact.tsx`, `en.json`, `fi.json`, `.env.example`, and `api/index.js` (`NUPPU_EMAIL`/`MAIL_FROM` defaults) — update all of them together.

### Add More Characters
Edit `characters.*` in `en.json`/`fi.json` and the rendering logic in `/src/app/pages/Characters.tsx`.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `/README.md` | Project overview & setup |
| `/DEPLOYMENT.md` | Deployment instructions |
| `/GDPR-NOTES.md` | Data-processing record for payments |
| `/PROJECT_OVERVIEW.md` | Complete project details |
| `/QUICK_START.md` | This file - quick reference |

---

## 🆘 Need Help?

### Common Issues

**Issue:** Navigation not working
**Fix:** Make sure you're using React Router correctly

**Issue:** Styles not loading
**Fix:** Check Tailwind CSS is properly configured

**Issue:** Contact/booking form not submitting
**Fix:** Check the browser console for errors; confirm `VITE_API_BASE_URL` points at a running backend, and that `MONGODB_URI`/`MONGODB_REQUIRED` are set if you need persistence

**Issue:** Paytrail checkout doesn't redirect back correctly
**Fix:** Confirm `CLIENT_URL` on the backend matches the frontend's actual origin exactly (scheme + host, no trailing slash)

---

Built with ❤️ for children's emotional wellbeing
Contact: hello@nuppu.app

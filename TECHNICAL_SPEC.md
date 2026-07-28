# 🔧 Technical Specification - Nuppu Website

## System Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────┐
│         Browser (Client-Side)           │
├─────────────────────────────────────────┤
│  React 18.3 + TypeScript                │
│  React Router 7.13 (createBrowserRouter)│
│  Tailwind CSS 4.1 (Styling)             │
│  Motion (Animations)                    │
│  Custom i18n (fi/en, LanguageContext)   │
└─────────────────────────────────────────┘
```

### Backend Architecture
```
┌─────────────────────────────────────────┐
│  Node.js + Express 5 (api/index.js)     │
│  Deployed as a Vercel Serverless        │
│  Function — single deployment serves    │
│  both frontend and /api/*               │
├─────────────────────────────────────────┤
│  Mongoose 9 ODM                         │
│  MongoDB Database (Atlas)               │
│  Paytrail payment client                │
│  Nodemailer (email) / Twilio (SMS)      │
│  CORS + rate limiting middleware        │
│  JSON Body Parser                       │
└─────────────────────────────────────────┘
```

This is a single-repo, single-deployment architecture — there is no separate backend service in production. See `DEPLOYMENT.md` for the full rationale and a standalone-backend fallback (Railway/Render/Fly) if ever needed.

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.3.1 | UI Library |
| react-router / react-router-dom | 7.13.0 | Routing |
| motion | 12.23.24 | Animations |
| lucide-react | 0.487.0 | Icons |
| tailwindcss | 4.1.12 | Styling |
| express | ^5.2.1 | Backend web framework |
| mongoose | ^9.3.3 | MongoDB ODM |
| nodemailer | ^9.0.3 | Email notifications |
| twilio | ^5.13.1 | SMS receipts |
| node-fetch | ^2.7.0 | Paytrail API calls |
| cors | ^2.8.6 | CORS handling |
| dotenv | ^17.4.2 | Env var loading |

### Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| vite | 6.3.5 | Build tool & dev server |
| typescript | ^6.0.3 | Type checking |
| @vitejs/plugin-react | 4.7.0 | React support for Vite |
| eslint | ^9.39.4 | Linting |
| postcss | Latest | CSS processing |

---

## File Structure & Responsibilities

### Entry Points
```
/src/app/App.tsx
└── RouterProvider
    └── routes.tsx (Route configuration)
        └── Root.tsx (Layout wrapper)
            ├── Navigation (Global)
            ├── <Outlet /> (Page content)
            ├── CookieConsent (Global banner)
            └── Footer (Global)
```

### Page Components
```
/src/app/pages/
├── Home.tsx
│   ├── Hero Section
│   ├── Interactive Carousel
│   ├── Target Audience Section
│   └── CTA Section
│
├── Characters.tsx
│   ├── Hero Section
│   ├── Character Grid (4 items)
│   └── Bottom CTA
│
├── About.tsx
│   ├── Hero Section
│   ├── Motivation Section
│   ├── Values Grid
│   ├── Framework Section
│   └── Why Nuppu Section
│
├── Contact.tsx
│   ├── Hero Section
│   ├── Contact Info Cards
│   ├── Contact Form (submits to POST /api/contact)
│   └── Bottom Links
│
├── EmotionalSupport.tsx
│   ├── Hero / pricing / provider bio
│   ├── Booking Form (name, email, optional phone)
│   ├── Paytrail checkout redirect
│   └── Success / cancelled banners (via ?payment= query param)
│
├── Privacy.tsx / Terms.tsx / Cookies.tsx
│   └── Legal content (static, i18n-driven)
│
└── NotFound.tsx
    └── 404 Error Display

/src/app/components/RouteError.tsx — router ErrorBoundary (distinct from NotFound)
```

---

## Component API

### Navigation Component
```typescript
// Location: /src/app/components/Navigation.tsx

interface NavLink {
  name: string;
  path: string;
}

// State Management:
- mobileMenuOpen: boolean (hamburger menu toggle)
- location: Location (current route)

// Features:
- Sticky positioning (top: 0)
- Mobile hamburger menu
- Active link highlighting
- Smooth transitions
- Backdrop blur effect
```

### Footer Component
```typescript
// Location: /src/app/components/Footer.tsx

// Sections:
- Brand & Description
- Quick Links (navigation)
- Contact Information (hello@nuppu.app)
- Bottom Bar (copyright — dynamic year via new Date().getFullYear(), policy links)
```

### CookieConsent Component
```typescript
// Location: /src/app/components/CookieConsent.tsx

// Records the visitor's preference in localStorage["nuppu-cookie-consent"].
// No non-essential cookies are currently set, so the banner does not yet
// gate anything — see GDPR-NOTES.md for what must be wired up if/when
// analytics is added.
```

---

## State Management

### Language State (i18n)
```typescript
// Location: /src/app/i18n/LanguageContext.tsx

type Lang = "fi" | "en";
// Default: "fi". Persisted to localStorage["nuppu-lang"].
// t(key: string): string — falls back to English, then the raw key, if missing.
// tList(key: string): string[] — same fallback behavior for arrays.
// document.documentElement.lang is kept in sync via a useEffect.
```

### Form State (Contact Page)
```typescript
interface FormData {
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'healthcare' | 'other' | '';
  message: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

// Validation Rules:
- name: required, trimmed
- email: required, regex validated
- role: required, enum validated
- message: required, max 2000 chars
```

### Form State (Emotional Support / Booking Page)
```typescript
// name (required), email (required, validated), phone (optional, SMS receipt)
// On submit: POST /api/payments/create, then redirect to the returned Paytrail URL
// Returns to /emotional-support?payment=success|cancelled
```

### Carousel State (Home Page)
```typescript
currentSlide: number (0-2)
nextSlide(): void
prevSlide(): void
setCurrentSlide(index: number): void
// Auto-play: not implemented
```

---

## Routing Configuration

### Route Structure
```typescript
// src/app/routes.tsx
{
  path: "/",
  Component: Root,
  ErrorBoundary: RouteError,
  children: [
    { index: true, Component: Home },                        // /
    { path: "characters", Component: Characters },            // /characters
    { path: "about", Component: About },                      // /about
    { path: "contact", Component: Contact },                  // /contact
    { path: "privacy", Component: Privacy },                  // /privacy
    { path: "terms", Component: Terms },                      // /terms
    { path: "cookies", Component: Cookies },                  // /cookies
    { path: "emotional-support", Component: EmotionalSupport }, // /emotional-support
    { path: "*", Component: NotFound },                       // catch-all
  ]
}
```

### Route Parameters
- No dynamic routes currently
- All routes are static, SPA routing (client-side)

---

## API Integration

### Frontend API Configuration
```typescript
// Location: /src/app/config/api.ts
// Base URL comes from VITE_API_BASE_URL, defaulting to http://localhost:5050/api in dev
```

### Backend API Endpoints

```typescript
// GET /api/health
Response: { status: 'success'; message: string; timestamp: string }

// POST /api/contact  (rate-limited)
Request: { name: string; email: string; role: string; message: string }
Response: { status: 'success' | 'error'; message: string; data?: { id: string; submittedAt: Date } }

// GET /api/contact?status=new&limit=50&page=1  (admin, x-admin-token)
// PATCH /api/contact/:id  (admin) — update status: 'new' | 'read' | 'replied'

// POST /api/payments/create  (rate-limited)
Request: { service: string; customerName: string; customerEmail: string; customerPhone?: string }
Response: { status: 'success'; data: { url: string } }  // Paytrail redirect URL

// GET /api/payments/success | GET /api/payments/cancel
// — Paytrail redirects the browser here; handler redirects on to
//   /emotional-support?payment=success|cancelled

// GET|POST /api/payments/callback
// — Paytrail server-to-server webhook, updates Payment.status

// GET /api/payments  (admin) — list, with pagination
// GET /api/payments/:id  (admin)
// PATCH /api/payments/:id  (admin)
// DELETE /api/payments/:id/personal-data  (admin) — anonymises name/email
// GET /api/payments/export?email=...  (admin) — a customer's payment history as JSON
// GET /api/payments/anonymize-expired  (cron, Authorization: Bearer <CRON_SECRET>, or admin)
//   — sweeps payments past their 6-year retention window
```

---

## Styling System

### Tailwind CSS Configuration
```css
/* Custom Theme Variables — src/styles/theme.css */
:root {
  /* Brand Colors — Honey & Eucalyptus */
  --nuppu-honey: #E8C468;
  --nuppu-eucalyptus: #A8C5BA;
  --nuppu-ivory: #FAF7F2;
  --nuppu-gold: #D4AF5E;
  --nuppu-sage: #B8D4C7;
  --nuppu-cream: #F5F0E8;

  /* System Colors */
  --primary: #A8C5BA;
  --secondary: #E8C468;
  --accent: #D4AF5E;
  --background: #FFFCF7;
  --foreground: #3A4536;

  /* Spacing */
  --radius: 0.75rem;
}
```

A parallel `.dark` block exists (OKLCH-based) but no UI toggle currently switches to it.

### Responsive Breakpoints
```css
/* Tailwind Default Breakpoints */
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Typography Scale
```css
/* Font Families */
Primary: 'Poppins', sans-serif
Secondary: 'Nunito', sans-serif

/* Font Weights */
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

---

## Animation Specifications

### Page Transitions
```typescript
// Fade in from bottom
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Slide in from left/right
initial={{ opacity: 0, x: -50 }}  // or x: 50
animate={{ opacity: 1, x: 0 }}
```

### Interactive Animations
```typescript
whileHover={{ scale: 1.05 }}   // Hover scale
whileHover={{ y: -10 }}        // Hover lift
animate={{ rotate: 360 }}      // Loading spinner
transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
```

### Carousel Transitions
```typescript
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -100 }}
transition={{ duration: 0.5 }}
```

---

## Database Schema

### ContactMessage Model
```javascript
{
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, match: /\S+@\S+\.\S+/ },
  role: { type: String, required: true, enum: ['parent', 'teacher', 'healthcare', 'other'] },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  ipAddress: String,
  createdAt: Date,   // auto
  updatedAt: Date,   // auto
}
```

### Payment Model (`src/server/models/Payment.js`)
```javascript
{
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  amountCents: Number,
  currency: String,
  status: String,               // e.g. 'pending' | 'paid' | 'cancelled'
  paytrailTransactionId: String,
  paytrailReference: String,
  paidAt: Date,
  retentionExpiresAt: Date,     // computed at creation via computeRetentionExpiry()
                                  // — assumes a calendar-year fiscal year; flagged in
                                  //   GDPR-NOTES.md as needing confirmation
  createdAt: Date,   // auto
  updatedAt: Date,   // auto
}
```

---

## Security Considerations

### Frontend Security
✅ Input validation on all form fields
✅ XSS protection (React escapes by default)
✅ HTTPS in production (via hosting)
✅ No sensitive data in client code
✅ Environment variables for API URLs

### Backend Security
✅ CORS configuration (`allowedOrigins` reads from `CLIENT_URL`)
✅ Rate limiting on `/api/contact` and `/api/payments/create`
✅ Request validation
✅ Input sanitization
✅ MongoDB injection prevention (Mongoose)
✅ HTTPS only in production
✅ Environment variables for secrets
✅ Admin routes protected by `ADMIN_TOKEN` (`x-admin-token` header)
✅ Cron endpoint protected by `CRON_SECRET` (`Authorization: Bearer`)
✅ Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) set in `vercel.json` and mirrored in `api/index.js` as a fallback
✅ Card/bank data never touches the backend — handled entirely by Paytrail's redirect checkout

### GDPR Compliance
See `GDPR-NOTES.md` for the full Article 30 processing record. Summary:
✅ Privacy policy links
✅ Minimal data collection (no card/bank data ever stored)
✅ 6-year retention for payment records (Kirjanpitolaki), then anonymisation via daily cron
✅ Data subject rights implemented (access/rectify/erase/export), currently admin-token-mediated only
⚠️ Open items: confirm MongoDB Atlas cluster is EU-region, sign DPAs with processors, confirm fiscal-year assumption in `computeRetentionExpiry()`

---

## Performance Optimization

### Frontend Optimizations
- ✅ Code splitting via React Router
- ✅ Local image assets (no external CDN dependency)
- ✅ Tree shaking (Vite)
- ✅ CSS purging (Tailwind)

### Backend Optimizations
- Connection pooling (Mongoose)
- Rate limiting on public-facing write endpoints
- Gzip compression (recommended if not already handled by Vercel's edge)

---

## Testing Strategy

**Current state: no automated tests exist in this repo.** The following is a recommended structure, not implemented work.

### Unit Testing (Recommended)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

/src/app/__tests__/
├── components/
│   ├── Navigation.test.tsx
│   └── Footer.test.tsx
└── pages/
    ├── Home.test.tsx
    └── Contact.test.tsx
```

### Integration / E2E Testing (Recommended)
- Contact form submission flow (against a real or mocked `/api/contact`)
- Paytrail booking flow (create → redirect → callback → success/cancel banner)
- Navigation and mobile menu across pages
- Language switching persists and updates all page content
- 404 page and router error boundary

---

## Build & Deployment

### Build Process
```bash
npm run dev     # Vite dev server, http://localhost:5173
npm run build   # Creates /dist
npm run server  # Runs the backend locally (node api/index.js)
npm run lint
npm run typecheck
```

### Environment Variables
See `.env.example` for the authoritative, fully-commented list. Summary:
```bash
# Server
PORT=5050
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/nuppu
MONGODB_REQUIRED=false

# Admin / cron auth
ADMIN_TOKEN=
CRON_SECRET=

# Email
NUPPU_EMAIL=hello@nuppu.app
MAIL_FROM=noreply@nuppu.app
SMTP_HOST= / SMTP_PORT=587 / SMTP_SECURE=false / SMTP_USER= / SMTP_PASS=

# SMS (Twilio)
TWILIO_ACCOUNT_SID= / TWILIO_AUTH_TOKEN= / TWILIO_FROM_NUMBER=

# Paytrail
PAYTRAIL_MERCHANT_ID= / PAYTRAIL_SECRET_KEY= / PAYTRAIL_API_BASE_URL=
# (leave unset to use Paytrail's published test merchant)

# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:5050/api
```

Production deployment is a single Vercel project (frontend + `api/index.js` as a serverless function) — see `DEPLOYMENT.md` for the full walkthrough, including DNS, MongoDB Atlas, Paytrail onboarding, and the retention cron.

---

## Browser Support

### Supported Browsers
- ✅ Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+
- ✅ Mobile Safari (iOS 14+) / Chrome Mobile (Android 90+)

### Polyfills
Not required — modern browsers only.

---

## Monitoring & Analytics

### Recommended Tools (not yet integrated)
- **Frontend:** Vercel Analytics, or Plausible (must respect cookie consent per `GDPR-NOTES.md`)
- **Backend:** MongoDB Atlas monitoring, Vercel function logs
- **Errors:** Sentry
- **Uptime:** UptimeRobot

---

## Development Workflow

```bash
1. git clone <repo>
2. npm install
3. cp .env.example .env   # fill in values as needed
4. npm run dev             # frontend
5. npm run server           # backend, in a second terminal
6. Open http://localhost:5173
```

---

## Open Items / Known Gaps

- No automated tests (unit, integration, or E2E)
- No CI/CD pipeline
- No error monitoring (e.g. Sentry) wired up
- Final production domain not yet confirmed (`.fi` vs `.app` — see `DEPLOYMENT.md`)
- Paytrail running on test credentials until a real merchant agreement is signed
- SMTP provider not yet chosen/configured

---

## Support

For technical issues:
- Email: hello@nuppu.app
- Documentation: See `/README.md`, `/DEPLOYMENT.md`, `/GDPR-NOTES.md`

---

Built with modern web technologies for optimal performance and maintainability.

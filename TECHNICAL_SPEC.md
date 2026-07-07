# 🔧 Technical Specification - Nuppu Website

## System Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────┐
│         Browser (Client-Side)           │
├─────────────────────────────────────────┤
│  React 18.3 + TypeScript                │
│  React Router 7.13 (BrowserRouter)      │
│  Tailwind CSS 4.1 (Styling)             │
│  Motion (Animations)                    │
└─────────────────────────────────────────┘
```

### Backend Architecture (Reference)
```
┌─────────────────────────────────────────┐
│      Node.js + Express Server           │
├─────────────────────────────────────────┤
│  Mongoose ODM                           │
│  MongoDB Database (Atlas)               │
│  CORS Middleware                        │
│  JSON Body Parser                       │
└─────────────────────────────────────────┘
```

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose | Size |
|---------|---------|---------|------|
| react | 18.3.1 | UI Library | Core |
| react-router | 7.13.0 | Routing | 15kb |
| motion | 12.23.24 | Animations | 35kb |
| lucide-react | 0.487.0 | Icons | 2kb |
| tailwindcss | 4.1.12 | Styling | Build-time |

### Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| vite | 6.3.5 | Build tool & dev server |
| typescript | Latest | Type checking |
| @vitejs/plugin-react | 4.7.0 | React support for Vite |
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
│   ├── Contact Form (with validation)
│   └── Bottom Links
│
└── NotFound.tsx
    └── 404 Error Display
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
- Contact Information
- Social Icons (placeholders)
- Bottom Bar (copyright, policies)

// Features:
- Responsive grid layout
- Hover effects
- Icon integrations
```

---

## State Management

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

### Carousel State (Home Page)
```typescript
// Current slide index
currentSlide: number (0-2)

// Controls:
- nextSlide(): void
- prevSlide(): void
- setCurrentSlide(index: number): void

// Auto-play: Not implemented (can be added)
```

---

## Routing Configuration

### Route Structure
```typescript
{
  path: "/",
  Component: Root,
  children: [
    { index: true, Component: Home },              // /
    { path: "characters", Component: Characters }, // /characters
    { path: "about", Component: About },          // /about
    { path: "contact", Component: Contact },      // /contact
    { path: "*", Component: NotFound },           // catch-all
  ]
}
```

### Route Parameters
- No dynamic routes currently
- All routes are static
- SPA routing (client-side)

---

## API Integration

### Frontend API Configuration
```typescript
// Location: /src/app/config/api.ts

export const API_BASE_URL = 
  import.meta.env.MODE === 'production'
    ? 'https://your-backend-url.com/api'
    : 'http://localhost:5000/api';

// Helper Function:
apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T>

// Contact API:
contactAPI.submit(data: ContactFormData): Promise<Response>
```

### Backend API Endpoints
```typescript
// POST /api/contact
Request: {
  name: string;
  email: string;
  role: string;
  message: string;
}
Response: {
  status: 'success' | 'error';
  message: string;
  data?: { id: string; submittedAt: Date };
}

// GET /api/contact?status=new&limit=50&page=1
Response: {
  status: 'success';
  data: {
    messages: ContactMessage[];
    pagination: { total, page, limit, totalPages };
  };
}

// PATCH /api/contact/:id
Request: {
  status: 'new' | 'read' | 'replied';
}
Response: {
  status: 'success';
  data: ContactMessage;
}

// GET /api/health
Response: {
  status: 'success';
  message: string;
  timestamp: string;
}
```

---

## Styling System

### Tailwind CSS Configuration
```css
/* Custom Theme Variables */
:root {
  /* Brand Colors */
  --nuppu-blue: #A8D5E2;
  --nuppu-yellow: #F9E5A8;
  --nuppu-green: #B8DDB8;
  --nuppu-peach: #FFD4C4;
  --nuppu-lavender: #D4C5F9;
  --nuppu-mint: #C9EDE1;
  
  /* System Colors */
  --primary: #6B9AC4;
  --secondary: #F9E5A8;
  --accent: #B8DDB8;
  --background: #FDFCF9;
  --foreground: #2D3748;
  
  /* Spacing */
  --radius: 0.75rem;
}
```

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
Light: 300
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

// Slide in from left
initial={{ opacity: 0, x: -50 }}
animate={{ opacity: 1, x: 0 }}

// Slide in from right
initial={{ opacity: 0, x: 50 }}
animate={{ opacity: 1, x: 0 }}
```

### Interactive Animations
```typescript
// Hover scale
whileHover={{ scale: 1.05 }}

// Hover lift
whileHover={{ y: -10 }}

// Loading spinner
animate={{ rotate: 360 }}
transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
```

### Carousel Transitions
```typescript
// Slide animation
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
  // Required Fields
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /\S+@\S+\.\S+/
  },
  role: {
    type: String,
    required: true,
    enum: ['parent', 'teacher', 'healthcare', 'other']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Optional Fields
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  ipAddress: String,
  
  // Timestamps (auto)
  createdAt: Date,
  updatedAt: Date
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
✅ CORS configuration  
✅ Request validation  
✅ Rate limiting (recommended)  
✅ Input sanitization  
✅ MongoDB injection prevention (Mongoose)  
✅ HTTPS only in production  
✅ Environment variables for secrets  

### GDPR Compliance
✅ Privacy policy links  
✅ Minimal data collection  
✅ User consent mechanisms  
✅ Data encryption at rest (MongoDB)  
✅ Data deletion capabilities  

---

## Performance Optimization

### Frontend Optimizations
- ✅ Code splitting via React Router
- ✅ Image optimization (Unsplash CDN)
- ✅ Lazy loading with viewport observers
- ✅ Minimal bundle size (~200kb gzipped)
- ✅ Tree shaking (Vite)
- ✅ CSS purging (Tailwind)

### Backend Optimizations
- ✅ Database indexing (email, createdAt)
- ✅ Request caching (can be added)
- ✅ Gzip compression
- ✅ Connection pooling (Mongoose)

---

## Testing Strategy

### Unit Testing (Recommended)
```bash
# Install testing libraries
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Test structure
/src/app/__tests__/
├── components/
│   ├── Navigation.test.tsx
│   └── Footer.test.tsx
└── pages/
    ├── Home.test.tsx
    └── Contact.test.tsx
```

### Integration Testing
- Test form submission flow
- Test navigation between pages
- Test responsive layouts

### E2E Testing (Recommended)
```bash
# Install Playwright or Cypress
npm install --save-dev @playwright/test

# Test scenarios
- Homepage loads correctly
- Navigation works on all pages
- Form submission succeeds
- Mobile menu functions
- 404 page displays
```

---

## Build & Deployment

### Build Process
```bash
# Development
npm run dev  # Starts Vite dev server on port 5173

# Production Build
npm run build  # Creates /dist folder

# Build Output
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images]
└── favicon.ico
```

### Environment Variables
```bash
# Frontend (.env)
VITE_API_BASE_URL=https://api.nuppu.app

# Backend (.env)
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=production
CLIENT_URL=https://nuppu.app
```

---

## Browser Support

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 90+)

### Polyfills
Not required - Modern browsers only

---

## Monitoring & Analytics

### Recommended Tools
- **Frontend:** Vercel Analytics, Google Analytics
- **Backend:** Railway metrics, MongoDB Atlas monitoring
- **Errors:** Sentry
- **Uptime:** UptimeRobot

---

## Development Workflow

### Local Development
```bash
1. git clone <repo>
2. npm install
3. npm run dev
4. Open http://localhost:5173
```

### Making Changes
```bash
1. Create feature branch
2. Make changes
3. Test locally
4. Commit changes
5. Push to GitHub
6. Deploy (auto-deploys on Vercel)
```

---

## API Rate Limiting (Recommended)

### Express Rate Limit
```javascript
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many requests, please try again later.'
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  // ... handler code
});
```

---

## Future Enhancements

### Phase 1
- [ ] Add unit tests
- [ ] Set up CI/CD pipeline
- [ ] Add error monitoring (Sentry)
- [ ] Implement email notifications

### Phase 2
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Blog/CMS integration
- [ ] Multi-language support

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] User profiles
- [ ] Analytics dashboard

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-26 | Initial release |

---

## Support

For technical issues:
- GitHub Issues: [repo-url]
- Email: dev@nuppu.app
- Documentation: See `/README.md`

---

Built with modern web technologies for optimal performance and maintainability.

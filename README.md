# Nuppu - Children's Emotional Learning App

A safe, ad-free, GDPR-compliant digital platform for children's emotional learning and mindfulness.

## 🌟 Project Overview

Nuppu is a premium web application designed to help children develop emotional intelligence, mindfulness, and self-regulation skills through:
- Personalized stories with friendly characters
- Interactive emotional exercises
- Parent micro-support tips
- Classroom and healthcare integration

## 🎨 Design Philosophy

- **Warm & Child-Friendly**: Soft pastel colors (blues, yellows, greens)
- **Trustworthy**: Built for parents, teachers, and healthcare professionals
- **Safe**: GDPR-compliant, ad-free, psychologically sound

## 🚀 Tech Stack

### Frontend
- **React 18.3** (Functional components, Hooks)
- **React Router 7.13** (Multi-page architecture)
- **Tailwind CSS 4.1** (Modern styling, mobile-first)
- **Motion (Framer Motion)** (Animations & transitions)
- **TypeScript** (Type safety)

### Backend (Reference Implementation)
- **Node.js** with Express
- **MongoDB** with Mongoose
- **CORS** enabled
- **RESTful API**

## 📁 Project Structure

```
/src
  /app
    /components
      - Navigation.tsx (Sticky nav with mobile menu)
      - Footer.tsx (Global footer)
         /media
            - ImageWithFallback.tsx (Image component)
      /ui (Reusable UI components)
    /pages
      - Home.tsx (Hero, Why Nuppu carousel, Target audiences)
      - Characters.tsx (4 Nuppu characters showcase)
      - About.tsx (Mission, values, frameworks)
      - Contact.tsx (Contact form with validation)
      - NotFound.tsx (404 page)
    - App.tsx (Router provider)
    - Root.tsx (Layout wrapper)
    - routes.tsx (Route configuration)
  /styles
    - fonts.css (Google Fonts: Poppins, Nunito)
    - theme.css (Custom color palette)
    - tailwind.css
    - index.css

/server.js (Backend API - Node.js/Express/MongoDB)
/.env.example (Environment variables template)
```

## 🎭 Characters

1. **Hippu Cat** - Curious and observant
2. **Lumo Fox** - Clever and guiding
3. **Muru Bear** - Warm, comforting, grounded
4. **Nuppu Bunny** - Energetic, learning balance

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

4. **Configure Frontend API URL**
   - Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL` to your backend API URL

### Backend Setup (Optional)

The backend is provided as a reference implementation. To run it:

1. **Install Backend Dependencies**
   ```bash
   npm install express mongoose cors dotenv
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string

3. **Run Backend Server**
   ```bash
   node server.js
   ```

4. **API Endpoints**
   - `POST /api/contact` - Submit contact form
   - `GET /api/contact` - Get all messages (admin)
   - `PATCH /api/contact/:id` - Update message status
   - `GET /api/health` - Health check

## 📱 Pages & Features

### Home Page (`/`)
- Hero section with CTA
- Interactive "Why Nuppu" carousel
- Target audience section (Parents, Teachers, Healthcare)
- Bottom CTA

### Characters Page (`/characters`)
- Grid showcase of 4 characters
- Hover animations
- Character personalities & emotions

### About Page (`/about`)
- Mission statement
- Core values
- Psychological frameworks
- Privacy & security commitment

### Contact Page (`/contact`)
- Contact form with validation
- Email & phone info cards
- Loading & success states
- Form submission to backend API

## 🎨 Color Palette

```css
--nuppu-blue: #A8D5E2;
--nuppu-yellow: #F9E5A8;
--nuppu-green: #B8DDB8;
--nuppu-peach: #FFD4C4;
--nuppu-lavender: #D4C5F9;
--nuppu-mint: #C9EDE1;
--primary: #6B9AC4;
```

## 🔒 Security & Privacy

- GDPR-compliant
- No advertisements
- Secure data handling
- Age-appropriate content boundaries
- Encrypted database storage

## 🌐 Deployment

### Frontend Deployment
- Deploy to Vercel, Netlify, or any static hosting
- Build command: `npm run build`
- Output directory: `dist`
- Required env: `VITE_API_BASE_URL`

### Backend Deployment
- Deploy to Heroku, Railway, Render, or AWS
- Set environment variables
- Connect to MongoDB Atlas

## 📝 Database Schema

### ContactMessage Model
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

## 🎯 Key Features

✅ Multi-page architecture with React Router  
✅ Responsive design (mobile, tablet, desktop)  
✅ Smooth animations with Motion  
✅ Interactive carousel  
✅ Form validation & error handling  
✅ Loading states & feedback  
✅ Accessible (ARIA labels, semantic HTML)  
✅ SEO-friendly  
✅ Production-focused launch hardening  

## ✅ Pre-Launch Checklist

- Set `VITE_API_BASE_URL` in frontend hosting environment
- Set backend `CLIENT_URL`, `MONGODB_URI`, and `ADMIN_TOKEN`
- Verify legal pages (`/privacy`, `/terms`, `/cookies`) in production
- Submit a real contact form entry and verify DB persistence
- Confirm social preview image and metadata render correctly

## 📧 Contact

- **Email**: hello@nuppu.app
- **Website**: [Visit Nuppu](#)

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ for children's emotional wellbeing.

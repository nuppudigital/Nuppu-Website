# ⚡ Quick Start Guide - Nuppu Website

## 🎯 Get Running in 60 Seconds

### Step 1: View the Website
The website is already built and ready to use! Just click the preview button to see it live.

### Step 2: Navigate the Site
- **Home (/)** - Main landing page with hero and carousel
- **Characters (/characters)** - Meet the 4 Nuppu friends
- **About (/about)** - Learn about our mission
- **Contact (/contact)** - Get in touch form

---

## 📂 Project Files Overview

### Main Pages
```
/src/app/pages/
├── Home.tsx          ← Landing page
├── Characters.tsx    ← Character showcase
├── About.tsx         ← About page
├── Contact.tsx       ← Contact form
└── NotFound.tsx      ← 404 page
```

### Components
```
/src/app/components/
├── Navigation.tsx    ← Sticky nav (desktop + mobile)
└── Footer.tsx        ← Global footer
```

### Configuration
```
/src/app/
├── App.tsx           ← Router setup
├── Root.tsx          ← Layout wrapper
└── routes.tsx        ← Route configuration
```

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `/src/styles/theme.css`:
```css
:root {
  --nuppu-blue: #A8D5E2;     ← Change this
  --nuppu-yellow: #F9E5A8;   ← Change this
  --primary: #6B9AC4;        ← Change this
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
Replace Unsplash URLs in page components with your own images using ImageWithFallback component.

### Change Text Content
Edit the page files directly:
- `/src/app/pages/Home.tsx` - Hero text, carousel content
- `/src/app/pages/Characters.tsx` - Character descriptions
- `/src/app/pages/About.tsx` - Mission statement
- `/src/app/pages/Contact.tsx` - Contact info

---

## 🚀 Deploy to Production

### Option 1: Vercel (Easiest)
1. Push code to GitHub
2. Connect repo to Vercel
3. Deploy! ✅

### Option 2: Netlify
1. Push code to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy! ✅

**See `/DEPLOYMENT.md` for detailed deployment instructions.**

---

## 🔌 Connect Backend (Optional)

### Current State
✅ Contact form submits to real backend API

### To Enable Real Backend
1. Deploy `/server.js` to Railway/Render/Heroku
2. Set up MongoDB Atlas database
3. Add frontend environment variable `VITE_API_BASE_URL` in your deployment settings
4. Ensure backend allows your frontend domain with `CLIENT_URL`

**See `/DEPLOYMENT.md` for complete backend setup.**

---

## 📱 Test Responsive Design

### Desktop (1920px+)
- Full navigation bar
- Multi-column layouts
- Large images and text

### Tablet (768px - 1024px)
- Adjusted layouts
- Readable text sizes
- Touch-friendly buttons

### Mobile (< 768px)
- Hamburger menu
- Single column layouts
- Optimized for touch

**Tip:** Use browser DevTools to test different screen sizes!

---

## ✅ What's Included

### Pages
- ✅ Home page with hero & carousel
- ✅ Characters page with 4 characters
- ✅ About page with mission & values
- ✅ Contact page with working form
- ✅ 404 error page

### Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations
- ✅ Form validation
- ✅ Mobile menu
- ✅ SEO-friendly
- ✅ Accessible (ARIA labels)
- ✅ Production-ready code

### Backend (Reference)
- ✅ Node.js + Express server (`/server.js`)
- ✅ MongoDB schema
- ✅ API endpoints
- ✅ CORS enabled
- ✅ Error handling

---

## 🎯 Common Tasks

### Add a New Page
1. Create file: `/src/app/pages/NewPage.tsx`
2. Add route in `/src/app/routes.tsx`:
   ```typescript
   { path: "newpage", Component: NewPage }
   ```
3. Add nav link in `/src/app/components/Navigation.tsx`

### Change Logo
Edit the Navigation.tsx file and replace the logo div with your image.

### Update Contact Email
1. Edit `/src/app/components/Footer.tsx`
2. Edit `/src/app/pages/Contact.tsx`
3. Change `hello@nuppu.app` to your email

### Add More Characters
Edit `/src/app/pages/Characters.tsx` and add to the `characters` array.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `/README.md` | Project overview & setup |
| `/DEPLOYMENT.md` | Deployment instructions |
| `/PROJECT_OVERVIEW.md` | Complete project details |
| `/QUICK_START.md` | This file - quick reference |

---

## 🆘 Need Help?

### Check These Files First
1. `/README.md` - General information
2. `/DEPLOYMENT.md` - Deployment help
3. `/PROJECT_OVERVIEW.md` - Detailed overview

### Common Issues

**Issue:** Navigation not working  
**Fix:** Make sure you're using React Router correctly

**Issue:** Styles not loading  
**Fix:** Check Tailwind CSS is properly configured

**Issue:** Images not showing  
**Fix:** Verify Unsplash URLs or use ImageWithFallback component

**Issue:** Form not submitting  
**Fix:** Check console for errors, ensure backend is deployed (if using real API)

---

## 🎉 You're Ready!

The Nuppu website is **launch-ready after environment setup**. You can:

✅ Preview it now  
✅ Customize the content  
✅ Deploy to production  
✅ Connect a backend (optional)  
✅ Add more features  

**Everything you need is in this project!**

---

Built with ❤️ for children's emotional wellbeing  
Contact: hello@nuppu.app

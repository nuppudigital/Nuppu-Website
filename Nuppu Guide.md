# Nuppu Guide

A complete, line-by-line onboarding document for the Nuppu codebase. This is written so you
can go from "I've never seen this repo" to "I can maintain, modify, and deploy it" by reading
top to bottom, in order.

**How this document is organized:** Each chapter builds on the last — read them in sequence
the first time. Purely decorative/repetitive JSX (marketing copy sections that just repeat the
same `<motion.div><h2>...</h2><p>...</p></motion.div>` pattern with different text) is explained
**once in full**, then later occurrences are pointed back at that explanation instead of being
re-narrated line-by-line — narrating "this div has padding" fifty times teaches you nothing the
first explanation didn't. Every line that contains actual *logic* (state, conditionals, data
transforms, API calls, security checks) is covered individually, everywhere it appears.

---

## Table of Contents

0. [Prerequisite Concepts](#0-prerequisite-concepts) — the vocabulary you need before any of this makes sense
1. [Project Bootstrapping](#1-project-bootstrapping) — package.json, index.html, main.tsx, configs
2. [App Shell & Routing](#2-app-shell--routing) — App.tsx, Root.tsx, routes.tsx, RouteError.tsx
3. [Internationalization (i18n)](#3-internationalization-i18n) — LanguageContext.tsx, en.json/fi.json
4. [Shared Components](#4-shared-components) — Navigation, Footer, CookieConsent, ui/, hooks/
5. [Pages](#5-pages) — every route, one section each
6. [Frontend → Backend Bridge](#6-frontend--backend-bridge) — config/api.ts
7. [The Backend — api/index.js](#7-the-backend--apiindexjs) — every route, every middleware
8. [Domain Logic](#8-domain-logic) — Payment.js, paytrailClient.js
9. [Styling System](#9-styling-system) — theme.css, tailwind.css, fonts.css
10. [Build, Config & Deployment Files](#10-build-config--deployment-files) — vercel.json, .env.example
11. [Compliance Documents](#11-compliance-documents) — GDPR-NOTES.md, ATTRIBUTIONS.md
12. [The Two Side Projects](#12-the-two-side-projects) — admin-dashboard/, app-prototype/
13. [Suggested Learning Sequence](#13-suggested-learning-sequence) — the order to actually study this in
14. [Common Maintenance Tasks](#14-common-maintenance-tasks) — "how do I...?"
15. [Troubleshooting](#15-troubleshooting)

---

## 0. Prerequisite Concepts

Read this chapter first if any of these words are unfamiliar. Skip anything you already know.

**React** — a JavaScript library for building UI out of *components* (functions that return
markup-like syntax called JSX). A component re-runs its function body every time its state or
props change, and React efficiently updates only the parts of the real DOM that changed.

**JSX** — the `<div className="...">{someVariable}</div>` syntax inside `.tsx` files. It looks
like HTML but is actually JavaScript — `{curlyBraces}` drop back into real JS expressions.
`className` is used instead of `class` because `class` is a reserved JS word.

**Hooks** — functions starting with `use` that let a plain function component have state and
side effects:
- `useState(initial)` → returns `[value, setValue]`. Calling `setValue` schedules a re-render.
- `useEffect(fn, deps)` → runs `fn` after render, and again whenever any value in the `deps`
  array changes. An empty array `[]` means "run once, on mount." Returning a function from `fn`
  cleans up (e.g. clears a timer) before the effect re-runs or the component unmounts.
- `useContext(SomeContext)` → reads a value provided higher up the tree by
  `<SomeContext.Provider value={...}>`, without prop-drilling it through every level.

**TypeScript** — JavaScript with optional type annotations (`: string`, `: Payment[]`, interfaces).
It's checked at build time (`tsc`), never at runtime — types disappear entirely once compiled to
JS. This repo uses `strict: true` (see [tsconfig.json](tsconfig.json)), meaning `null`/`undefined`
must be handled explicitly.

**Vite** — the build tool/dev server. In development it serves your source files directly with
near-instant hot reload; for production (`vite build`) it bundles everything into optimized static
files in `dist/`.

**React Router (v7), `createBrowserRouter`** — maps URL paths to components. Instead of the
older `<Routes><Route path="..."/></Routes>` JSX style, this repo uses the newer **data router**
config style: an array of route objects passed to `createBrowserRouter()`, each with a `path` and
a `Component`. `<Outlet/>` is where a parent route renders whichever child route matched.

**Tailwind CSS** — instead of writing custom CSS classes, you compose utility classes directly in
JSX: `className="px-4 py-2 bg-blue-500 rounded-full"` means padding-x, padding-y, background color,
border-radius. No separate `.css` file per component.

**Express** — a minimal Node.js web framework. You define routes (`app.get("/path", handler)`)
and chain *middleware* — functions that run before the route handler and can inspect/modify the
request, reject it, or call `next()` to continue.

**MongoDB / Mongoose** — MongoDB is a NoSQL document database (stores JSON-like objects, not
rows/tables). Mongoose is a schema layer on top: you define a `Schema` (field names, types,
validation rules), turn it into a `Model` (`mongoose.model("Name", schema)`), and use that model
to create/query/update documents.

**REST API basics** — `GET` reads, `POST` creates, `PATCH` partially updates, `DELETE` removes.
Status codes: `2xx` success, `4xx` the client's fault (bad input, unauthorized), `5xx` the
server's fault.

**Environment variables (`process.env.X` / `import.meta.env.X`)** — configuration (API keys,
database URLs, secrets) that's injected at runtime/build time rather than hardcoded, so the same
code behaves differently in development vs. production. Backend code reads `process.env.X`;
frontend code reads `import.meta.env.X`, and **only** variables prefixed `VITE_` are exposed to
the frontend bundle (this is a Vite security feature — it prevents accidentally shipping a
secret to the browser).

**HMAC signing / webhooks** — a way for two servers to prove a message wasn't tampered with in
transit, without a full login system. Both sides share a secret key; the sender computes a hash
of the message + secret and attaches it; the receiver recomputes the same hash and checks it
matches. A *webhook* is when an external service (here, Paytrail) calls **your** server to notify
it of an event (a payment completing) — the HMAC signature is how you know the call is genuinely
from Paytrail and not forged by a random visitor guessing the URL.

**GDPR essentials used in this repo** — "legal basis" (why you're allowed to process someone's
data), "retention" (how long you keep it), "data minimisation" (collect only what's needed),
"right to erasure/access/portability" (a person can ask to see, delete, or export their data).
See [GDPR-NOTES.md](GDPR-NOTES.md) for how this repo actually implements these.

---

## 1. Project Bootstrapping

This chapter covers the files that exist before a single line of "app" code runs — how the
project is configured to build and start.

### [package.json](package.json)

```json
"scripts": {
  "build": "npm run build:admin && vite build",
  "dev": "npm run build:admin && vite",
  "vercel-build": "npm run build:admin && vite build",
  "build:admin": "cd admin-dashboard && npm install && npm run build && rm -rf ../public/admin && cp -r dist ../public/admin",
  "lint": "eslint .",
  "server": "node api/index.js",
  "typecheck": "tsc --noEmit"
}
```

- `build:admin` — this is the interesting one. It steps into `admin-dashboard/` (a completely
  separate Vite project), installs *its* dependencies, builds *it*, deletes any old copy at
  `public/admin`, and copies the fresh build there. `public/` is served statically by Vite/Vercel,
  so this is how the admin UI ends up reachable at `your-domain/admin` even though it's not part
  of the main React app or its router.
- `build` and `dev` both run `build:admin` first — meaning **every time you run `npm run dev`**,
  the admin dashboard gets rebuilt too. This is why first startup is slower than you'd expect for
  "just start a dev server."
- `server` runs the Express API directly with plain Node (`node api/index.js`) — this is how you
  run the backend locally, in a second terminal, separate from the Vite frontend dev server.
- `typecheck` runs the TypeScript compiler in `--noEmit` mode — it only checks for type errors,
  produces no output files. Useful to run before committing.

```json
"dependencies": { ... },
"devDependencies": { ... }
```
`dependencies` are needed at runtime (React itself, Express, Mongoose, etc. — note Express and
Mongoose are listed here even though they're "backend" packages, because the backend is bundled
alongside the frontend for Vercel). `devDependencies` are only needed while building/developing
(TypeScript, ESLint, Vite itself, the React Vite plugin) — they're not shipped to production.

### [index.html](index.html)

This is the one real HTML file in the whole app — Vite injects your built JS/CSS into it.

```html
<title>Nuppu | Emotional Learning for Children</title>
<meta name="description" content="..." />
<meta property="og:url" content="%VITE_SITE_URL%/" />
```
`%VITE_SITE_URL%` is a Vite placeholder — at build time, Vite substitutes any `%VITE_*%` token in
`index.html` with the matching environment variable. This is how the Open Graph/Twitter card URLs
end up pointing at the real production domain without hardcoding it.

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```
`#root` is an empty div — React will inject the entire app into it. The `<script type="module">`
loads [src/main.tsx](src/main.tsx), the actual entry point.

### [src/main.tsx](src/main.tsx)

```tsx
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```
Line by line:
- `createRoot(...)` — React 18's API for mounting an app into a real DOM node.
- `document.getElementById("root")!` — finds that empty `<div id="root">` from index.html. The
  `!` is a TypeScript "trust me, this isn't null" assertion — normally `getElementById` can return
  `null`, but we know this specific div always exists because it's hardcoded in index.html.
- `import "./styles/index.css"` — a **side-effect import**: it doesn't bind a name, it just makes
  sure the global stylesheet (which itself `@import`s Tailwind, theme variables, fonts) is loaded
  before anything renders.
- `.render(<App/>)` — mounts the top-level `<App/>` component (next chapter) into that div. This
  single line is the entire bridge between the static HTML and the whole React application.

### [vite.config.ts](vite.config.ts)

```ts
function adminFallback(): Plugin {
  return {
    name: 'admin-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/admin')) {
          const pathname = req.url.split('?')[0];
          const lastSegment = pathname.split('/').pop() ?? '';
          if (!lastSegment.includes('.')) {
            req.url = '/admin/index.html';
          }
        }
        next();
      });
    },
  };
}
```
This is a **custom Vite plugin**, written inline. Problem it solves: Vite's dev server, for a
Single Page App, normally rewrites any unknown extensionless path to `/index.html` (so client-side
routing works on refresh). Without this plugin, visiting `/admin` in dev would get *this* app's
`index.html`, not the admin dashboard's. The fix: intercept any request whose path starts with
`/admin`, and if the last URL segment has no `.` in it (meaning it's not literally requesting a
file like `assets/app.js`), rewrite the request to `/admin/index.html` explicitly. This only
matters in development — in production, Vercel's [vercel.json](vercel.json) rewrites handle it.

```ts
export default defineConfig({
  plugins: [adminFallback(), react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    outDir: 'dist',
    rollupOptions: { input: { main: path.resolve(__dirname, 'index.html') } },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5050', changeOrigin: true, secure: false },
    },
  },
})
```
- `plugins` — registers our custom plugin, the React plugin (JSX transform, fast refresh), and
  the Tailwind Vite plugin (processes `@import 'tailwindcss'` in CSS).
- `resolve.alias '@'` → `./src` — this is why you see imports like `@/app/components/ui/card`
  instead of long `../../../` relative paths.
- `server.proxy '/api'` — **only active in `npm run dev`**. Any frontend `fetch("/api/...")` gets
  transparently forwarded to `http://localhost:5050` (your locally-running Express server from
  `npm run server`), so you don't hit CORS issues in local development even though frontend and
  backend are two separate processes on two separate ports.

### [tsconfig.json](tsconfig.json)

```json
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true,
"paths": { "@/*": ["./src/*"] }
```
`strict` turns on the full set of TypeScript's safety checks (no implicit `any`, null-checking,
etc.) — this is why you'll see `error instanceof Error ? error.message : ...` patterns throughout
the code instead of just `error.message` (in strict mode, a caught error's type is `unknown`, not
`Error`, so you must narrow it first). `paths` mirrors the Vite alias above so the TypeScript
language server and Vite agree on what `@/...` means.

### [eslint.config.js](eslint.config.js)

```js
{ ignores: ['dist', 'node_modules', 'admin-dashboard', 'app-prototype'] },
```
The root ESLint config explicitly **does not lint** the two side projects — they have their own
tooling. This is a signal (confirmed by the README) that they're separate, independently-managed
codebases that happen to live in this repo.

---

## 2. App Shell & Routing

### [src/app/App.tsx](src/app/App.tsx)

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { LanguageProvider } from './i18n/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
```
The entire app in four lines. `LanguageProvider` wraps everything so **every** component in the
tree can call `useLanguage()` (Chapter 3). `RouterProvider` takes the route table built in
`routes.tsx` and actually renders whichever route matches the current URL. Order matters here:
`LanguageProvider` is the outer wrapper specifically so that routed pages (rendered inside
`RouterProvider`) can access the language context — if it were inverted, pages wouldn't be able to
call `useLanguage()`.

### [src/app/routes.tsx](src/app/routes.tsx)

```tsx
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: Home },
      { path: "characters", Component: Characters },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
      { path: "cookies", Component: Cookies },
      { path: "emotional-support", Component: EmotionalSupport },
      { path: "*", Component: NotFound },
    ],
  },
]);
```
One route object, with children. `path: "/"` + `Component: Root` means **every** URL first
renders `Root` (the layout shell below), and then the matching child renders inside `Root`'s
`<Outlet/>`. `{ index: true, Component: Home }` is the child that matches exactly `/` (React
Router's way of saying "this is the default child route"). `{ path: "*", Component: NotFound }`
is a catch-all — it matches any path not matched above, which is how the 404 page works.
`ErrorBoundary: RouteError` means if *any* component under this route throws during render, React
Router shows `RouteError` instead of crashing to a blank white screen.

### [src/app/Root.tsx](src/app/Root.tsx)

```tsx
export default function Root() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
```
`useLocation()` gives the current URL info; the `useEffect` depends on `location.pathname`, so
**every time the route changes**, it scrolls the window back to the top — without this, navigating
from the bottom of a long page to a new page would leave you scrolled down on the new page too.
The JSX is the site's permanent layout skeleton: `Navigation` and `Footer` render on every page,
`<Outlet/>` is where the routed page content (Home, Contact, etc.) actually appears, and
`CookieConsent` is a floating banner that renders on top regardless of route (it manages its own
visibility internally — see Chapter 4).

### [src/app/components/RouteError.tsx](src/app/components/RouteError.tsx)

```tsx
export default function RouteError() {
  const error = useRouteError();
  const { lang } = useLanguage();

  if (import.meta.env.DEV) {
    console.error("Route error boundary caught:", error);
  }

  const is404 = isRouteErrorResponse(error) && error.status === 404;
```
`useRouteError()` is React Router's hook for reading whatever was thrown inside this boundary.
`import.meta.env.DEV` is `true` only in development builds — so errors are logged to the console
locally but silently swallowed (from the console's perspective) in production, avoiding leaking
stack traces to end users. `isRouteErrorResponse(error) && error.status === 404` distinguishes "a
route genuinely wasn't found" (handled specially, matching text) from "some other component threw
an unexpected error" (generic message).

```tsx
const copy = lang === "fi" ? { ... fi text ... } : { ... en text ... };
```
Notice this component does **not** use the `t()` translation function — it hardcodes both
languages inline instead. This is a deliberate exception: if `LanguageProvider` itself ever failed
to initialize, `useLanguage()` would throw, which would defeat the purpose of an error boundary
whose entire job is to catch failures. Keeping this component's text self-contained means it can
never fail because of the very system it's meant to be a safety net for.

The rest of the component (buttons for "reload" / "go home") is plain JSX with no further logic —
`window.location.reload()` does a full hard reload; the "go home" link is a plain `<a href="/">`
(not a router `Link`) so it works even if the router itself is in a broken state.

---

## 3. Internationalization (i18n)

### [src/app/i18n/LanguageContext.tsx](src/app/i18n/LanguageContext.tsx) — full walkthrough

```tsx
import fi from "./fi.json";
import en from "./en.json";

export type Lang = "fi" | "en";

const translations: Record<Lang, unknown> = { fi, en };
const STORAGE_KEY = "nuppu-lang";
const DEFAULT_LANG: Lang = "fi";
```
The two JSON files are imported directly as JS objects (Vite/TS supports importing `.json` as
modules, enabled by `resolveJsonModule: true` in tsconfig). `translations` is a lookup table keyed
by language code. Default language is Finnish, matching the business being Finland-based.

```tsx
function getStoredLang(): Lang {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "fi" || value === "en" ? value : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}
```
Reads a previously-chosen language from `localStorage` (persists across visits). The `try/catch`
matters: `localStorage` can throw in some browser privacy modes (e.g. Safari private browsing with
certain settings) — rather than crash the whole app, it just falls back to the default.

```tsx
function lookup(lang: Lang, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (obj, k) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[k] : undefined),
      translations[lang],
    );
}
```
This is the actual dictionary lookup. `key.split(".")` turns `"home.heroTitle"` into
`["home", "heroTitle"]`. `.reduce` then walks that path one segment at a time, starting from the
full translations object for that language: first step narrows to `translations[lang].home`,
second step narrows to `translations[lang].home.heroTitle`. The `obj && typeof obj === "object"`
guard means if any segment along the way is missing, it safely returns `undefined` instead of
crashing on `undefined.heroTitle`.

```tsx
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
```
`useState<Lang>(getStoredLang)` — passing a *function* to `useState` (rather than calling
`getStoredLang()` directly) means it only runs once, on the component's first render, not on every
re-render — this is React's "lazy initial state" pattern, worth using whenever computing the
initial value does any work (here: a `localStorage` read). The effect keeps the HTML document's
`lang` attribute (`<html lang="fi">`) in sync with the chosen language — this matters for
accessibility (screen readers) and SEO, not just visuals.

```tsx
  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures (e.g. private browsing).
    }
  };
```
The public `setLang` function updates React state *and* persists the choice, again tolerating a
`localStorage` write failure silently (worst case: the choice doesn't survive a refresh, but the
app keeps working).

```tsx
  const t = (key: string): string => {
    const value = lookup(lang, key);
    if (typeof value === "string") return value;
    const fallback = lookup("en", key);
    return typeof fallback === "string" ? fallback : key;
  };

  const tList = (key: string): string[] => {
    const value = lookup(lang, key);
    if (Array.isArray(value)) return value as string[];
    const fallback = lookup("en", key);
    return Array.isArray(fallback) ? (fallback as string[]) : [key];
  };
```
`t()` is what every page calls for a single string; `tList()` is for arrays (bullet-point lists).
Both follow the same three-step fallback: (1) try the current language, (2) if missing, try
English, (3) if *still* missing, return the raw key itself (`t()`) or a one-item array containing
the key (`tList()`). That last fallback is intentional — a visibly wrong string like
`"home.missingKey"` on the live page is a bug you'll notice immediately; a silently blank string is
a bug you might ship for months.

```tsx
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
```
The public hook every component actually calls. Throwing if `ctx` is `null` is a deliberate
"fail loud" guard — it means a developer who forgets to wrap something in `<LanguageProvider>`
gets an immediate, clear error instead of a silent `undefined` bug three renders later.

### [en.json](src/app/i18n/en.json) / [fi.json](src/app/i18n/fi.json)

Both files share identical top-level keys: `nav`, `footer`, `cookieConsent`, `home`, `characters`,
`emotionalSupport`, `about`, `contact`, `notFound`, `terms`, `privacy`, `cookies` — one namespace
per page/component, matching what you saw called via `t("home.heroTitle")`,
`t("contact.form.nameLabel")`, etc. There is **no tooling enforcing that both files have the same
keys** — if you add a new key to `en.json` and forget `fi.json`, nothing will error; `t()` will
just silently fall back to the English string for Finnish users (per the fallback chain above).
**When editing copy, always update both files in the same change.**

---

## 4. Shared Components

### [Navigation.tsx](src/app/components/Navigation.tsx)

```tsx
function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const option = (value: Lang, label: string) => (
    <button
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={`px-3 py-1 text-sm rounded-full transition-colors ${
        lang === value ? "bg-[#6B9AC4] text-white" : "text-[#718096] hover:text-[#6B9AC4]"
      }`}
    >
      {label}
    </button>
  );
```
A small nested component-factory: `option()` is a function that *returns JSX*, called twice below
(once for `"fi"`, once for `"en"`) rather than being written out twice by hand. `aria-pressed`
marks the currently-active language button for screen readers/accessibility tooling. The
conditional className (ternary inside a template literal) is the standard Tailwind pattern for
"style differently when active."

```tsx
export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.characters"), path: "/characters" },
    { name: t("nav.emotionalSupport"), path: "/emotional-support" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;
```
`navLinks` is data, not hardcoded JSX — the actual link elements are generated by mapping over
this array further down, so adding/removing/reordering a nav item means editing this one array
(and the corresponding translation keys), not five copy-pasted `<Link>` blocks. `isActive` compares
the current URL to each link's path to decide which one gets the highlighted/underline styling.

```tsx
<motion.nav
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm"
```
This is the `motion` library's animation API: `initial` is the starting state (off-screen above,
invisible), `animate` is the target state (in place, visible), `transition` controls timing. This
pattern (`initial`/`animate`/`transition`) repeats throughout every page in this codebase for
"fade/slide in" effects — once you recognize it here, you'll recognize it everywhere.

```tsx
{isActive(link.path) && (
  <motion.div
    layoutId="activeTab"
    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B9AC4] rounded-full"
    transition={{ type: "spring", stiffness: 380, damping: 30 }}
  />
)}
```
`layoutId="activeTab"` is a `motion`-specific trick: when multiple elements across renders share
the same `layoutId`, `motion` automatically animates *between* their positions rather than just
popping the underline from one nav item to another — that's what produces the smooth "sliding
underline" effect when you switch pages.

The mobile menu section (`AnimatePresence` + `mobileMenuOpen` state) follows the same pattern:
`mobileMenuOpen` is toggled by the hamburger button's `onClick`, and `<AnimatePresence>` lets the
menu's exit animation (collapsing height back to 0) play before it's actually removed from the DOM
— without `AnimatePresence`, React would just yank it out instantly with no animation.

### [Footer.tsx](src/app/components/Footer.tsx)

Mostly static links (same `t()` + `<Link>` pattern as Navigation). Two things worth calling out:

```tsx
<a href="/admin" target="_blank" rel="noopener noreferrer" ...>
```
This is a plain `<a>` tag, not a router `<Link>` — deliberately, because `/admin` is the separate
`admin-dashboard` build (Chapter 12), not a route this React Router instance knows about. Using
`<Link>` here would try to client-side-navigate to a route that doesn't exist in `routes.tsx` and
would 404 or misbehave; a real `<a>` tag forces a full browser navigation to that separate static
app. `target="_blank" rel="noopener noreferrer"` opens it in a new tab and prevents the new tab
from getting a reference back to this page's `window` object (a standard security precaution for
any `target="_blank"` link).

```tsx
<p>© {new Date().getFullYear()} Nuppu. {t("footer.rights")}</p>
```
`new Date().getFullYear()` computes the copyright year at render time — meaning this stays correct
forever with zero maintenance, unlike a hardcoded year.

### [CookieConsent.tsx](src/app/components/CookieConsent.tsx)

```tsx
const CONSENT_STORAGE_KEY = "nuppu-cookie-consent";
type ConsentValue = "accepted" | "essential-only";

function getStoredConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "accepted" || value === "essential-only" ? value : null;
  } catch {
    return null;
  }
}
```
Same `localStorage`-with-fallback pattern as `LanguageContext`. Note the fallback here is `null`
(no consent recorded) rather than a default — on a read failure, the banner will just show again,
which is the "fail safe" direction for a consent mechanism (better to ask again than to silently
assume consent was given).

```tsx
export default function CookieConsent() {
  const { t } = useLanguage();
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(getStoredConsent());
    setHydrated(true);
  }, []);

  if (!hydrated || consent) {
    return null;
  }
```
Why not just initialize `useState(getStoredConsent)` directly (like `LanguageContext` does)? This
is a **hydration-safety pattern**: server-rendered/static-generated React apps can mismatch between
what the server rendered and what the client's `localStorage` says, causing a "hydration
mismatch" warning. By starting with `consent = null, hydrated = false` (always rendering nothing on
the very first render) and only checking `localStorage` inside `useEffect` (which only runs
client-side, after mount), this sidesteps that class of bug entirely. `if (!hydrated || consent)
return null` is the actual gate: don't render anything until we've checked storage, and don't
render the banner at all if a choice was already stored.

```tsx
const handleChoice = (value: ConsentValue) => {
  storeConsent(value);
  setConsent(value);
};
```
Clicking either button (Accept / Essential Only) persists the choice and updates state, which
makes the `if (!hydrated || consent) return null` guard above true on the next render, hiding the
banner. As the code comment in the file notes: **this banner does not currently gate any actual
script** — Nuppu sets no non-essential cookies at the time of writing, so this is compliance
infrastructure built ahead of need. If you ever add analytics, you must manually check
`getStoredConsent() === "accepted"` before loading that script — it won't happen automatically.

### [ui/utils.ts](src/app/components/ui/utils.ts)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
`cn()` is used everywhere a component accepts a `className` prop that needs to merge with
internal default classes. `clsx(inputs)` combines an arbitrary mix of strings/objects/arrays of
class names into one string, filtering out falsy values (so `cn("a", condition && "b", "c")`
works). `twMerge(...)` then resolves **Tailwind-specific conflicts** — e.g. if both `"p-4"` and a
later `"p-8"` end up in the same string, plain string concatenation would apply both (CSS conflict,
unpredictable which wins), but `twMerge` recognizes they're both padding utilities and keeps only
the last one. This combination is the standard shadcn/ui pattern for a safely-overridable
`className` prop.

### [ui/button.tsx](src/app/components/ui/button.tsx)

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ... disabled:opacity-50 ...",
  {
    variants: {
      variant: { default: "...", destructive: "...", outline: "...", secondary: "...", ghost: "...", link: "..." },
      size: { default: "...", sm: "...", lg: "...", icon: "..." },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
```
`cva` (class-variance-authority) generates a function: call `buttonVariants({ variant: "outline",
size: "lg" })` and it returns the right combination of Tailwind classes as one string, falling back
to `defaultVariants` for anything unspecified. This is how `<Button variant="outline">` in
[EmotionalSupport.tsx](src/app/pages/EmotionalSupport.tsx) knows which classes to apply — the
component below just needs to forward the `variant`/`size` props into this function.

```tsx
function Button({ className, variant, size, asChild = false, ...props }: ...) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
```
`asChild` is a Radix UI pattern: normally `Comp` is a real `<button>` element, but if `asChild` is
`true`, `Comp` becomes `<Slot>` from `@radix-ui/react-slot`, which merges the Button's props/styles
onto whatever single child element you pass in instead of rendering its own wrapper element. This
is exactly how `<Button asChild><Link to="/contact">...</Link></Button>` (used in
EmotionalSupport.tsx) works — it makes the `<Link>` *itself* look like a button, rather than
nesting an actual `<button>` around an `<a>` tag (which is invalid HTML and bad for accessibility).

### [ui/card.tsx](src/app/components/ui/card.tsx)

A set of small building-block components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`,
`CardAction`, `CardContent`, `CardFooter`), each just a `<div>`/`<h4>`/`<p>` with a fixed set of
Tailwind classes plus `cn(...)` to allow overrides. `data-slot="card"` (etc.) attributes aren't
used by any JS in this repo — they're a convention for CSS targeting or automated tooling
(e.g. `[data-slot=card-action]` is referenced inside `CardHeader`'s own className to conditionally
change the grid layout when a `CardAction` child is present).

### [media/ImageWithFallback.tsx](src/app/components/media/ImageWithFallback.tsx)

```tsx
const ERROR_IMG_SRC = 'data:image/svg+xml;base64,...';

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const handleError = () => setDidError(true);
```
`ERROR_IMG_SRC` is a broken-image icon **encoded directly as a base64 data URI** — meaning it's
guaranteed to always be available (no network request needed), which is the whole point: it's the
fallback shown *when a real image fails to load*, so it can't itself depend on a network request
that might also fail.

```tsx
const { src, alt, style, className, fetchPriority, ...rest } = props;
const fetchPriorityAttr = fetchPriority ? ({ fetchpriority: fetchPriority } as Record<string, string>) : undefined;
```
React (as of version 18, used here) doesn't recognize the camelCase `fetchPriority` prop on plain
DOM elements — only the lowercase HTML attribute `fetchpriority` is valid. This destructures
`fetchPriority` out of props specifically so it can be re-added under its correct lowercase name
via spread (`{...fetchPriorityAttr}`) instead of being passed through as-is (which would either be
silently dropped or trigger a console warning).

```tsx
return didError ? (
  <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`} style={style}>
    <div className="flex items-center justify-center w-full h-full">
      <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
    </div>
  </div>
) : (
  <img
    src={src}
    alt={alt}
    className={className}
    style={style}
    loading={props.loading ?? "lazy"}
    decoding={props.decoding ?? "async"}
    {...rest}
    {...fetchPriorityAttr}
    onError={handleError}
  />
);
```
Two render paths gated by `didError`. Normal path: renders a real `<img>`, defaulting
`loading="lazy"` (don't fetch the image until it's near the viewport — good for performance on
image-heavy pages) and `decoding="async"` (don't block rendering on image decode) unless the
caller explicitly overrode them (that's why [Home.tsx](src/app/pages/Home.tsx)'s hero image
passes `loading="eager" fetchPriority="high"` — it's above the fold and should load immediately,
overriding these defaults). `onError={handleError}` is the browser's native image-load-failure
event — if it fires, `didError` flips to `true` and the component re-renders into the fallback
branch, swapping in the broken-image placeholder while preserving the original failed URL in
`data-original-url` for debugging.

### [hooks/usePageMeta.ts](src/app/hooks/usePageMeta.ts)

```ts
function upsertMetaDescription(content: string) {
  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement("meta");
    description.setAttribute("name", "description");
    document.head.appendChild(description);
  }
  description.setAttribute("content", content);
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    upsertMetaDescription(description);
  }, [title, description]);
}
```
"Upsert" = update-or-insert. `index.html` already has a `<meta name="description">` tag, so in
practice this function always takes the "found it, just update the content" path — but it
defensively handles the "doesn't exist yet" case too by creating and appending one. Every page
component calls `usePageMeta(t("page.meta.title"), t("page.meta.description"))` near the top of
its function body — this is a Single Page App's substitute for what a multi-page site gets for
free (each page naturally having its own `<title>`): since there's only one `index.html` for every
route, each page has to explicitly set the document title/description itself once it mounts. This
matters for both the browser tab title and for search engines / social previews of individual
pages.

---

## 5. Pages

Every page (except EmotionalSupport, Contact, and NotFound, which have real interactive logic)
follows the same shape: a `usePageMeta()` call, a data array or two (content sourced via
`t()`/`tList()` translation calls, not hardcoded English strings), and a sequence of `<section>`
blocks with `motion.div` fade/slide-in wrappers. Once you've read one, you can read all of them —
so this chapter explains each page's *unique* logic and only briefly touches the shared JSX
pattern.

### [pages/Home.tsx](src/app/pages/Home.tsx)

The one static page with actual interactive state: a testimonial-style carousel.

```tsx
const [currentSlide, setCurrentSlide] = useState(0);

const whyNuppuSlides = [
  { icon: <Heart .../>, title: t("home.why.slide1.title"), description: t(...), color: "#FFD4C4" },
  { icon: <BookOpen .../>, ... },
  { icon: <Brain .../>, ... },
];

const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % whyNuppuSlides.length);
const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + whyNuppuSlides.length) % whyNuppuSlides.length);
```
`% whyNuppuSlides.length` (modulo) wraps the index around — `nextSlide` from the last slide
(`index 2`) computes `(2+1) % 3 = 0`, back to the first. `prevSlide` from the first slide
(`index 0`) computes `(0 - 1 + 3) % 3 = 2`, wrapping to the last — the `+ 3` before the modulo is
necessary because JavaScript's `%` on a negative number (`-1 % 3 === -1`) doesn't wrap the way you
want by itself.

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentSlide}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.5 }}
    style={{ backgroundColor: whyNuppuSlides[currentSlide].color }}
  >
```
`key={currentSlide}` is the trick that makes this work: changing the `key` prop tells React
"this is a *different* element," forcing it to unmount the old slide (playing its `exit`
animation) and mount a new one (playing `initial` → `animate`) instead of just updating the
existing element in place. `mode="wait"` on `AnimatePresence` tells it to fully finish the exit
animation before starting the next enter animation, rather than overlapping them.

The rest — hero section, "Meet the Gang" character lineup image, target-audience cards, bottom
CTA — is the standard data-array-mapped-to-JSX pattern described above, with `Link` components
from `react-router-dom` for internal navigation (`to="/contact"`, `to="/characters"`).

### [pages/Characters.tsx](src/app/pages/Characters.tsx)

```tsx
const characters = [
  { name: "Nuppu", personality: t("characters.nuppu.personality"), ..., color: "#F2984D", image: nuppuImg, icon: <Heart .../> },
  { name: "Muru", ..., color: "#F0B429", image: muruImg, icon: <Shield .../> },
  { name: "Hippu", ..., color: "#EE7FB0", image: hippuImg, icon: <Star .../> },
  { name: "Lumo", ..., color: "#4FB6E0", image: lumoImg, icon: <Lightbulb .../> },
];
```
Note `name: "Nuppu"` etc. are **hardcoded**, not translated — character names don't change between
languages (they're proper nouns/brand names), only their `personality`/`description`/`emotions`
text does. The character images (`nuppuImg`, etc.) are imported at the top of the file as real
`.webp` file imports — Vite turns these into hashed, cache-busted URLs at build time
(`import nuppuImg from "../../assets/NUPPU BUNNY.webp"` resolves to something like
`/assets/NUPPU-BUNNY-a1b2c3.webp` in the production build). This array then gets `.map()`'d over
further down to render one card per character — the only page-specific logic here is this data
definition; the rendering is the same pattern as everywhere else.

### [pages/About.tsx](src/app/pages/About.tsx)

Same data-array pattern, four separate arrays this time (`values`, `frameworks`, `features`,
`whyItems`), each mapped to a different visual section (value cards, numbered framework list,
feature cards with gradient icon backgrounds, "why Nuppu" list with icon + text). No unique
interactive logic — purely a longer instance of the established pattern, plus a cross-link to the
`app-prototype`'s live preview:
```tsx
<a href="/app-preview/" target="_blank" rel="noopener noreferrer">
```
another real `<a>` tag (not router `<Link>`) for the same reason as the `/admin` link in Footer —
it points outside this router's known routes, to wherever the prototype build is hosted.

### [pages/Contact.tsx](src/app/pages/Contact.tsx) — full interactive walkthrough

```tsx
const [formData, setFormData] = useState({ name: "", email: "", role: "", message: "" });
const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
const [errorMessage, setErrorMessage] = useState("");
```
Three pieces of state: the form's field values, a small state machine for the submit lifecycle,
and whatever error message to show.

```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```
One handler for every field (text inputs, the role `<select>`, the message `<textarea>`) — it
reads the `name` attribute off whichever element fired the change event and updates just that key
in `formData`, using `{ ...prev, [name]: value }` (spread the rest unchanged, then overwrite one
computed key — the `[name]` square-bracket syntax is a *computed property name*, meaning "use the
runtime value of the variable `name` as the object key," not the literal string `"name"`). This is
why the `<input name="email">` element's `name` attribute has to exactly match the `formData` key
`email` — that string is what wires the two together.

```tsx
const validateForm = () => {
  if (!formData.name.trim()) { setErrorMessage(t("contact.errors.name")); return false; }
  if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { setErrorMessage(t("contact.errors.email")); return false; }
  if (!formData.role) { setErrorMessage(t("contact.errors.role")); return false; }
  if (!formData.message.trim()) { setErrorMessage(t("contact.errors.message")); return false; }
  return true;
};
```
Client-side validation, checked in order, short-circuiting on the first failure. The email regex
`/\S+@\S+\.\S+/` means "one-or-more non-whitespace characters, an `@`, one-or-more non-whitespace
characters, a `.`, one-or-more non-whitespace characters" — a loose sanity check, **not** a strict
RFC-5322 email validator (real email validation is notoriously hard to get exactly right with a
regex, so this deliberately just catches obvious typos, and the backend re-validates with the same
regex as a second line of defense — client-side validation is only ever a UX nicety, never a
security boundary, because a malicious client can bypass it entirely).

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage("");
  if (!validateForm()) { setFormStatus("error"); return; }
  setFormStatus("loading");
  try {
    await contactAPI.submit(formData);
    setFormStatus("success");
    setFormData({ name: "", email: "", role: "", message: "" });
    setTimeout(() => setFormStatus("idle"), 5000);
  } catch (error) {
    setFormStatus("error");
    setErrorMessage(error instanceof Error ? error.message : t("contact.errors.generic"));
  }
};
```
`e.preventDefault()` stops the browser's default full-page-reload form submission — everything
happens via `fetch` instead (inside `contactAPI.submit`, Chapter 6). On success: clear the form,
show a success banner, and auto-hide it after 5 seconds via `setTimeout`. On failure:
`error instanceof Error` is the "narrow an `unknown` caught value" pattern mentioned in Chapter 0
— `contactAPI.submit` throws a real `Error` object with a useful `.message` (per Chapter 6), so
this branch almost always fires, but the fallback generic message covers the theoretical case of
something non-Error being thrown (e.g. a network-level failure object).

The JSX itself wires `formData.field` → `value=`, `handleInputChange` → `onChange=`, and
`formStatus === "loading"` → `disabled=` on every input (so users can't edit/resubmit mid-request)
— plus conditionally rendered success/error banners and a spinning-loader icon
(`animate={{ rotate: 360 }}, transition={{ repeat: Infinity }}`) while `formStatus === "loading"`.

### [pages/EmotionalSupport.tsx](src/app/pages/EmotionalSupport.tsx) — full interactive walkthrough

This is the most complex page in the app — the paid booking flow. Full section-by-section
coverage:

```tsx
type PaymentUiState = "idle" | "loading" | "error";

export function EmotionalSupport() {
  const { t, tList } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnStatus = searchParams.get("payment"); // success | cancelled | pending | error | null
```
`useSearchParams()` (from `react-router-dom`) reads/writes the URL's query string. `returnStatus`
is read from `?payment=...` — this is how the page knows a customer just came *back* from
Paytrail's checkout (Chapter 7 explains who sets this parameter).

```tsx
useEffect(() => {
  if (returnStatus) {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("payment");
      setSearchParams(next, { replace: true });
    }, 8000);
    return () => clearTimeout(timeout);
  }
}, [returnStatus, searchParams, setSearchParams]);
```
If there's a `?payment=` value, start an 8-second timer that removes it from the URL. The `return
() => clearTimeout(timeout)` is the effect's **cleanup function** — it runs if the effect re-runs
(e.g. `returnStatus` changes again) or the component unmounts, cancelling a stale timer so it can't
fire after it's no longer relevant. `{ replace: true }` updates the URL without adding a new
browser-history entry — clicking "back" after the banner clears won't step through a phantom
intermediate URL state. The comment in the actual code explains *why* this exists: without it, a
page refresh after payment would re-show a stale success/cancel banner forever, since the query
param would otherwise persist until manually navigated away.

```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const validate = () => {
  if (!formData.name.trim()) { setErrorMessage(t("emotionalSupport.errors.name")); return false; }
  if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { ...; return false; }
  if (formData.phone.trim() && !/^\+?[0-9\s-]{6,20}$/.test(formData.phone.trim())) { ...; return false; }
  if (!formData.message.trim()) { ...; return false; }
  return true;
};
```
Identical pattern to Contact.tsx, plus one addition: the phone check
(`if (formData.phone.trim() && !regex.test(...))`) only fires *if* a phone number was entered at
all (`formData.phone.trim()` truthy) — phone is optional, so an empty field must pass validation,
but a non-empty field must look phone-shaped: optional leading `+`, then 6–20 digits/spaces/hyphens.

```tsx
const handleBookAndPay = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage("");
  if (!validate()) { setPaymentState("error"); return; }
  setPaymentState("loading");
  try {
    const response = await paymentsAPI.create({
      service: "emotional-support",
      customerName: formData.name.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim() || undefined,
      customerMessage: formData.message.trim(),
    });
    const redirectUrl = response?.data?.url;
    if (!redirectUrl) { throw new Error(t("emotionalSupport.errors.noRedirect")); }
    window.location.href = redirectUrl;
  } catch (error) {
    setPaymentState("error");
    setErrorMessage(error instanceof Error ? error.message : t("emotionalSupport.errors.generic"));
  }
};
```
`customerPhone: formData.phone.trim() || undefined` — if the trimmed phone is an empty string
(falsy), send `undefined` instead, so the backend receives "field not provided" rather than "field
provided as empty string" (matters because the backend's Mongoose schema treats the field as
genuinely optional only when it's `undefined`/absent, not when it's an empty string). The critical
line is `window.location.href = redirectUrl` — a **real browser navigation**, deliberately not a
`fetch` or a React Router `navigate()`. This hands the entire browser tab over to Paytrail's
hosted checkout page (a different domain entirely) — there is no way to do that while staying
inside a single-page app's client-side routing, because the destination isn't part of this app at
all.

The render section conditionally shows one of four colored banners
(`returnStatus === "success" | "pending" | "cancelled" | "error"`) — each just a differently
colored/iconed `<div>` with `role="status"` or `role="alert"` and `aria-live` for accessibility
(so screen readers announce the banner automatically when it appears). The booking form below
follows the same controlled-input pattern as Contact.tsx, with every field `disabled` while
`paymentState === "loading"`, and the submit button's label swapping between "Book & Pay" and
"Redirecting..." based on that same state.

### [pages/Privacy.tsx](src/app/pages/Privacy.tsx), [Terms.tsx](src/app/pages/Terms.tsx), [Cookies.tsx](src/app/pages/Cookies.tsx)

All three are the same tiny pattern — worth showing once in full since it's so short (this is
`Cookies.tsx` verbatim, `Terms.tsx` is identical with different keys, `Privacy.tsx` is the same
idea with one extra helper):

```tsx
export default function Cookies() {
  const { t } = useLanguage();
  usePageMeta(t("cookies.meta.title"), t("cookies.meta.description"));
  const sections = ["what", "how", "manage"];

  return (
    <div className="w-full bg-white">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1>{t("cookies.title")}</h1>
          <p>{t("cookies.updated")}</p>
          <div className="space-y-8 text-[#4A5568] leading-relaxed">
            {sections.map((key) => (
              <section key={key}>
                <h2>{t(`cookies.${key}.title`)}</h2>
                <p>{t(`cookies.${key}.text`)}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```
`sections` is just an array of translation-key fragments (`"what"`, `"how"`, `"manage"`), mapped
into a heading + paragraph each via **template-literal translation keys**:
``t(`cookies.${key}.title`)`` dynamically builds the key string `"cookies.what.title"`,
`"cookies.how.title"`, etc. This means adding a new legal section is just adding one string to the
`sections` array plus the matching `title`/`text` pair in *both* `en.json` and `fi.json` — no JSX
changes needed. `Privacy.tsx` additionally defines a small `rich()` helper:
```tsx
function rich(text: string) {
  return text.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>));
}
```
This lets translation strings contain simple `**bold**` markdown-style markers (e.g.
`"We **never** sell your data"`) that get rendered as real `<strong>` tags — splitting on `**`
means odd-indexed pieces (`i % 2 === 1`) were *inside* a pair of asterisks, so they become bold;
even-indexed pieces are plain text, wrapped in `<Fragment>` (a no-op wrapper) just to satisfy
React's requirement that mapped elements have a `key`.

### [pages/NotFound.tsx](src/app/pages/NotFound.tsx)

No unique logic — a big "404" heading, translated subtitle, and two actions: a router `<Link
to="/">` to go home, and a plain button calling `window.history.back()` (the browser's native
"go back one step" API) to return wherever the user came from.

---

## 6. Frontend → Backend Bridge

### [src/app/config/api.ts](src/app/config/api.ts) — full walkthrough

```ts
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const isProduction = import.meta.env.PROD;

if (isProduction && !envApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required in production.");
}

export const API_BASE_URL = envApiBaseUrl ?? "http://localhost:5050/api";
```
`import.meta.env.PROD` is a Vite built-in, `true` only in a production build. This block is a
**build-time safety check**: if you build for production without setting `VITE_API_BASE_URL`, the
app throws immediately rather than silently shipping with a `localhost` API URL baked into the
bundle (which would make the deployed site completely non-functional, but fail *quietly* — every
API call would just error out with a confusing network error, instead of this clear message at
build/startup time).

```ts
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  };
  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data;
}
```
The one shared `fetch` wrapper every API call goes through. `<T>` is a generic type parameter —
callers specify what shape of JSON they expect back (see `paymentsAPI.create` below), and
TypeScript then knows the return type without a runtime check. `{ ...options, headers: {...} }`
merges any caller-supplied options/headers with a default `Content-Type: application/json`, letting
callers override it if they ever needed to (none currently do). `response.ok` is `true` for any
2xx status — if it's *not* ok (4xx/5xx), it throws a real `Error` using the backend's own
`data.message` field (recall every backend error response in `api/index.js` includes a `message`
field) — this is exactly what `error.message` in Contact.tsx/EmotionalSupport.tsx's `catch` blocks
ends up displaying to the user.

```ts
export const contactAPI = {
  submit: async (data: { name: string; email: string; role: string; message: string }) => {
    return apiRequest("/contact", { method: "POST", body: JSON.stringify(data) });
  },
};

export const paymentsAPI = {
  create: async (data: { service: "emotional-support"; customerName: string; customerEmail: string; customerPhone?: string; customerMessage: string }) => {
    return apiRequest<{ status: string; data: { url: string; transactionId: string; usingTestCredentials: boolean } }>(
      "/payments/create",
      { method: "POST", body: JSON.stringify(data) },
    );
  },
};

export const healthAPI = {
  check: async () => apiRequest("/health", { method: "GET" }),
};
```
Three tiny wrapper objects, one per backend feature area. Each just calls `apiRequest` with the
right endpoint path, HTTP method, and JSON-stringified body. This is the **entire** surface area
between frontend and backend — if you ever add a new API route in `api/index.js`, you add a
matching function here, and that's the only place the frontend needs to know the URL/shape of that
route.

---

## 7. The Backend — [api/index.js](api/index.js)

One file, ~960 lines, no separate router/controller files — small enough that splitting it up
would add indirection without benefit. Read this chapter with the file open side-by-side.

### 7.1 Setup & environment (lines 1–83)

```js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";
import crypto from "node:crypto";
import { Payment, computeRetentionExpiry } from "../src/server/models/Payment.js";
import { createPayment as createPaytrailPayment, verifyCallbackSignature, usingTestCredentials as paytrailUsingTestCredentials } from "../src/server/payments/paytrailClient.js";

dotenv.config({ quiet: true });
```
Imports every dependency, plus the two domain modules from `src/server/` (Chapter 8) —
`../src/server/...` is a relative path *up and over* from `api/`, which is why those files live
under `src/` even though they're backend code (explained in the Architecture Overview earlier in
this project: Vercel bundles the whole repo together, so this cross-directory import just works).
`dotenv.config({ quiet: true })` loads `.env` into `process.env` for local development; in
production, Vercel injects environment variables directly, so `.env` is never present/read there.

```js
const app = express();
const PORT = Number(process.env.PORT ?? 5050);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/nuppu";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const MONGODB_REQUIRED = process.env.MONGODB_REQUIRED === "true";
const NUPPU_EMAIL = process.env.NUPPU_EMAIL ?? "nuppudigital@gmail.com";
const MAIL_FROM = process.env.MAIL_FROM ?? "noreply@nuppu.app";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const canSendEmail = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
```
Every environment variable is read exactly once, up front, with a sensible local-dev default via
`??` (nullish coalescing — falls back only if the left side is `null`/`undefined`, unlike `||`
which would also fall back on `0`/`""`/`false`). `MONGODB_REQUIRED === "true"` — note environment
variables are *always strings*, even for things conceptually boolean, so this is the correct way
to turn the string `"true"` into an actual boolean `true`. `canSendEmail` is a derived boolean:
"do we have everything needed to actually send mail?" — used everywhere else in the file to
decide whether to attempt email sending at all, letting the app run in a degraded-but-functional
mode without SMTP configured.

```js
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const canSendSms = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
const smsClient = canSendSms ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;
if (!canSendSms) {
  console.warn("SMS receipts disabled: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER to enable them.");
}
```
Identical "optional feature, degrade gracefully" pattern as email, for SMS receipts via Twilio.
The `console.warn` on missing config is a deliberate operability choice — anyone running this
server sees immediately, in the logs, *why* SMS isn't working, rather than silently wondering.
The code comment above this block (visible in the actual file) documents a real Finnish regulatory
detail: as of a 2025 Traficom order, branded alphanumeric SMS sender names sent to Finnish numbers
need pre-registration or get flagged as spam — using a plain purchased phone number as
`TWILIO_FROM_NUMBER` avoids that entirely.

```js
const allowedOrigins = new Set([
  CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);
```
A `Set` (not an array) specifically because membership checks (`.has(origin)`) are O(1) on a Set
vs O(n) on an array — a micro-optimization but the idiomatic choice here. `5173`/`5174` are Vite's
default dev server ports (the main site and the admin dashboard's *own* standalone dev server,
which auto-increments to 5174 if 5173 is already taken).

```js
const mailTransport = canSendEmail
  ? nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  : null;
```
Builds the actual SMTP client, or `null` if not configured — every email-sending function later
checks `if (!mailTransport) { ...skip... }` first.

### 7.2 Middleware (lines 85–113)

```js
app.set("trust proxy", 1);
```
Tells Express to trust the `X-Forwarded-For` header from exactly one proxy hop in front of it.
Necessary because Vercel (and most hosting platforms) sits in front of your app as a reverse
proxy — without this, `req.ip` would return the proxy's own IP for every request, not the real
visitor's IP, which would break the per-IP rate limiters below (everyone would share one "IP"
bucket).

```js
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) { callback(null, true); return; }
      callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: false,
  }),
);
```
CORS (Cross-Origin Resource Sharing) controls which *other* origins (domains) are allowed to make
browser requests to this API. Rather than a static list, `origin` is a function: `!origin` is true
for non-browser requests (like `curl` or server-to-server calls, which don't send an `Origin`
header) — always allowed, since CORS is a *browser* enforcement mechanism, meaningless for
non-browser clients anyway. Otherwise, only origins in the `allowedOrigins` Set get through;
anything else gets an error, which the browser turns into a blocked request. `credentials: false`
means cookies/auth headers aren't automatically included cross-origin — not needed here since auth
uses an explicit header (`x-admin-token`) the frontend sets manually, not cookies.

```js
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
```
Parses incoming request bodies as JSON (or URL-encoded form data) into `req.body`. The `20kb`
limit is a defensive cap — without it, a malicious client could send a multi-gigabyte body and
exhaust server memory/bandwidth before your route handler even runs (a cheap denial-of-service
vector); 20kb is generously larger than any legitimate contact-form or payment-creation payload
this app sends.

```js
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
```
Manually sets security headers on every response. `Strict-Transport-Security` (HSTS) tells
browsers to only ever connect via HTTPS for the next ~2 years (`max-age=63072000` seconds),
even if a link somehow points at `http://`. `X-Content-Type-Options: nosniff` stops browsers from
"guessing" a response's content type in a way that could turn a non-executable file into
executable script. `X-Frame-Options: DENY` prevents this site being embedded in an `<iframe>` on
another site (defense against clickjacking). `Referrer-Policy` controls how much of *this* site's
URL gets leaked to external sites you link out to. As the code comment notes, this is
defense-in-depth: Vercel's own edge network already sets these for the static frontend (per
`vercel.json`), but this covers direct API hits and any non-Vercel deployment.

### 7.3 The Contact Message schema (lines 115–156)

```js
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: [100, "..."] },
    email: { type: String, required: [true, "..."], trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, "..."] },
    role: { type: String, required: [true, "..."], enum: ["parent", "teacher", "healthcare", "other"] },
    message: { type: String, required: [true, "..."], trim: true, maxlength: [2000, "..."] },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
    ipAddress: { type: String },
  },
  { timestamps: true }
);
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
```
This is a Mongoose schema, defining the shape and validation rules for every document stored in
the `contactmessages` MongoDB collection (Mongoose auto-pluralizes/lowercases the model name for
the collection name). `trim: true` strips leading/trailing whitespace automatically on save.
`match: [regex, message]` runs the given regex against the field and uses `message` as the
validation error if it fails — this is the *database layer's* validation, a second line of defense
behind the route handler's own manual `if` checks further down (defense in depth: even if a route
handler's manual check had a bug, the schema would still reject bad data). `{ timestamps: true }`
auto-adds and maintains `createdAt`/`updatedAt` fields on every document — you never set these
yourself.

### 7.4 Rate limiting & auth middleware (lines 158–258)

```js
const validRoles = ["parent", "teacher", "healthcare", "other"];
const messageWindowMs = 60_000;
const maxSubmissionsPerWindow = 5;
const contactRateState = new Map();

function rateLimitContact(req, res, next) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const data = contactRateState.get(key) ?? { count: 0, startedAt: now };

  if (now - data.startedAt > messageWindowMs) {
    data.count = 0;
    data.startedAt = now;
  }
  data.count += 1;
  contactRateState.set(key, data);

  if (data.count > maxSubmissionsPerWindow) {
    return res.status(429).json({ status: "error", message: "Too many requests. Please try again in a minute." });
  }
  return next();
}
```
A **sliding-ish rate limiter** implemented from scratch with an in-memory `Map` keyed by IP
address — no external dependency (like `express-rate-limit`) or Redis needed at this traffic
scale. Logic: look up (or initialize) this IP's counter; if more than 60 seconds have passed since
the window started, reset the counter to a fresh window; increment the count; if it now exceeds 5,
reject with HTTP 429 ("Too Many Requests"); otherwise call `next()` to let the request continue to
its actual route handler. **Important limitation to know as the maintainer:** this state lives in
plain server memory. On Vercel, each serverless function invocation *can* get a fresh instance
(no shared memory between invocations in general, though warm instances do persist state for a
while) — so this rate limiter is "best effort" on serverless, not a hard guarantee, and resets
completely on every server restart. It's adequate for its actual purpose here (deterring casual
spam-clicking a submit button), not a defense against a determined distributed attacker.

```js
function createRateLimiter({ windowMs, max }) {
  const state = new Map();
  return (req, res, next) => { /* identical logic to rateLimitContact, parameterized */ };
}
```
A generalized factory version of the exact same pattern, reused later for the payments endpoint
(`createRateLimiter({ windowMs: 60_000, max: 10 })`) — note `rateLimitContact` above predates this
generalization and duplicates the same logic rather than being refactored to use the factory; both
work identically, it's just that the codebase has two copies of one pattern instead of one.

```js
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ status: "error", message: "Admin routes are unavailable until ADMIN_TOKEN is configured." });
  }
  const providedToken = req.header("x-admin-token");
  if (!providedToken || providedToken !== ADMIN_TOKEN) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  return next();
}
```
The entire admin authentication system: one shared secret string, sent as a custom header
`x-admin-token`, checked with a simple `!==` comparison. **Not a JWT, not sessions, not per-user
accounts** — there's exactly one "admin" who knows this one token (whoever the site operator gives
it to). If `ADMIN_TOKEN` was never set as an environment variable at all, every admin route
responds `503` (service unavailable) rather than treating a missing token as "anyone gets in" —
this is a fail-closed design. Note: comparing tokens with plain `!==` is not timing-safe (unlike
`verifyCallbackSignature` in Chapter 8, which correctly uses `crypto.timingSafeEqual`) — for a
single static admin-token comparison against low-value/low-attacker-sophistication threat models
this is an acceptable simplification the codebase makes, but it's worth knowing if you ever expose
this admin surface more broadly.

```js
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function requireDatabase(req, res, next) {
  if (!isMongoConnected()) {
    return res.status(503).json({ status: "error", message: "Database is temporarily unavailable. Please try again shortly." });
  }
  return next();
}
```
`mongoose.connection.readyState` is a number: `0` disconnected, `1` connected, `2` connecting,
`3` disconnecting. Only `1` means "safe to query." Routes that *require* the database
(payments — you can't sell something you can't record) use this middleware to fail fast with a
clear 503 rather than letting a Mongoose query hang or throw a confusing error deeper in the code.
Contrast this with the contact-form route, which checks `isMongoConnected()` manually inline and
degrades (skips DB write, still sends the email) rather than rejecting outright — a deliberate
difference: a lost contact message is recoverable (the team still gets emailed), a "sold" payment
that was never recorded would not be.

```js
function requireCronOrAdmin(req, res, next) {
  const authHeader = req.header("authorization") ?? "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (CRON_SECRET && bearerMatch && bearerMatch[1] === CRON_SECRET) {
    return next();
  }
  return requireAdmin(req, res, next);
}
```
Used only on the retention-sweep endpoint. Vercel Cron automatically sends
`Authorization: Bearer <CRON_SECRET>` on scheduled invocations; this checks for that first, and
falls through to the normal admin-token check otherwise (so a human can also trigger the same
endpoint manually with `x-admin-token`, e.g. for testing).

### 7.5 Anonymisation & notification helpers (lines 260–438)

```js
async function anonymizeExpiredPayments() {
  const now = new Date();
  const result = await Payment.updateMany(
    { retentionExpiresAt: { $lte: now }, anonymizedAt: { $exists: false } },
    { $set: { customerName: null, customerEmail: null, customerPhone: null, customerMessage: null, anonymizedAt: now } },
    { runValidators: false },
  );
  return result.modifiedCount ?? result.nModified ?? 0;
}
```
A single MongoDB `updateMany` call. The filter `{ retentionExpiresAt: { $lte: now },
anonymizedAt: { $exists: false } }` means "every payment whose retention period has already
expired (`$lte` = less-than-or-equal) AND that hasn't already been anonymised" — the second
condition makes this function safely re-runnable (calling it twice in a row the second time
matches nothing new). `$set: { ...: null, anonymizedAt: now }` nulls out the personal fields while
stamping *when* the anonymisation happened (useful for audit purposes — you can prove *when*
compliance action was taken). `runValidators: false` is necessary because the schema's
`customerName`/`customerEmail`/`customerMessage` fields are marked `required: true` — setting them
to `null` would fail schema validation if validators ran, but this is precisely the one legitimate
case where nulling a "required" field is intentional. `result.modifiedCount ?? result.nModified`
handles a Mongoose version difference (older versions returned `nModified`, newer ones
`modifiedCount`) — belt-and-suspenders so this works regardless of exact driver version behavior.

```js
async function sendContactInterestEmail({ name, email, role, message, submittedAt }) {
  if (!mailTransport) { console.warn("..."); return; }
  const subject = `New contact interest from ${name}`;
  const text = [...].join("\n");
  const html = `...`;
  await mailTransport.sendMail({ from: MAIL_FROM, to: NUPPU_EMAIL, replyTo: email, subject, text, html });
}
```
Notice `to: NUPPU_EMAIL` (the company) but `replyTo: email` (the visitor's address) — so when
someone on the Nuppu team hits "Reply" in their inbox, it goes straight to the visitor, not back
to the `noreply@` sending address.

```js
function formatEuros(amountCents) {
  return `€${(amountCents / 100).toFixed(2)}`;
}
```
All monetary amounts are stored/passed as **integer cents**, never floating-point euros — a
standard practice to avoid floating-point rounding errors in money math (`0.1 + 0.2 !== 0.3` in
IEEE 754 floats). This one function is the only place cents get converted to a human-readable
euro string, for display in emails/SMS.

```js
async function sendPaymentReceiptToCompany(payment) { ... }
async function sendPaymentReceiptToCustomer(payment) { ... }
async function sendPaymentReceiptSms(payment) {
  if (!payment.customerPhone) return;
  if (!smsClient) { console.warn("..."); return; }
  const body = `Nuppu: payment of ${formatEuros(payment.amountCents)} received, booking confirmed. Ref: ${payment.paytrailReference}`;
  try {
    await smsClient.messages.create({ to: payment.customerPhone, from: TWILIO_FROM_NUMBER, body });
  } catch (error) {
    console.error("Error sending SMS receipt:", error);
  }
}
```
Three near-identical "send one specific notification" functions. The SMS one additionally wraps
its Twilio call in its own local `try/catch` — deliberately, so a bad phone number or Twilio outage
can't crash the caller; it's explicitly logged and swallowed rather than thrown, because (per the
comment in the file) the email receipt is the authoritative confirmation either way — SMS is a
nice-to-have, not something the payment flow should ever depend on succeeding.

```js
async function notifyPaymentConfirmed(payment) {
  const results = await Promise.allSettled([
    sendPaymentReceiptToCompany(payment),
    sendPaymentReceiptToCustomer(payment),
    sendPaymentReceiptSms(payment),
  ]);
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const label = ["company email", "customer email", "customer SMS"][i];
      console.error(`Error sending payment ${label} notification:`, result.reason);
    }
  });
}
```
`Promise.allSettled` (vs. `Promise.all`) runs all three notifications concurrently and waits for
**all of them to finish, regardless of whether any individually failed** — `Promise.all` would
instead reject (and stop) the moment the *first* one failed, potentially skipping the other two
notifications entirely. Each settled result is either `{status: "fulfilled", value}` or
`{status: "rejected", reason}`; the `.forEach` picks out just the rejected ones and logs which
specific notification (by array position, matched against a parallel label array) failed and why.

### 7.6 Routes: health & contact (lines 440–610)

```js
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Nuppu API is running", timestamp: new Date().toISOString() });
});
```
The simplest possible route — no auth, no database — used to verify the deployment is alive at
all (referenced in `DEPLOYMENT.md`'s post-deploy `curl` check).

```js
app.post("/api/contact", rateLimitContact, async (req, res) => {
  try {
    const { name, email, role, message } = req.body;
    if (!name || !email || !role || !message) { return res.status(400).json({...}); }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) { return res.status(400).json({...}); }
    if (!validRoles.includes(role)) { return res.status(400).json({...}); }

    const ipAddress = req.ip ?? req.socket.remoteAddress;
    let contactMessage = null;

    if (isMongoConnected()) {
      contactMessage = new ContactMessage({ name, email, role, message, ipAddress });
      await contactMessage.save();
    } else {
      console.warn("Skipping contact DB persistence: MongoDB is not connected");
    }

    await sendContactInterestEmail({ name, email, role, message, submittedAt: contactMessage?.createdAt ?? new Date() });

    res.status(200).json({
      status: "success",
      message: "Thank you for contacting us! We will get back to you soon.",
      data: { id: contactMessage?._id ?? null, submittedAt: contactMessage?.createdAt ?? new Date().toISOString(), persisted: Boolean(contactMessage) },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ status: "error", message: "Validation failed", errors });
    }
    res.status(500).json({ status: "error", message: "An error occurred..." });
  }
});
```
Note `rateLimitContact` sits as a **second argument** to `app.post` — Express runs middleware
functions in the order listed, so this rate-limit check runs *before* the actual handler function
(the third argument). Manual field-presence and email-regex checks run first (fast, no I/O); only
if those pass does it touch the database. `contactMessage?.createdAt ?? new Date()` — the optional
chaining `?.` matters because `contactMessage` might genuinely be `null` (if Mongo was
disconnected), in which case there's no `.createdAt` to read, so it falls back to "now." The
`catch` block distinguishes a Mongoose `ValidationError` (schema rules failing — extracts each
individual field's error message via `Object.values(error.errors).map(...)`) from any other
unexpected error (generic 500).

```js
app.get("/api/contact", requireAdmin, requireDatabase, async (req, res) => {
  const { status, limit = 50, page = 1 } = req.query;
  const query = {};
  if (status) query.status = status;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;
  const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).limit(limitNum).skip(skip);
  const total = await ContactMessage.countDocuments(query);
  res.status(200).json({ status: "success", data: { messages, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } } });
});
```
This is the standard **pagination pattern** used by every "list" endpoint in this file (also
`GET /api/payments`). `requireAdmin, requireDatabase` — two middleware in a row, both must call
`next()` for the handler to run. `Math.max(1, ...)`/`Math.min(100, Math.max(1, ...))` clamp
`page`/`limit` into sane bounds regardless of what a client sends (preventing e.g.
`?limit=999999999` from asking Mongo to return an enormous result set). `.sort({ createdAt: -1 })`
= newest first. `skip = (pageNum - 1) * limitNum` is the standard offset-pagination formula: page 1
skips 0, page 2 skips `limitNum` records, etc. A **separate** `countDocuments` query gets the total
count for computing `totalPages` — this is a second round-trip to the database, deliberately,
because `.find().limit()` alone has no way to also report how many *total* matching documents
exist beyond the current page.

```js
app.patch("/api/contact/:id", requireAdmin, requireDatabase, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["new", "read", "replied"].includes(status)) { return res.status(400).json({...}); }
  const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
  if (!message) { return res.status(404).json({...}); }
  res.status(200).json({ status: "success", data: message });
});
```
`:id` in the route path is an Express **route parameter** — accessed via `req.params.id`. Used by
the admin dashboard to mark a message read/replied. `{ new: true }` tells Mongoose to return the
document *after* the update was applied (by default it would return the pre-update version).

### 7.7 Routes: Payments (lines 612–923)

```js
const SERVICE_PRICES_CENTS = { "emotional-support": 2900 };
```
**The single source of truth for price.** As covered in the Architecture Overview, this is the
security-critical design decision of the whole payments feature: the frontend only ever sends a
`service` string key; the actual `amountCents` charged is always looked up here, server-side, never
trusted from the client. If you ever need to change the price, **this is the only line to edit** —
everywhere else in the codebase reads price via this map.

```js
function apiBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}
function paytrailRedirectUrls(req) {
  const base = apiBaseUrl(req);
  return {
    successUrl: `${base}/api/payments/success`,
    cancelUrl: `${base}/api/payments/cancel`,
    callbackUrl: `${base}/api/payments/callback`,
  };
}
function frontendReturnUrl(paymentQueryValue) {
  return `${CLIENT_URL}/emotional-support?payment=${paymentQueryValue}`;
}
```
`apiBaseUrl` builds this server's *own* public URL dynamically from the incoming request
(`req.protocol` is `http`/`https`, `req.get("host")` is the domain the request came in on) —
rather than hardcoding a domain, this means the exact same code works correctly whether it's
running on `localhost:5050`, a Vercel preview deployment, or the real production domain, with zero
configuration. `frontendReturnUrl` is the counterpart on the *frontend's* side — built from the
`CLIENT_URL` environment variable (which, unlike the API's own host, genuinely can't be inferred
from the incoming request, since the frontend is a separate origin the request doesn't carry
information about).

```js
async function handlePaytrailReturn(req, res, { isWebhook }) {
  const params = req.query;
  const isValid = verifyCallbackSignature(params);

  if (!isValid) {
    console.warn("Paytrail signature verification failed", { transactionId: params["checkout-transaction-id"] });
    if (isWebhook) { return res.status(400).json({ status: "error", message: "Invalid signature" }); }
    return res.redirect(302, frontendReturnUrl("error"));
  }
```
This is the security-critical entry point covered in the Architecture Overview: **nothing in
`req.query` is trusted until the HMAC signature checks out.** If it fails, a webhook call gets a
plain 400 JSON error (it's a server-to-server call, no browser involved); a redirect (a real
user's browser coming back from Paytrail) instead gets sent to the frontend with `?payment=error`
so they see a real error page rather than a raw JSON blob.

```js
  const transactionId = params["checkout-transaction-id"];
  const checkoutStatus = params["checkout-status"]; // ok | pending | delayed | fail

  let paymentStatus = "pending";
  if (checkoutStatus === "ok") paymentStatus = "paid";
  else if (checkoutStatus === "fail") paymentStatus = "failed";
  else if (checkoutStatus === "pending" || checkoutStatus === "delayed") paymentStatus = "pending";
```
Translates Paytrail's own status vocabulary (`ok`/`pending`/`delayed`/`fail`) into this app's own
internal vocabulary (`paid`/`pending`/`failed`) — a small adapter layer so the rest of the codebase
(the `Payment` schema's `status` enum, the frontend's banner logic) doesn't need to know Paytrail's
specific terms.

```js
  try {
    if (isMongoConnected() && transactionId) {
      const existing = await Payment.findOne({ paytrailTransactionId: transactionId });
      const wasAlreadyPaid = existing?.status === "paid";

      const update = { status: paymentStatus };
      if (paymentStatus === "paid") { update.paidAt = new Date(); }
      const updated = await Payment.findOneAndUpdate({ paytrailTransactionId: transactionId }, { $set: update }, { new: true });

      if (updated && paymentStatus === "paid" && !wasAlreadyPaid) {
        notifyPaymentConfirmed(updated).catch((error) => console.error("Unexpected error in notifyPaymentConfirmed:", error));
      }
    }
  } catch (error) {
    console.error("Error updating payment record from Paytrail return:", error);
  }
```
`wasAlreadyPaid` matters because of the dual-notification design explained in Chapter 4 of the
Architecture Overview: **both** the redirect *and* the separate webhook call `handlePaytrailReturn`
for the same payment. Without this check, a payment could get marked paid and trigger
`notifyPaymentConfirmed` (sending duplicate receipt emails/SMS) twice — once from each call. This
guard ensures notifications only fire on the **transition** into "paid," not on every call that
happens to report "paid" status. `notifyPaymentConfirmed(updated).catch(...)` — note this is
**not** `await`ed. This is the "fire-and-forget" pattern flagged in the Architecture Overview:
the HTTP response to Paytrail (or the browser redirect) doesn't wait around for email/SMS delivery
to finish; it happens in the background, and any error is still caught and logged (via `.catch`)
so it's never a silent unhandled promise rejection.

```js
  if (isWebhook) { return res.status(200).json({ status: "success" }); }

  const queryValue = paymentStatus === "paid" ? "success" : paymentStatus === "failed" ? "cancelled" : "pending";
  return res.redirect(302, frontendReturnUrl(queryValue));
}
```
Webhooks get a plain JSON acknowledgment (Paytrail's servers don't care about a redirect — they
just need a 200 to know the webhook was received). Redirects (real browsers) get an actual HTTP
302 redirect back into the React app, with the internal status translated one more time into the
specific query values the frontend's banner logic checks for (`success`/`cancelled`/`pending`).

```js
app.post("/api/payments/create", rateLimitPayments, requireDatabase, async (req, res) => {
  try {
    const { service, customerName, customerEmail, customerPhone, customerMessage } = req.body ?? {};

    if (!service || !SERVICE_PRICES_CENTS[service]) { return res.status(400).json({...}); }
    if (!customerName || !String(customerName).trim()) { return res.status(400).json({...}); }
    if (!customerEmail || !/\S+@\S+\.\S+/.test(customerEmail)) { return res.status(400).json({...}); }
    const trimmedPhone = customerPhone ? String(customerPhone).trim() : "";
    if (trimmedPhone && !/^\+?[0-9\s-]{6,20}$/.test(trimmedPhone)) { return res.status(400).json({...}); }
    if (!customerMessage || !String(customerMessage).trim()) { return res.status(400).json({...}); }
```
The server-side mirror of the frontend's `validate()` in EmotionalSupport.tsx — as covered in
Chapter 5, client-side validation is only ever a UX nicety, so every one of these checks is
repeated here as the real security boundary, since a request could arrive from anywhere (curl,
a modified frontend, a script), not just the real form.

```js
    const amountCents = SERVICE_PRICES_CENTS[service];
    const stamp = crypto.randomUUID();
    const reference = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const now = new Date();

    const payment = new Payment({
      paytrailTransactionId: `pending-${stamp}`,
      paytrailReference: reference,
      service, amountCents, status: "pending",
      customerName: String(customerName).trim().slice(0, 100),
      customerEmail: String(customerEmail).trim().toLowerCase(),
      customerPhone: trimmedPhone || undefined,
      customerMessage: String(customerMessage).trim().slice(0, 2000),
      retentionExpiresAt: computeRetentionExpiry(now),
    });
```
`crypto.randomUUID()` generates a cryptographically-random unique ID — used both as Paytrail's
required `stamp` (an idempotency-ish identifier for this specific payment attempt) and as the raw
material for a shorter `reference` (stripped of hyphens, truncated to 20 characters — a
human-scannable booking reference, e.g. for the customer to quote in a support email).
`paytrailTransactionId: \`pending-${stamp}\`` is a **placeholder** value, saved before Paytrail has
even responded — necessary because the schema requires this field and it must be unique, so a
temporary-but-unique placeholder is used until the real Paytrail transaction ID is known (a few
lines below). `.slice(0, 100)`/`.slice(0, 2000)` enforce the same max-lengths as the Mongoose
schema, redundantly, as another defense-in-depth layer. `computeRetentionExpiry(now)` (Chapter 8)
stamps the GDPR/bookkeeping retention date at creation time.

```js
    const { successUrl, cancelUrl, callbackUrl } = paytrailRedirectUrls(req);
    const paytrailPayment = await createPaytrailPayment({
      stamp, reference, amountCents,
      description: "Nuppu emotional support consultation (45 min)",
      customerEmail: payment.customerEmail, customerName: payment.customerName,
      successUrl, cancelUrl, callbackUrl,
    });

    payment.paytrailTransactionId = paytrailPayment.transactionId;
    await payment.save();

    res.status(200).json({
      status: "success",
      data: { url: paytrailPayment.href, transactionId: paytrailPayment.transactionId, usingTestCredentials: paytrailUsingTestCredentials },
    });
  } catch (error) {
    res.status(502).json({ status: "error", message: "Could not start the payment. Please try again shortly." });
  }
});
```
Calls out to Paytrail (Chapter 8) to actually create the checkout session, **then** replaces the
placeholder transaction ID with the real one Paytrail returned, and only *then* saves the document
to MongoDB for the first time — note the document is only constructed (`new Payment(...)`) earlier
but not persisted (`.save()`) until after the Paytrail call succeeds. This ordering matters: if the
Paytrail API call throws (network error, bad credentials, etc.), nothing gets written to the
database at all — you don't end up with an orphaned "pending" payment record that will never
receive a real transaction ID. `usingTestCredentials` is passed straight through to the frontend
response — currently unused by the UI, but available for a future "you're in test mode" banner
during development. `502` (Bad Gateway) is the correct status code here specifically because the
failure is "this server tried to talk to an upstream service (Paytrail) and that failed," as
opposed to a `500` (this server's own internal logic failed).

```js
app.get("/api/payments/success", (req, res) => handlePaytrailReturn(req, res, { isWebhook: false }));
app.get("/api/payments/cancel", (req, res) => handlePaytrailReturn(req, res, { isWebhook: false }));
app.get("/api/payments/callback", (req, res) => handlePaytrailReturn(req, res, { isWebhook: true }));
app.post("/api/payments/callback", (req, res) => handlePaytrailReturn(req, res, { isWebhook: true }));
```
Four thin route registrations, all delegating to the one shared handler from earlier, each just
supplying a different `isWebhook` flag. The code comment (visible in the file) explains the
`GET`+`POST` pair on `/callback`: per Paytrail's actual current API docs, callbacks are `GET`
requests with the same query-string parameters as the redirect URLs — the `POST` variant is kept
only as a forward-compatible alias in case Paytrail's spec changes in the future, not because it's
currently used.

```js
app.get("/api/payments/export", requireAdmin, requireDatabase, async (req, res) => {
  const { email } = req.query;
  if (!email) { return res.status(400).json({...}); }
  const payments = await Payment.find({ customerEmail: String(email).toLowerCase() }).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: payments });
});
```
GDPR **data portability** implementation — an admin can export everything on file for one
customer's email address, as required by GDPR Article 20. Note this route deliberately has no
pagination (unlike the list endpoints) — it's meant to return *everything* for one specific
person, not a browsable page of results.

```js
app.get("/api/payments/anonymize-expired", requireCronOrAdmin, requireDatabase, async (req, res) => {
  const anonymizedCount = await anonymizeExpiredPayments();
  res.status(200).json({ status: "success", data: { anonymizedCount } });
});
```
The daily retention sweep endpoint, triggered by Vercel Cron (see Chapter 10) or manually by an
admin. Thin wrapper around the `anonymizeExpiredPayments()` helper from Chapter 7.5.

```js
app.get("/api/payments", requireAdmin, requireDatabase, async (req, res) => { /* identical pagination pattern as GET /api/contact */ });
app.get("/api/payments/:id", requireAdmin, requireDatabase, async (req, res) => { /* Payment.findById, 404 if missing */ });
```
Same pagination pattern from Chapter 7.6, applied to payments. `GET /api/payments/:id` is a plain
single-document lookup — GDPR **right of access** for one specific record.

```js
app.patch("/api/payments/:id", requireAdmin, requireDatabase, async (req, res) => {
  const { customerName, customerEmail } = req.body ?? {};
  const update = {};
  if (customerName !== undefined) {
    if (!String(customerName).trim()) { return res.status(400).json({...}); }
    update.customerName = String(customerName).trim().slice(0, 100);
  }
  if (customerEmail !== undefined) {
    if (!/\S+@\S+\.\S+/.test(customerEmail)) { return res.status(400).json({...}); }
    update.customerEmail = String(customerEmail).trim().toLowerCase();
  }
  if (Object.keys(update).length === 0) { return res.status(400).json({...}); }
  const payment = await Payment.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
  if (!payment) { return res.status(404).json({...}); }
  res.status(200).json({ status: "success", data: payment });
});
```
GDPR **right to rectification** — correct a typo'd name/email after the fact. `!== undefined`
(not just truthy) lets the caller send *either* field independently — sending only
`{ customerEmail: "..." }` must not accidentally wipe `customerName`, which is exactly why `update`
starts as an empty object and only gets keys added for fields that were actually present in the
request body. `runValidators: true` here (unlike the anonymisation function) is intentional — this
route is setting *real* new values that should be validated normally, unlike anonymisation which
deliberately sets fields to `null`.

```js
app.delete("/api/payments/:id/personal-data", requireAdmin, requireDatabase, async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { $set: { customerName: null, customerEmail: null, customerPhone: null, anonymizedAt: new Date() } },
    { new: true, runValidators: false },
  );
  if (!payment) { return res.status(404).json({...}); }
  res.status(200).json({ status: "success", data: payment });
});
```
GDPR **right to erasure**, but implemented as anonymisation rather than a real `deleteOne` — as
`GDPR-NOTES.md` explains, a full delete isn't legally permitted while the record is still inside
its 6-year statutory bookkeeping retention window, so this is the correct middle ground: personal
identifiers are gone, the accounting trail (amount, date, status, transaction ID) remains.

### 7.8 Fallback handlers & startup (lines 925–963)

```js
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});
```
Two catch-all handlers, registered **last** (Express matches routes/middleware in registration
order, so anything not matched by a specific route above falls through to these). The first — a
normal 3-argument-less middleware — catches any request to a path that matched no route at all.
The second — recognizable as an Express **error handler** specifically because it takes 4
arguments (`err, req, res, next`) — catches any error thrown/passed via `next(err)` from
*anywhere* in the app that wasn't already caught locally, logging it server-side and returning a
generic message so internal error details are never leaked to a client.

```js
if (MONGODB_REQUIRED) {
  mongoose.connection.once("open", () => console.log("MongoDB connection ready!"));
  mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
  mongoose.connect(MONGODB_URI);
}
```
The database connection is only *attempted* if `MONGODB_REQUIRED === "true"` — this is what lets
the whole server boot and run (contact form still emails, non-DB routes still work) even with zero
database configured, useful for quick local testing without needing MongoDB installed.
`.once("open", ...)` fires exactly once, the first time the connection succeeds; `.on("error",
...)` can fire repeatedly for any subsequent connection error.

```js
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => console.log(`Nuppu API listening on http://localhost:${PORT}`));
}
export default app;
```
The final, critical lines tying back to the whole "single serverless deployment" architecture: on
Vercel, `process.env.VERCEL` is automatically set to `"1"`, so this block is **skipped** —
Vercel's own Node runtime imports the exported `app` and invokes it per-request itself, and calling
`.listen()` in that context would be both unnecessary and could interfere with how the platform
manages the process. Anywhere else (your laptop, `npm run server`, a plain Node host per
`DEPLOYMENT.md`'s "standalone backend" alternative), `process.env.VERCEL` is unset, so this
actually starts a real HTTP server bound to `PORT`. `export default app` is what both Vercel's
runtime *and* the standalone `.listen()` call above both need — the raw Express app object.

---

## 8. Domain Logic

### [src/server/models/Payment.js](src/server/models/Payment.js)

```js
export const RETENTION_YEARS = 6;

export function computeRetentionExpiry(date = new Date()) {
  const fiscalYearEnd = new Date(Date.UTC(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
  fiscalYearEnd.setUTCFullYear(fiscalYearEnd.getUTCFullYear() + RETENTION_YEARS);
  return fiscalYearEnd;
}
```
`Date.UTC(year, 11, 31, 23, 59, 59, 999)` — month is **zero-indexed** in JS `Date`, so `11` means
December; this constructs "December 31st, 23:59:59.999 UTC of the payment's year" — i.e. the very
end of that calendar/fiscal year. `.setUTCFullYear(... + RETENTION_YEARS)` then pushes that same
instant forward exactly 6 years. Using UTC methods throughout (rather than local-time methods)
avoids any ambiguity from server timezone configuration — the retention date is always computed
against a fixed, unambiguous timezone. The file's own comment flags this as an
**assumption to confirm with the business's accountant**: it assumes a calendar-year fiscal year
(Jan–Dec); if Nuppu's real fiscal year runs differently (e.g. April–March), this one function is
where you'd change it.

```js
const paymentSchema = new mongoose.Schema(
  {
    paytrailTransactionId: { type: String, required: true, unique: true },
    paytrailReference: { type: String, required: true },
    service: { type: String, enum: ["emotional-support"], required: true },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    status: { type: String, enum: ["pending", "paid", "cancelled", "failed", "refunded"], default: "pending" },
    customerName: { type: String, required: true, maxlength: 100 },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, "..."] },
    customerPhone: { type: String, trim: true, maxlength: 20 },
    customerMessage: { type: String, required: true, trim: true, maxlength: 2000 },
    paidAt: { type: Date },
    retentionExpiresAt: { type: Date, required: true },
    anonymizedAt: { type: Date },
  },
  { timestamps: true },
);
```
`unique: true` on `paytrailTransactionId` creates a MongoDB unique index — the database itself
will reject a second document with a duplicate value, an extra safety net beyond application logic.
`enum: ["emotional-support"]` — a single-value enum today, but structured so adding a second paid
service later is just adding another string here (and a matching entry in
`SERVICE_PRICES_CENTS` in `api/index.js`). Every field that ends up holding personal data
(`customerName`, `customerEmail`, `customerPhone`, `customerMessage`) is exactly the set of fields
the anonymisation functions in Chapter 7 null out — deliberately, this schema and that logic must
stay in sync if you ever add a new personal-data field.

```js
paymentSchema.statics.computeRetentionExpiry = computeRetentionExpiry;
export const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
```
`paymentSchema.statics.X = fn` attaches `fn` as a **static method** callable as
`Payment.computeRetentionExpiry(...)` — in practice, `api/index.js` actually imports and calls the
standalone exported function directly instead, so this static attachment is available but not the
path currently used. Both a named export (`Payment`) and a default export (`export default
Payment`) are provided — `api/index.js` uses the named import (`import { Payment } from
"../src/server/models/Payment.js"`).

### [src/server/payments/paytrailClient.js](src/server/payments/paytrailClient.js)

```js
const TEST_MERCHANT_ID = "375917";
const TEST_SECRET_KEY = "SAIPPUAKAUPPIAS";
const PAYTRAIL_MERCHANT_ID = process.env.PAYTRAIL_MERCHANT_ID || TEST_MERCHANT_ID;
const PAYTRAIL_SECRET_KEY = process.env.PAYTRAIL_SECRET_KEY || TEST_SECRET_KEY;
const PAYTRAIL_API_BASE_URL = (process.env.PAYTRAIL_API_BASE_URL || "https://services.paytrail.com").replace(/\/+$/, "");

export const usingTestCredentials = PAYTRAIL_MERCHANT_ID === TEST_MERCHANT_ID && PAYTRAIL_SECRET_KEY === TEST_SECRET_KEY;
```
These test credentials (`375917` / `SAIPPUAKAUPPIAS`) are **publicly documented by Paytrail
itself** for testing (not a leaked secret) — using `||` (not `??`) here is intentional: an empty
string `""` for an unset environment variable should also fall through to the test default, and
`||` treats `""` as falsy (unlike `??`, which only falls back on `null`/`undefined`).
`.replace(/\/+$/, "")` strips any trailing slash(es) from a configured base URL, so URL
concatenation later (`` `${PAYTRAIL_API_BASE_URL}/payments` ``) never accidentally produces a
double-slash.

```js
function calculateHmac(secret, params, body = "") {
  const payload = Object.keys(params)
    .filter((key) => key.toLowerCase().startsWith("checkout-"))
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .concat(body)
    .join("\n");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
```
The exact Paytrail-documented signing algorithm: take every parameter (whether from request
headers when *creating* a payment, or query-string params when *verifying* a callback) whose key
starts with `checkout-`, sort those keys alphabetically (so both sides compute the signature over
parameters in the same deterministic order regardless of what order they originally appeared in),
turn each into a `key:value` string, join them all with newlines, append the raw request body as
one final line (empty string for GET requests, per the function's default parameter), and HMAC-SHA256
the whole thing with the shared secret. This exact recipe is why the comment in this file
specifically calls out matching Paytrail's own reference Node.js example — payment signing schemes
must match *byte-for-byte*, or Paytrail's side will reject the signature.

```js
function buildRequestHeaders(method, transactionId) {
  const headers = {
    "checkout-account": PAYTRAIL_MERCHANT_ID,
    "checkout-algorithm": "sha256",
    "checkout-method": method,
    "checkout-nonce": crypto.randomUUID(),
    "checkout-timestamp": new Date().toISOString(),
  };
  if (transactionId) headers["checkout-transaction-id"] = transactionId;
  return headers;
}
```
Builds the required `checkout-*` headers Paytrail's API expects on every request. `checkout-nonce`
being a fresh random UUID on every call prevents replay attacks (an intercepted request can't be
resent later and treated as valid, since the nonce/timestamp would be stale or already-used from
Paytrail's side).

```js
export async function createPayment(order) {
  const { stamp, reference, amountCents, description, customerEmail, customerName, successUrl, cancelUrl, callbackUrl } = order;
  if (!stamp || !reference || !amountCents || !customerEmail || !successUrl || !cancelUrl) {
    throw new Error("createPayment: missing required order fields");
  }

  const nameParts = String(customerName || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || customerName || "Customer";
  const lastName = nameParts.slice(1).join(" ") || firstName;
```
Paytrail's API wants a separate first/last name, but this app only collects one combined "name"
field from the customer — this block splits it on whitespace (`\s+` = one-or-more whitespace
characters, `.filter(Boolean)` drops any empty strings from e.g. double spaces) as a best-effort
guess. If there's only one word (e.g. a single-name customer), `lastName` falls back to being the
same as `firstName` — a pragmatic compromise rather than sending an empty last name, which
Paytrail's API might reject.

```js
  const requestBody = {
    stamp, reference, amount: amountCents, currency: "EUR", language: "EN",
    items: [{ unitPrice: amountCents, units: 1, vatPercentage: 25.5, productCode: "emotional-support-45min", description: description || "..." }],
    customer: { email: customerEmail, firstName, lastName },
    redirectUrls: { success: successUrl, cancel: cancelUrl },
    callbackUrls: { success: callbackUrl, cancel: callbackUrl },
  };

  const bodyString = JSON.stringify(requestBody);
  const headers = buildRequestHeaders("POST");
  const signature = calculateHmac(PAYTRAIL_SECRET_KEY, headers, bodyString);

  const response = await fetch(`${PAYTRAIL_API_BASE_URL}/payments`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json; charset=utf-8", signature },
    body: bodyString,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) { throw new Error(data?.message || `Paytrail create-payment failed with status ${response.status}`); }

  return { transactionId: data.transactionId, href: data.href, reference: data.reference };
}
```
Notice `callbackUrls: { success: callbackUrl, cancel: callbackUrl }` — **the same URL for both**,
because (as covered in Chapter 7) `handlePaytrailReturn` already branches internally on the actual
`checkout-status` query parameter value, so one shared webhook endpoint handles every outcome; no
need for Paytrail to call two different URLs. `vatPercentage: 25.5` is informational only — as the
code comment notes, Paytrail doesn't use it to recompute the charged `amount`, it's just metadata
for the payment record; Finland's standard VAT rate as of the time this was written. The signature
is computed over the *headers* (not the query string, since this is a POST request being made *by*
this server, not a callback being *received*) plus the raw JSON body string — and is sent as its
own `signature` header alongside the `checkout-*` headers. `.json().catch(() => ({}))` guards
against a response that isn't valid JSON at all (e.g. an upstream 502 HTML error page) — without
this, a non-JSON response would throw inside `.json()` itself, before the `!response.ok` check even
runs, producing occasionally a much more confusing error to debug.

```js
export function verifyCallbackSignature(params) {
  const { signature } = params;
  if (!signature || typeof signature !== "string") return false;

  const expected = calculateHmac(PAYTRAIL_SECRET_KEY, params, "");
  const provided = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");

  if (provided.length !== computed.length) return false;
  return crypto.timingSafeEqual(provided, computed);
}
```
The inverse operation, used by `handlePaytrailReturn` in `api/index.js`. Body is `""` here
(third argument to `calculateHmac`) because redirect/callback verification is always over
query-string parameters with no request body involved. `crypto.timingSafeEqual` is used instead of
`===` or `provided.equals(computed)` specifically to prevent a **timing attack**: a naive string
comparison returns faster the earlier a mismatch is found, which (in theory, over many repeated
attempts) leaks information about how many leading bytes were correct, letting an attacker guess a
valid signature byte-by-byte rather than needing to guess the whole thing at once.
`timingSafeEqual` always takes the same amount of time regardless of where (or whether) the buffers
differ. It requires both buffers be the same length first (hence the explicit length check just
above — passing mismatched-length buffers to `timingSafeEqual` itself throws rather than safely
returning false).

```js
export async function getPaymentStatus(transactionId) {
  /* GET request to Paytrail, signed the same way, returns Paytrail's authoritative record for one transaction */
}

export const __internal = { calculateHmac };
```
`getPaymentStatus` is exported but, as flagged by a comment at the top of `api/index.js`, **not
currently called from any route** — available for a future "admin re-syncs a payment's status
directly from Paytrail" feature, since the webhook/signature-verification flow is already
sufficient authentication for the routes that exist today. `__internal` exposes the otherwise-private
`calculateHmac` function — the double-underscore naming convention signals "this is an internal
implementation detail, exposed only for testing purposes, not part of the module's real public
API."

---

## 9. Styling System

### [src/styles/index.css](src/styles/index.css)

```css
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';
```
The one stylesheet actually imported by `main.tsx` — everything else chains in from here, in this
specific order: fonts first (so font-family names are defined before anything references them),
then Tailwind's utility classes, then the brand theme variables.

### [src/styles/tailwind.css](src/styles/tailwind.css)

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
```
`@import 'tailwindcss' source(none)` pulls in Tailwind v4's engine but with automatic source
detection disabled (`source(none)`) — instead, `@source '../**/*.{js,ts,jsx,tsx}'` explicitly tells
Tailwind exactly which files to scan for class names used in your JSX, so it knows which utility
classes to actually generate (Tailwind doesn't ship every possible utility class by default — it
generates only the ones it detects you've used, keeping the final CSS bundle small).
`tw-animate-css` adds extra animation utility classes beyond Tailwind's built-in set.

### [src/styles/theme.css](src/styles/theme.css)

```css
:root {
  --nuppu-honey: #E8C468;
  --nuppu-eucalyptus: #A8C5BA;
  ...
  --background: #FFFCF7;
  --foreground: #3A4536;
  --primary: #A8C5BA;
  ...
}
```
CSS custom properties (variables) defining the brand's color palette, plus a semantic layer
(`--background`, `--foreground`, `--primary`, etc.) mapped on top of the raw brand colors —
Tailwind's own `bg-primary`/`text-foreground` utility classes (used in a handful of places, e.g.
`ui/card.tsx`, `ui/button.tsx`) resolve to these CSS variables via the `@theme inline` block below.
**Note the majority of hand-written page components in this codebase (Home, Characters, About,
etc.) don't use these semantic classes at all — they use raw hex-color Tailwind arbitrary values
directly (`text-[#6B9AC4]`, `bg-[#A8D5E2]/20`)**, meaning the `theme.css` variable system is really
only exercised by the small shared `ui/` component library (Button, Card), not by the bulk of the
page content.

```css
.dark { --background: oklch(0.145 0 0); ... }
```
A parallel set of values under a `.dark` class selector — dark-mode overrides, following the
`@custom-variant dark (&:is(.dark *))` rule declared at the top of the file. **Nothing in this
codebase currently toggles a `.dark` class onto any element** — there's no dark-mode switch built
into the UI — so these values exist (likely inherited from the shadcn/ui template this project
started from) but are presently dormant/unused.

```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  ...
  --radius-lg: var(--radius);
}
```
This `@theme inline` block is Tailwind v4's mechanism for registering CSS variables as actual
Tailwind utility class generators — it's what makes `bg-background`, `text-primary`, `rounded-lg`
etc. valid Tailwind classes that resolve to the corresponding `--background`/`--primary`/`--radius`
custom property.

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  h1 { font-size: var(--text-2xl); font-weight: var(--font-weight-medium); line-height: 1.5; }
  ...
}
```
Base-layer defaults for raw HTML elements — meaning **any** plain `<h1>` anywhere gets this sizing
by default, but (as the comment in the file itself notes) any Tailwind utility class you add
directly to an element (`className="text-4xl"`) overrides these, because Tailwind's utility
classes are defined in a *later* CSS layer than `@layer base`. This is why page components
throughout the codebase freely write `<h1 className="text-4xl md:text-5xl ...">` and it works as
expected, overriding these element defaults without a specificity fight.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
An accessibility feature: if the visitor's OS/browser is set to "reduce motion" (a real
accessibility preference, often set by people with vestibular disorders that motion can trigger),
this **globally neutralizes every animation and transition on the page** — including all of the
`motion` library's spring/fade animations scattered throughout every page component — without
needing any per-component logic. It's a single CSS media query that overrides everything at once.

### [src/styles/fonts.css](src/styles/fonts.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');
body { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
```
Loads two Google Fonts in one request: **Poppins** (the default body font, set here) and
**Nunito** (used for headings — every heading throughout the page components explicitly sets
`style={{ fontFamily: 'Nunito, sans-serif' }}` inline rather than via a CSS class, which is why
you see that exact inline style repeated on nearly every `<h1>`/`<h2>`/`<h3>` across every page).
`display=swap` tells the browser to show fallback system fonts immediately and swap in the real
web font once it loads, rather than leaving text invisible while the font downloads (a web
performance/accessibility best practice).

---

## 10. Build, Config & Deployment Files

### [vercel.json](vercel.json)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/admin/(.*)", "destination": "/admin/index.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [ { "source": "/(.*)", "headers": [ /* HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy */ ] } ],
  "crons": [ { "path": "/api/payments/anonymize-expired", "schedule": "0 3 * * *" } ]
}
```
Three `rewrites`, checked **in order**: any `/api/...` request is routed to the Express serverless
function; any `/admin/...` request is served the admin dashboard's own `index.html` (which is a
Single Page App itself, so its *own* client-side router then takes over from there); anything else
at all falls through to the main site's `index.html` (letting *this* app's React Router handle the
path client-side — this is the production equivalent of the `adminFallback` dev-only Vite plugin
from Chapter 1). `headers` duplicates the same security headers `api/index.js` sets manually, but
applied by Vercel's edge network to the static frontend responses specifically. `crons` is Vercel's
native scheduled-job feature — it will make an HTTP GET request to the given `path` on the given
cron schedule (`"0 3 * * *"` = every day at 03:00 UTC) automatically, with an
`Authorization: Bearer <CRON_SECRET>` header Vercel adds itself once `CRON_SECRET` is set as a
project environment variable (matched by the `requireCronOrAdmin` middleware in Chapter 7).

### [.env.example](.env.example)

A fully-commented template of every environment variable the app reads, grouped by concern
(Server / Database / Admin+cron auth / Email / SMS / Paytrail / Frontend). Copy this to `.env` for
local development (`cp .env.example .env`) and fill in real values — `.env` itself is gitignored
(never committed), which is why this example file exists as the actual source of truth for "what
variables does this app need."

### [package.json](package.json) scripts, revisited

Already covered in Chapter 1 — worth reiterating here in the deployment context: `npm run build`
is exactly what Vercel runs automatically (also aliased as `vercel-build`, which some platforms
look for specifically), and it always rebuilds `admin-dashboard` first, so a production build
never ships a stale admin bundle even if you forgot to rebuild it manually beforehand.

---

## 11. Compliance Documents

### [GDPR-NOTES.md](GDPR-NOTES.md)

The team's internal Article 30 processing record — **not** the public Privacy Policy (that's
[Privacy.tsx](src/app/pages/Privacy.tsx)). Documents: exactly what payment data is collected and
why (Article 6(1)(b) contract necessity + Article 6(1)(c) legal/bookkeeping obligation), the
6-year retention/anonymisation policy and which code implements it
(`computeRetentionExpiry`/`anonymizeExpiredPayments`, Chapters 7–8), which third parties
(processors) touch personal data (Paytrail, MongoDB Atlas, Vercel, the eventual SMTP provider) and
their EU-hosting status, and a table mapping each GDPR data-subject right to the exact API route
that implements it. **Read this file before making any change to the `Payment` model, the
anonymisation logic, or anything touching customer data** — it's the record of *why* the code is
shaped the way it is, and any change to that shape should update this document too.

### [ATTRIBUTIONS.md](ATTRIBUTIONS.md)

Two lines: the `ui/` component library (`button.tsx`, `card.tsx`, `utils.ts` — Chapter 4) is built
on [shadcn/ui](https://ui.shadcn.com/) patterns under the MIT license, and all photos/character
illustrations under `src/assets/` are original Nuppu assets (not stock photography or
AI-generated — meaning full rights are held by Nuppu, no attribution or licensing obligation to
track for those specific files).

---

## 12. The Two Side Projects

Neither of these ships to the public production domain — the root `vite build` never touches
either directory (confirmed in `eslint.config.js`'s ignore list too). They're included here
because you'll likely still need to run/maintain them.

### admin-dashboard/

A small, **separate** Vite + React + TypeScript project (own `package.json`, own
`node_modules`). Its production build gets copied into `public/admin/` by the root
`build:admin` npm script (Chapter 1) and served at `your-domain/admin` in production; in local
development it can also be run completely standalone (`cd admin-dashboard && npm run dev`, its own
dev server on port 5174).

**[admin-dashboard/src/app/App.tsx](admin-dashboard/src/app/App.tsx)** — the entire dashboard in
one file. Key logic:
```tsx
const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
```
Uses `sessionStorage` (not `localStorage`) for the admin token — deliberately clears when the
browser tab closes, rather than persisting indefinitely, a reasonable precaution for a credential
that grants access to customer personal data.
```tsx
const loadData = useCallback(async (activeToken: string) => {
  const [paymentsRes, messagesRes] = await Promise.all([
    adminAPI.listPayments(activeToken, { limit: 100 }),
    adminAPI.listMessages(activeToken, { limit: 100 }),
  ]);
  ...
}, []);
```
`Promise.all` here (unlike the notification code in Chapter 7) is fine because both requests are
read-only fetches where "one failed" should reasonably abort the whole load and show an error —
different situation from firing independent notifications where partial success is meaningful.
`useCallback` memoizes this function so it has a stable identity across re-renders (used both by
the initial-mount effect and the manual "Refresh" button, without recreating a new function
instance every render).
```tsx
const unifiedMessages: UnifiedMessage[] = [
  ...messages.map((m) => ({ id: `contact-${m._id}`, ..., source: 'contact' as const, ... })),
  ...payments.filter((p) => p.customerMessage && p.customerMessage.trim()).map((p) => ({ id: `booking-${p._id}`, ..., source: 'booking' as const, ... })),
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
```
Merges two different backend collections (contact-form messages and payment bookings that included
a message) into one unified, chronologically-sorted list for display — since from the business's
perspective, both are just "a message from a prospective customer," regardless of which form it
came through. The rest of the file is a stats-tile dashboard (total bookings, revenue collected,
pending count, message count) plus two filterable/tabbed tables — same `.filter()` +
`.map()`-to-JSX-rows pattern you've already seen throughout the main site.

**[admin-dashboard/src/app/config/api.ts](admin-dashboard/src/app/config/api.ts)** — its own,
simpler API client (`adminRequest`), which always attaches `x-admin-token` from whatever token is
currently in React state, and talks to the **same backend** (`api/index.js`) as the main site —
confirmed by the file's own top comment. This is worth remembering: there's still only one
backend in this whole system; the admin dashboard is just a second frontend consuming the same
admin-only routes documented in Chapter 7.

### app-prototype/

A **much larger** standalone project — a clickable concept-validation prototype of the actual
Nuppu kids' app (stories, breathing exercises, emotion check-ins), entirely disconnected from any
real backend (no database, no auth) — everything is `localStorage`-backed via
`src/app/context/ChildContext.tsx`, so state survives a refresh during a live demo but isn't
"real" persisted user data. It reuses the marketing site's exact brand colors/fonts (Nunito for
headings, Poppins for body) so the two feel like one product when demoed together.

This project maintains its **own** detailed internal documentation —
[app-prototype/PROTOTYPE_OVERVIEW.md](app-prototype/PROTOTYPE_OVERVIEW.md) — covering its full
screen-by-screen user journey map, the Freemium/Premium business-model demo toggle
(`ChildContext.plan`), the "AI safety pipeline" concept kept visible in
`src/app/services/geminiService.ts` (pre-check → normalize → generate → post-check → fallback,
each its own function so a future real content-moderation backend has a clear seam to plug into),
age-group modeling (`AGE_GROUPS`/`AgeGroupId`), and an explicit "out of scope" list (no real
accounts, no real payments, no real AI moderation — all UI shells over `localStorage`). Read that
document directly rather than this guide duplicating it — it's already written at the right level
of detail for this specific project, and is more likely to be kept up to date by whoever works on
it next, since it lives right next to that code.

---

## 13. Suggested Learning Sequence

If you're starting from zero, here's the concrete order to actually read/run things in — each
step should take you from "I understand the previous piece" to "I understand one more piece,"
never further than that:

1. **Read Chapter 0** (Prerequisite Concepts) if any term was unfamiliar — don't skip this even
   if you feel you "sort of know React," since several patterns here (data routers, `motion`
   animations, Mongoose statics) are less common even for React developers.
2. **Run it locally.** `npm install`, `cp .env.example .env`, `npm run dev` in one terminal,
   `npm run server` in a second. Load `http://localhost:5173`, click through every page. You now
   have a mental map of *what* the app does before reading *how*.
3. **Chapter 1 → 2**: read `main.tsx` → `App.tsx` → `routes.tsx` → `Root.tsx` while the app is
   open in your browser, and match each file to what you clicked through in step 2. This is the
   skeleton everything else hangs off.
4. **Chapter 3**: read `LanguageContext.tsx`, then open both `en.json`/`fi.json` side-by-side and
   click the FI/EN toggle in the running app to see the effect live.
5. **Chapter 4**: read the shared components. `Navigation.tsx` and `CookieConsent.tsx` are the two
   worth the most attention (real logic); the `ui/` primitives are worth understanding once since
   they recur everywhere.
6. **Chapter 5, in this specific sub-order**: `Home.tsx` (learn the "static content page" pattern
   once) → skim `Characters.tsx`/`About.tsx` (recognize the same pattern, note what's different) →
   `Contact.tsx` (first real form) → `EmotionalSupport.tsx` (the most important page in the app —
   spend real time here) → skim `Privacy`/`Terms`/`Cookies`/`NotFound` (all trivial once you've
   seen the pattern).
7. **Chapter 6**: `config/api.ts` — short, but this is the seam between everything you just read
   and everything about to come next.
8. **Trigger a real request and watch it land.** With both dev servers running, submit the
   contact form, and read `POST /api/contact` in `api/index.js` (Chapter 7.6) *while* the request
   is actually happening — add a `console.log` if it helps. Seeing one request's full round trip
   makes the rest of the backend chapter click faster.
9. **Chapter 7, in this specific sub-order**: 7.1–7.2 (setup/middleware) → 7.6 (contact routes,
   the simpler feature) → **Chapter 8 first** (`Payment.js` + `paytrailClient.js` — understand the
   domain objects before the routes that use them) → back to **Chapter 7.7** (payment routes,
   now that you know what they're built on) → 7.3–7.5 (schema/helpers, which you'll now recognize
   supporting code you already saw called) → 7.8 (startup/shutdown).
10. **Walk the actual booking flow end-to-end** in a browser against Paytrail's test checkout
    (`DEPLOYMENT.md` §9 has the exact steps) — you now have every piece of code that participates
    in that flow already in your head from steps 8–9.
11. **Chapter 9–11** — styling, deployment config, and compliance docs. Lighter reading, mostly
    reference material you'll return to rather than study upfront.
12. **Chapter 12** — only once you're comfortable with the main site. These are separate projects;
    treat learning them as a second, smaller pass through the same process (run it, click through
    it, then read the one or two files with real logic).
13. **Re-read [DEPLOYMENT.md](DEPLOYMENT.md) end to end** now that every piece it references
    (Paytrail credentials, `MONGODB_REQUIRED`, the cron job, CORS/`CLIENT_URL`) is something
    you've already seen in code, not just in the abstract.

---

## 14. Common Maintenance Tasks

**Change the price of a service** → edit `SERVICE_PRICES_CENTS` in `api/index.js` (Chapter 7.7).
Nowhere else needs to change — the frontend never hardcodes a price.

**Edit any page's text** → find the relevant key in `en.json`, edit it, then make the **same**
edit in `fi.json`. There's no automated check that both files stay in sync (Chapter 3) —
double-check both before committing.

**Add a new page/route** → create `src/app/pages/NewPage.tsx` following the pattern in Chapter 5
(a function component calling `usePageMeta` and `useLanguage`), register it in `routes.tsx`'s
`children` array (Chapter 2), add a nav link in `Navigation.tsx` if it should appear in the menu,
and add its translation keys to both `en.json`/`fi.json`.

**Add a new backend route** → add it in `api/index.js` following the nearest existing pattern
(Chapter 7.6/7.7 depending on whether it needs the database), then add a matching wrapper function
in `config/api.ts` (Chapter 6) for the frontend to call it through.

**Add a second paid service** → add an entry to `SERVICE_PRICES_CENTS`, add it to the `service`
enum in `Payment.js`'s schema (Chapter 8), and update the frontend's `paymentsAPI.create`'s type
signature in `config/api.ts` to accept the new service string.

**Rotate the admin token** → generate a new one (`openssl rand -hex 32`), update `ADMIN_TOKEN` in
Vercel's environment variables, redeploy. Anyone with the old token loses access immediately (it's
a single shared secret, not per-user — Chapter 7.4).

**Check if email/SMS/Paytrail are actually configured in production** — there's no dashboard for
this; check Vercel's function logs right after a deploy for the `console.warn` lines
(`"SMS receipts disabled: ..."`, `"[paytrailClient] ... Falling back to Paytrail's published TEST
merchant credentials"`) that fire at module load if credentials are missing.

**Investigate why a payment is stuck "pending"** → per `DEPLOYMENT.md`'s troubleshooting section:
check whether the webhook (`/api/payments/callback`) is actually reaching the deployment (Vercel
function logs), and confirm `MONGODB_URI`/`MONGODB_REQUIRED` are set correctly — a pending payment
usually means either Paytrail's callback never arrived or the database write inside
`handlePaytrailReturn` silently failed.

---

## 15. Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| `/admin` 404s locally | The `adminFallback` Vite plugin isn't matching, or `admin-dashboard` was never built | [vite.config.ts](vite.config.ts) Chapter 1; run `npm run build:admin` manually |
| `/admin` 404s in production | `vercel.json` rewrites didn't deploy, or `public/admin` wasn't populated at build time | [vercel.json](vercel.json) Chapter 10; confirm `npm run build` actually ran `build:admin` |
| CORS errors in the browser console | `CLIENT_URL` doesn't exactly match the frontend's real origin (scheme + host, no trailing slash) | `allowedOrigins` in `api/index.js` Chapter 7.2 |
| Contact form "succeeds" but nothing shows up anywhere | `MONGODB_REQUIRED`/`MONGODB_URI` unset (DB write skipped) *and* SMTP unset (email skipped) — the route still returns 200 either way | Server logs for `console.warn` lines; Chapter 7.6 |
| Payment stuck on "pending" forever | Webhook not reaching the server, or DB down when the webhook did arrive | `DEPLOYMENT.md` troubleshooting; Chapter 7.7 `handlePaytrailReturn` |
| "Database is temporarily unavailable" on payments routes | `MONGODB_REQUIRED` isn't `"true"`, or `MONGODB_URI` is unreachable | Chapter 7.4 `requireDatabase` |
| A translated string shows the raw key (e.g. literally `"home.someKey"`) on screen | That key is missing from **both** `en.json` and `fi.json` | Chapter 3's `t()` fallback chain — this is by design, it's meant to be visible so you notice |
| Adding real analytics later and unsure how to respect cookie consent | `CookieConsent.tsx` currently gates nothing (no non-essential cookies exist yet) | Chapter 4; check `getStoredConsent() === "accepted"` before loading any such script — GDPR-NOTES.md flags this explicitly as a manual step |
| VS Code/TypeScript complains about an unused variable that seems used | `noUnusedLocals`/`noUnusedParameters` in `tsconfig.json` are strict; prefix genuinely-intentional-unused params with `_` | Chapter 1 |

# Nuppu App — Prototype Overview

Interactive concept-validation prototype, not a finished commercial app. Written for the Nuppu
Digital team, investors, and whichever developer or designer picks this up next.

## What this is

Nuppu is a children's emotional-skills storytelling app — calm, personalized bedtime stories
built on Social and Emotional Learning (SEL) principles, meant to help kids understand, express,
and regulate their emotions. This folder is a clickable mobile prototype of that concept, built
for concept validation and investor presentations. It's intentionally not a production-ready,
fully backended app.

It's a companion to the main marketing website (`../src`) and reuses that site's exact brand
palette, fonts, and character art direction so the two feel like one product.

Stack: React 18 + TypeScript, built with Vite. `react-router` v7 (`createBrowserRouter`) handles
navigation between screens, Tailwind CSS v4 for styling, `lucide-react` for icons. Every screen
renders inside a phone-shaped frame (`MobileScreen`) so the whole thing can be clicked through in
a normal desktop browser during a presentation.

Running it:

```bash
cd app-prototype
npm install
npm run dev      # local dev server
npm run build    # production build (tsc -b && vite build)
```

Every screen is also reachable directly from **Settings → For Presentations → View Prototype
Sitemap**, or the route `/sitemap` — useful for jumping straight to a specific screen during a
demo without replaying the whole flow.

## User journey → screen mapping

Follows the parent/system/child journey the Nuppu Digital team defined. Each phase links to the
screen(s) that implement it.

| Phase | Journey step | Screen(s) | Route(s) |
|---|---|---|---|
| 1 | App download & first launch (Nuppu the Bunny welcome, "Get started" CTA) | `Splash` | `/` |
| — | Login | `Login` | `/login` |
| — | Create account — parent name, email, phone, child's name & **age group** | `CreateAccount` | `/signup` |
| 2 & 3 | Child profile creation — avatar, interests, optional free topic (name/age group carried over from Create Account, editable here) | `AddChildProfile` | `/add-child` |
| — | Story preferences (genres, content filters, notifications) | `Preferences` | `/preferences` |
| — | Privacy confirmation (GDPR, encryption, parental control) | `PrivacyConfirmation` | `/privacy` |
| — | Micro-support concept intro for the parent | `MicroSupportTutorial` | `/tutorial` |
| — | Parent/Child dual-mode home, recommended stories | `Home` | `/home` |
| — | Pre-recorded story bank / library, search & category filters | `StoryLibrary`, `StoryDetail` | `/library`, `/story/:id` |
| 4 & 5 | Story generator activation + AI safety pipeline (pre-check → normalize → generate → post-check → fallback), visualized during loading | `EmotionSelection` | `/emotion-check` |
| 3 (calming moment) | Calming breathing exercise before the story | `BreathingExercise` | `/breathing` |
| 6 | Story experience — listen/read, TTS narration, no free text input, no AI chat | `StoryPlayback` | `/playback/:id`, `/story-playback` |
| 7 (future) | Child reflection — emotion-icon rating shown after the story (2–4 pattern); multiple-choice/reflective variants for older age groups are a documented future step, not built here | `StoryCompletion` (rating row) | `/completion/:id` |
| 8 | Parent micro-support — SEL theme, reflection question, conversation starter, practical tip; **gated by plan tier** | `StoryCompletion` | `/completion/:id` |
| — | Progress tracker (stories, skills, streaks, achievements) | `ProgressTracker` | `/progress` |
| — | Settings (micro-support frequency, profiles, notifications) | `Settings` | `/settings` |
| — | Adult Corner (see below) | `AdultCorner` + sub-screens | `/adult-corner/*` |
| — | Dev/demo helper — jump to any screen | `Sitemap` | `/sitemap` |

The flow chart in one line, as implemented:
`Splash → Login → Add Child Profile (incl. age group) → Preferences → Privacy →
Micro-Support Tutorial → Home → Story Library/Emotion Check → AI safety pipeline →
Breathing → Story Playback → Story Completion (child reflection + parent micro-support) →
Home / new story`

## Adult Corner

Per the client's journey document, a parent-only "Adult Corner" is reachable **without**
finishing the full child-profile flow — it's linked directly from the `Login` screen ("much
easier access"), and also from `Home` (shield icon, parent mode) and `Settings`.

| Section | Screen | Route |
|---|---|---|
| Hub / entry point | `AdultCorner` | `/adult-corner` |
| Subscription management (Freemium vs. Premium, live plan toggle for demos) | `Subscription` | `/adult-corner/subscription` |
| Add / switch child profile | reuses `AddChildProfile` | `/add-child` |
| Expert micro-support tip library, grouped by topic | `MicroSupportLibrary` | `/adult-corner/tips` |
| About Nuppu — why it exists, SEL grounding, how AI is used safely, privacy | `AboutNuppu` | `/adult-corner/about` |
| Monthly Nuppu Letter — theme of the month, expert tip, encouragement | `NuppuLetter` | `/adult-corner/letter` |
| Feedback, theme suggestions, content reports | `Feedback` | `/adult-corner/feedback` |

This prototype only supports a single child profile end-to-end (stored in `localStorage`). "Add /
switch profile" currently reuses the same profile-editing screen as a placeholder for that future
multi-profile flow.

## Business model demo (Freemium / Premium)

The client's pricing brief defines two tiers: **Freemium — €4.99/month** (Nuppu the Bunny
narrator only, no personalization, shorter stories at 2–3 min, no parent micro-support content)
and **Premium — €6.99/month** (personalized stories, 5–7 min, parent micro-support content
unlocked).

Rather than just describing this in a document, the prototype makes it demonstrable: `Adult
Corner → Subscription & Plan` has a live toggle (`ChildContext.plan`, persisted to
`localStorage`) that a presenter can flip mid-demo. On `StoryCompletion`, the parent
micro-support block (SEL theme + reflection question + conversation starter + practical tip)
shows in full under Premium, and gets replaced with an "Unlock Premium" upsell card under
Freemium — so the value difference between tiers is something you click through, not just read
about.

## AI safety pipeline (kept visible, not hidden)

The client's spec defines a 5-step safety pipeline for any AI-assisted story: pre-check →
normalization → locked-prompt generation → post-check → manual fallback. Real content moderation
is out of scope for a prototype, but the shape of that pipeline stays visible in two places so it
survives into a real backend later:

- `src/app/services/geminiService.ts` implements each stage as its own small function
  (`preCheckTopic`, `normalizeTopic`, `postCheckContent`, prompt building, fallback story), so a
  developer wiring up real moderation later has a clear seam to plug into per stage.
- `EmotionSelection` visualizes the pipeline while a story is generating (cycling through
  "Pre-check → Normalization → AI generation → Post-check"), which also communicates to
  parents/investors that content isn't just "sent straight to AI."

The child never gets a free-text or chat input anywhere in the app — the only optional free text
is the parent-entered "topic" field during profile setup, which is explicitly labelled as
reviewed/normalized and never starts a conversation with AI.

## Age groups

Per client direction, age is collected as a **group**, not an exact age (age is anonymized from
the start):

| Group | Range | Positioning |
|---|---|---|
| Little Nuppu | 2–4 | Short, calm stories and emotional moments — this prototype's primary focus |
| Big Nuppu | 5–8 | Stories about friendship, courage, and everyday situations |
| Super Nuppu | 9–12 | Deeper stories and reflections about emotions |

Defined in `src/app/context/ChildContext.tsx` (`AGE_GROUPS`, `AgeGroupId`). Existing
`localStorage` data saved under the old numeric-age model is migrated automatically on load.

## Design system

The prototype intentionally reuses the **live website's exact brand colors** (see
`../src/app/pages/Home.tsx` and `../src/app/pages/Characters.tsx`) so the app and the marketing
site read as one product:

| Token | Hex | Use |
|---|---|---|
| `nuppu-blue-deep` | `#6B9AC4` | Primary buttons, links, active states |
| `nuppu-blue-light` | `#A8D5E2` | Primary gradient partner, light backgrounds |
| `nuppu-mint` | `#B8DDB8` | Secondary buttons, calm accents |
| `nuppu-lavender` | `#D4C5F9` | Nuppu (bunny) character color, soft backgrounds |
| `nuppu-butter` | `#F9E5A8` | Warm accents, story/emotion screens |
| `nuppu-peach` | `#FFD4C4` | Warm accents, story/emotion screens |
| `nuppu-muru-gold` | `#E8C468` | Muru (bear) character accent |
| `nuppu-hippu-sage` | `#B8D4C7` | Hippu (cat) character accent |
| `nuppu-lumo-coral` | `#F5B5A8` | Lumo (fox) character accent |
| `nuppu-dark-text` / `secondary-text` / `gray-text` | `#2D3748` / `#4A5568` / `#718096` | Text hierarchy |

Defined in `src/styles/theme.css` as CSS variables mapped into Tailwind (`bg-nuppu-*`,
`text-nuppu-*`, etc.) — matching the same variable pattern used on the website
(`../src/styles/theme.css`). Headings use **Nunito**, body text uses **Poppins**, both loaded
from Google Fonts, matching the website's typography exactly.

## Data model

`src/app/context/ChildContext.tsx` holds all prototype state, persisted to `localStorage` so a
demo survives a refresh:

- `childData` — name, age group, avatar, interests, optional topic
- `plan` — `'freemium' | 'premium'`, drives the Story Completion gating described above
- `currentEmotion`, `currentStory`, `generatedStories` — the active emotion check-in and
  AI-generated story history

`src/app/services/geminiService.ts` generates stories against the Gemini API when an API key is
configured, and **always** has a hand-written fallback story so the demo never breaks without
network/API access — this fallback isn't an error state, it's a designed part of the safety
pipeline above.

## Out of scope (per client brief)

This is a concept-validation prototype, not a finished commercial app. Deliberately not built:

- Real user accounts / authentication (Login is a UI shell with client-side validation only)
- Multiple child profiles (single profile, `localStorage`-backed)
- Real payments/subscription billing (Subscription screen is a UI demo toggle)
- Real content moderation behind the AI safety pipeline (structure only, see above)
- Age-appropriate reflection variants for Big/Super Nuppu (multiple-choice, reflective
  questions) — flagged by the client as future work; only the 2–4 emotion-icon pattern is built
- A real backend, database, or API beyond the optional Gemini story-generation call

## Next steps

- Wire `AddChildProfile` → "Add / switch profile" to a real multi-profile list once the product
  needs more than one child per account
- Build the Big Nuppu / Super Nuppu reflection variants (multiple-choice, reflective
  choice-based) once age-tailored content exists
- Replace the safety-pipeline stub functions in `geminiService.ts` with real moderation calls
  when a backend exists
- Connect `Subscription` to real billing once a payment provider is chosen

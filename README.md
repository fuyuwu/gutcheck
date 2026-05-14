# Gutcheck 🥗

> Track your meals, weight, and body stats — built for Taiwan.

Gutcheck is a lightweight personal food and body tracker designed to fix what MyFitnessPal gets wrong for Taiwanese users — fuzzy food search, flexible portion sizes, and a tag system that actually makes sense.

---

## Why Gutcheck?

Most food trackers assume you eat at chain restaurants with standardized portions. Gutcheck is built around how people in Taiwan actually eat:

- **Fuzzy search** — type "雞" and find everything chicken-related across your entire food database
- **Tag system** — tag meals with things like `低醣`, `可換地瓜`, `素食` and filter by them later
- **Flexible portions** — log 0.25 of a serving when you only eat a quarter of your yogurt
- **Self-built food database** — add local dishes with proper fields (name, brand, calories, unit) instead of free-form chaos
- **Body stats tracking** — log weight, sleep quality, and water intake alongside your meals

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Vue 3.5 + TypeScript |
| Build Tool | Vite 6 |
| State Management | Pinia (Setup Store) |
| Routing | Vue Router 4 |
| Styling | Tailwind CSS v4 (PostCSS) |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

## Vue 3 APIs Used

- `ref` / `reactive` / `computed` — reactive state and derived values across all stores
- `watch` — auto-persist settings to localStorage on change
- `Composables` — `useWaterTracker`, `useToast` encapsulate reusable logic (replacing Vue 2 mixins)
- `Pinia Setup Store` — `useFoodLog`, `useBodyStats`, `useSettings`, `useFoodDB`
- `Teleport` — modal and toast rendered outside component tree to avoid z-index issues
- `TransitionGroup` — animated food entry list (slide in / slide out)
- `defineAsyncComponent` — lazy-load chart components on the Trend page
- `provide / inject` — global theme and user settings passed down without prop drilling

---

## Project Structure

---

## Getting Started

```sh
npm install
npm run dev
```

### Build for Production

```sh
npm run build
```

### Run Unit Tests

```sh
npm run test:unit
```

### Run E2E Tests

```sh
npx playwright install
npm run test:e2e
```

---

## Live Demo

[gutcheck.vercel.app](https://gutcheck.vercel.app)

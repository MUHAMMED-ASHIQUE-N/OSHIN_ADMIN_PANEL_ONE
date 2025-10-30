## Quick orientation — what this repo is

This is a React + TypeScript + Vite admin panel that uses Tailwind for styling and Zustand for client state.
Key directories:
- `src/components` — UI primitives and layout (see `components/layout/*` for `Layout`, `Header`, `Sidebar`).
- `src/pages` — route pages (lazy-loaded in `src/App.tsx`).
- `src/stores` — Zustand stores that hold most app state and side-effectful API calls (`authStore`, `analyticsStore`, `filterControlStore`, etc.).
- `src/context` — small React contexts (e.g. `ChartContext.tsx`).

## Big picture architecture and data flow
- Routing and pages: `src/App.tsx` defines routes and role-based guards (via `ProtectedRoute`). Pages are lazy-loaded with `React.Suspense`.
- Global state: Zustand stores are the primary cross-component communication mechanism. Stores are imported as hooks (e.g. `useAuthStore`, `useAnalyticsStore`). Some code calls `.getState()` directly when it needs synchronous access (e.g. `useFilterStore.getState()` in redirects).
- API integration: stores perform axios requests using the environment variable `VITE_API_URL` (e.g. `src/stores/*`). Auth token is read from `useAuthStore.getState().token` and attached to requests.
- UI composition: `Layout` composes `Nav`, `Header`, `Sidebar` and an `<Outlet/>` for page content; `Sidebar` lists composites/questions filtered by `category` from `useFilterStore`.

Why it’s structured this way:
- Zustand keeps components thin — stores encapsulate fetching and transformation logic (see `analyticsStore.ts` for complex fetch/format logic).
- Lazy routes + Suspense speeds initial load and keeps per-page bundle sizes small.

## Project-specific conventions and patterns (do not invent alternatives)
- Store naming: hooks are named `use<Name>Store` and export actions/state directly. Use both hook usage and direct `getState()` when codebase does so (examples: `useFilterStore.getState()`, `useAuthStore.getState().token`).
- Categories: `useFilterStore` uses `category` with values like `'room'` or `'f&b'` — many lists and APIs are filtered by this value.
- API endpoints: many store methods expect backend endpoints following patterns in `analyticsStore.ts` (e.g. `/analytics/composite-over-time`, `/analytics/question-averages`). Some comments note missing backend endpoints — watch for `// ⚠️ NEW BACKEND ENDPOINT NEEDED ⚠️` in `src/stores/analyticsStore.ts`.
- Persisted auth: `authStore` uses `zustand/persist` — token/user are stored in localStorage under `auth-storage`.
- UI behavior: Sidebar selection and URL are source-of-truth synchronized — prefer navigation to `/view/:itemId` and then let `Layout` fetch based on the URL id.

## Important files to consult for behavior examples
- Routing & guards: `src/App.tsx` (IndexRedirect logic, role-based `ProtectedRoute`).
- Layout & navigation: `src/components/layout/Layout.tsx`, `Header.tsx`, `Sidebar.tsx`.
- Stores & API: `src/stores/analyticsStore.ts`, `src/stores/authStore.ts`, `src/stores/compositeStore.ts`, `src/stores/filterControlStore.ts`.
- Chart context: `src/context/ChartContext.tsx` (default chart type and hook `useChart`).
- Build/config: `package.json`, `vite.config.ts`, `tsconfig.app.json` and `tsconfig.node.json` (project uses project references via `tsc -b`).

## Developer workflows / commands
- Install deps: `npm install` (uses `package.json` with Vite + React + TypeScript + Tailwind + zustand).
- Dev server: `npm run dev` → starts Vite with HMR. Use this for development and debugging UI issues.
- Build: `npm run build` → runs `tsc -b` (project references) then `vite build`.
- Preview production build: `npm run preview`.
- Lint: `npm run lint` (runs `eslint .`).

Environment variables
- Required: `VITE_API_URL` — used by all API-calling stores. Set in `.env` or your shell before running dev/build.

Common pitfalls & quick fixes
- Missing token: API calls read token from `useAuthStore.getState().token`. If `null`, many store actions early-return and set `error`. For local dev, set a test token in the persisted store or log in via the `/login` route.
- Backend contract mismatch: `analyticsStore.ts` contains TODOs for backend endpoints. If responses shape differs, adjust parsing in that store (it contains robust guards and logs you can follow).
- Not seeing changes: Vite HMR will reload but TypeScript project references require rebuilding if you change `tsconfig.*` or project-level types (`npm run build` to validate).

Examples to copy/paste when editing or adding features
- Use state + action pattern in new stores:
  - const token = useAuthStore.getState().token; // attach to axios headers
  - set({ isLoading: true }); try { const r = await axios.get(`${BASE_URL}/...`, { headers: { Authorization: `Bearer ${token}` } }); set({ data: r.data.data, isLoading: false }); } catch (err) { set({ error: 'msg', isLoading: false }); }
- When adding a new route: add lazy import in `src/App.tsx` and mount under the proper `ProtectedRoute` role.

Edge cases documented in code
- `compositeStore.fetchComposites()` filters out a specific _id — see `src/stores/compositeStore.ts` (id: `68e91d12c5c21b687f910057`). Search before bulk-changing the composite list logic.
- `analyticsStore.fetchAnalyticsData` is defensive: it logs missing data and sets empty arrays rather than throwing — follow its pattern when transforming API responses.

If you need more context
- Read `src/App.tsx` and `src/components/layout/Layout.tsx` first — they show the top-level state flows (category → lists → URL → analytics fetch).
- Grep for `.getState()` usages in `src/stores` if you want synchronous state access patterns.

Thanks — I added this file to help AI contributors get productive quickly. Tell me any sections that are unclear or if you want more examples (e.g., a sample API response shape or a small unit test template).

---
name: Atlas search + theory pages
overview: Add fuzzy search and a scalable explorer UI that works well on mobile, with dedicated theory pages and case-insensitive, readable URLs derived from your Title-Case IDs.
todos:
  - id: route-theory-page
    content: Add `/:id` route and implement `TheoryPage` that resolves ID case-insensitively and renders full theory + back-to-explorer buttons.
    status: completed
  - id: fuzzy-search-util
    content: Implement `fuzzySearch` utility that supports prefixes, substrings, token similarity, and typo tolerance; return ranked results.
    status: completed
  - id: explorer-panel
    content: Refactor explorer controls into reusable `ExplorerPanel` and use it in home and drawer/sidebar modes.
    status: completed
  - id: header-search
    content: Add header search input with dropdown results powered by the fuzzy search util; navigate to theory page on select.
    status: completed
  - id: mobile-drawer-desktop-sidebar
    content: Implement mobile drawer + desktop collapsible sidebar behavior for the explorer panel.
    status: completed
  - id: url-state
    content: Persist explorer search + filters in URL query params on home for shareable state.
    status: completed
  - id: changelog
    content: Add a new WIP changelog entry describing the search + theory page + mobile explorer update.
    status: completed
isProject: false
---

## Goals
- Make **selecting** an ATLAS entry distinct from **reading** it (especially on mobile).
- Add **fuzzy search** (Wikipedia-like) available in both the header and explorer.
- Introduce dedicated **theory pages** at `/<Title-Case-id>` (case-insensitive resolution).
- Keep explorer controls (Search, Composite filter, Ontological scale filter, Matching frameworks) as a reusable panel that can be a **drawer on mobile** and a **collapsible sidebar on desktop**.

## Key files to change / add
- Routing
  - [`c:/vagrant/ATLAS/atlas-frontend/src/App.tsx`](c:/vagrant/ATLAS/atlas-frontend/src/App.tsx): add a new route for theory pages.
  - Add [`c:/vagrant/ATLAS/atlas-frontend/src/pages/TheoryPage.tsx`](c:/vagrant/ATLAS/atlas-frontend/src/pages/TheoryPage.tsx): full theory display + “Back to Explorer” buttons linking to `/#explorer`.
- Explorer UX
  - Refactor [`c:/vagrant/ATLAS/atlas-frontend/src/pages/ExplorerPage.tsx`](c:/vagrant/ATLAS/atlas-frontend/src/pages/ExplorerPage.tsx): turn it into a **home page** with explanation + an explorer panel; selecting a result navigates to the theory page instead of rendering the entire detail view inline.
  - Add a reusable explorer panel component:
    - [`c:/vagrant/ATLAS/atlas-frontend/src/components/ExplorerPanel.tsx`](c:/vagrant/ATLAS/atlas-frontend/src/components/ExplorerPanel.tsx): search input, composite slider, ontological filter, matching results list.
    - [`c:/vagrant/ATLAS/atlas-frontend/src/components/ExplorerDrawer.tsx`](c:/vagrant/ATLAS/atlas-frontend/src/components/ExplorerDrawer.tsx): mobile drawer wrapper (Radix Dialog/Drawer pattern) that contains `ExplorerPanel`.
- Header search
  - [`c:/vagrant/ATLAS/atlas-frontend/src/components/Header.tsx`](c:/vagrant/ATLAS/atlas-frontend/src/components/Header.tsx): add a search bar with dropdown results; selecting navigates to the theory page.
- Fuzzy search
  - Add [`c:/vagrant/ATLAS/atlas-frontend/src/utils/fuzzySearch.ts`](c:/vagrant/ATLAS/atlas-frontend/src/utils/fuzzySearch.ts): client-side scoring + ranking.

## URL + ID resolution
- **Slug source**: use your **Title-Case IDs** (you said you already removed `atlas-eval-` and updated IDs to be URL-slug-like).
- Implement a resolver that matches the route param case-insensitively:
  - normalize both sides (trim, lower-case, convert spaces/underscores to `-`, collapse multiple dashes).
  - find evaluation where `normalize(e.id) === normalize(routeParam)`.
- Optional nicety: if user visits a non-canonical casing, we can `navigate()` to the canonical `/${evaluation.id}`.

## Fuzzy search behavior
- Search over a concatenation of key fields per record:
  - `framework_name`, `specific_claim`, and `id` (and optionally `metadata.tags`).
- Implement a lightweight fuzzy score:
  - **prefix/substring bonus** (so `"cos"` hits Cosmological Idealism strongly)
  - **token similarity** (split on spaces/dashes)
  - **edit-distance tolerance** for typos (`"intellligent"` → Intelligent)
  - return sorted results with a small minimum threshold; with only 10 items we’ll bias toward being permissive.

## UI structure changes
- Home (`/`)
  - top section: “What ATLAS is” explanation.
  - explorer section anchored with `id="explorer"`.
  - on mobile: explorer controls in a **drawer**; results visible after opening, and selecting navigates away to theory page.
  - on desktop: explorer can be a **collapsible sidebar**.
- Theory page (`/:id`)
  - search bar at top (same component as header search, or reused explorer panel search input).
  - full evaluation view (reuse `ScoreTriptych` + `EvaluationDetail`).
  - buttons near top and bottom: “Back to Explorer” → `/#explorer`.

## State + sharing
- Keep search/filter state in the URL query string on `/` (e.g. `/?q=cos&range=-5,10&scale=all`) so it’s shareable and persists on refresh.
- Header search operates independently but uses the same fuzzySearch + navigation.

## Mobile-first details
- Ensure the results dropdown and drawer are touch-friendly:
  - large hit targets
  - scroll locking in drawer
  - close-on-select
  - keyboard navigation where possible (Radix helps).

## Changelog discipline
- After implementing, append a `# WIP` entry in [`c:/vagrant/ATLAS/atlas-frontend/CHANGELOG.md`](c:/vagrant/ATLAS/atlas-frontend/CHANGELOG.md) per your new rule.
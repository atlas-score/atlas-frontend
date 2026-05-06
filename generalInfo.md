# General information — how this ATLAS frontend was created

This document describes, in detail, how the static ATLAS explorer was put together: inputs, tooling decisions, file structure, and how each major piece maps to the design specification. It is meant for maintainers and anyone extending the UI or data pipeline.

---

## 1. Starting inputs

Three artefacts defined the work:

1. **`design.md`** — Brand and UI specification: Tailwind colour tokens, background gradients, box shadows, typography roles, layout wireframe (header → hero → SES/ETS/EIS triptych → ontological indicator → cards), component sketches (`ScoreTriptych`, `TheoryCard`, `ScoreBadge`, `OntologicalScale`), JSON feed shape, and a table mapping **Radix** primitives to ATLAS usage (Select, Slider, Tabs, Tooltip, Popover, Separator, Dialog).

2. **`atlas-score-examples.json`** — A versioned feed (`schema_version`, `description`, `examples[]`) where each example is a full evaluation: `framework_name`, `specific_claim`, `ets` / `ses` / `eis` (each with `score`, `label`, `justification`, and optional fields), `composite_score`, `score_calculation`, `override_status`, `interpretation`, `additional_analysis`, `metadata`, etc.

3. **`atlas-evaluation-schema.json`** — JSON Schema describing required fields, enums (e.g. `framework_status`, `claim_type`, ETS `closure_status`), score ranges, and the meaning of `additional_analysis` keys. This was used to derive **TypeScript interfaces** so the app treats records consistently, even though the runtime does not validate JSON against the schema automatically.

---

## 2. Toolchain choice

**Vite + React + TypeScript** was chosen because:

- Fast local dev and a simple **`npm run build`** path to static files in **`dist/`**, suitable for any static host (S3, Netlify, GitHub Pages with correct `base`, nginx, etc.).
- First-class **JSON import** so `atlas-score-examples.json` is bundled as a module without a custom fetch layer for the default demo.
- **`base: './'`** in `vite.config.ts` so asset URLs and `import.meta.env.BASE_URL` work when the site is not deployed at the domain root.

**Tailwind CSS v3** was configured by transcribing **`design.md` §2** into `tailwind.config.js`: `colors.atlas.*`, `backgroundImage`, `boxShadow`, `fontFamily`, and `borderRadius` extensions. Global animations from **§9** were added in `src/index.css` (`@tailwind` layers plus `@keyframes` for glow pulse, bar fill, and hero shimmer utility classes).

**Radix UI** primitives were added per the design mapping: unstyled, accessible building blocks styled with Tailwind. There is no `react-badge` package in Radix; “badge” behaviour is plain elements with Tailwind, while **Popover** attached to compact badges supplies the “definition on demand” pattern.

---

## 3. Step-by-step construction narrative

### Phase A — Project skeleton

1. Created **`package.json`** with React 19, React DOM, Vite 6, `@vitejs/plugin-react`, TypeScript, Tailwind, PostCSS, Autoprefixer.
2. Added **`index.html`** with Google Fonts links matching **design.md §6** (Inter, JetBrains Mono; Rajdhani included for display class).
3. Added **`src/main.tsx`** mounting `<App />` inside `StrictMode`, importing **`src/index.css`**.
4. Added **`src/vite-env.d.ts`** for Vite client types.

### Phase B — Design tokens and global CSS

1. Copied the **`tailwind.config.js`** block from design §2.1 (with `content` globs for `./index.html` and `./src/**/*`).
2. Implemented **`src/index.css`** with `@tailwind base/components/utilities` and the keyframe utilities referenced in the design (`.atlas-glow-pulse`, `.atlas-bar-fill`, `.atlas-hero-shimmer`).

### Phase C — Types and score presentation helpers

1. **`src/types/evaluation.ts`** — Manually aligned with **`atlas-evaluation-schema.json`**: `AtlasEvaluation`, nested `SubscaleBlock`, `ScoreCalculation`, `OverrideStatus`, `AdditionalAnalysis`, `ExamplesFeed`, and `OntologicalScale` union for the five bands.

2. **`src/utils/scoreColor.ts`** — Ported **`getETSPillClass`** logic from design §4.3 (ETS-specific pill backgrounds and borders). Added **`getSecondaryPillClass`** for SES/EIS panels where the design only showed ETS explicitly. **`getCompositeBarWidth`** implements the documented formula mapping composite \[-5, 10\] to a bar percentage. **`formatSigned`** formats integers with a leading `+` for positives.

3. **`src/lib/cn.ts`** — `clsx` + `tailwind-merge` helper for conditional class names on interactive states.

### Phase D — Components (design §5)

Components were implemented to mirror the spec’s structure and class names as closely as practical:

| Component | Design reference | Notes |
|-----------|------------------|--------|
| `Header` | §5.6 | Sticky bar, logo from `public/`, nav; **Dialog** for About |
| `EvaluationSelect` | Radix Select + §8 | Dark-themed trigger, viewport, items |
| `CompositeRangeSlider` | Radix Slider + §8 | Two thumbs, composite −5…10 |
| `OntologicalScaleBar` | §5.5 | Dual mode: filter tabs vs passive “active scale” display |
| `TheoryCard` | §5.3 | Top accent by ETS, tags, mini badges, composite bar |
| `ScoreBadge` | §5.4 + Popover | Popover with short blurbs for ETS/SES/EIS |
| `ScoreTriptych` | §5.2 | Three panels; **Tooltip** on each for justification; **Separator** between panels |
| `EvaluationDetail` | Narrative + scoring | **Tabs** for Overview / Scoring / Triggered analysis |

### Phase E — Application shell and state

**`src/App.tsx`**:

- Casts imported JSON to **`ExamplesFeed`**.
- **State**: `selectedId`, `scaleFilter` (`'all'` or one `OntologicalScale`), `compositeRange` tuple for the slider.
- **`useMemo`** filters `examples` by composite range and ontological scale.
- **Layout**: CSS grid — narrow column (select, slider, filter, scrollable cards), wide column (hero, ontological bar for current record, triptych, detail tabs).
- Wraps the tree in **`Tooltip.Provider`** so triptych tooltips work.

Edge behaviour: the **select** lists all evaluations so you can always jump to one; the **card list** respects filters. If the current selection is outside the filter band, an inline notice explains that filters hide the card.

### Phase F — Assets

**`public/atlas-logo.svg`** — Minimal vector mark so the header does not depend on an external logo file.

---

## 4. Radix ↔ behaviour matrix (implementation)

| Radix package | Where used | Role |
|---------------|------------|------|
| `@radix-ui/react-select` | `EvaluationSelect` | Choose evaluation by id |
| `@radix-ui/react-slider` | `CompositeRangeSlider` | Range filter on composite |
| `@radix-ui/react-tabs` | `EvaluationDetail` | Switch narrative / scoring / analysis |
| `@radix-ui/react-tooltip` | `ScoreTriptych` | Long justifications on hover/focus |
| `@radix-ui/react-popover` | `ScoreBadge` | Scale definitions |
| `@radix-ui/react-separator` | `ScoreTriptych` | Visual dividers between panels |
| `@radix-ui/react-dialog` | `Header` | About / help modal |

Focus rings follow **design.md §10** (`ring-atlas-bloom`, `ring-offset-atlas-void` / `atlas-deep` where appropriate).

---

## 5. Content and documentation files

- **`README.md`** — Operator-focused: install, scripts, layout table, data notes, pointer to **`generalInfo.md`**.
- **`LICENSE.md`** — License terms (legal text). Also see **`LICENSE-AI-Summary.md`** for a plain-English overview (not legally binding).
- **`generalInfo.md`** (this file) — Maintainer-focused build narrative.
- **In-app copy** — The collapsible **Guide** block (`ExplorerGuide` in `src/components/ExplorerGuide.tsx`) uses native `<details>` / `<summary>` so no extra Radix dependency is required; it summarises usage, score semantics, and where README / generalInfo / design files live. The **About** dialog in the header and the page **footer** add narrative on static hosting, override rules, and the same documentation pointers (the production `dist/` bundle does not include `.md` files unless you copy them in your deploy pipeline).

---

## 6. Build output and deployment

`npm run build` emits:

- `dist/index.html`
- `dist/assets/*` (hashed JS/CSS)
- Everything from **`public/`** copied as static files (e.g. `atlas-logo.svg`)

To publish **README.md** or **generalInfo.md** alongside the built site, add a CI step or Vite plugin to copy them into `public/` (or `public/docs/`) before build, or host the repository README separately (e.g. GitHub).

---

## 7. Possible extensions (not implemented)

- Fetch examples from an API at runtime instead of bundling JSON.
- JSON Schema validation (e.g. Ajv) in dev or CI.
- Route per evaluation (`/eval/:id`) with React Router for deep links.
- `vite-plugin-md` or MDX for editable in-repo help pages served as routes.

---

## 8. Version note

This narrative matches the repository layout and dependencies at the time **`generalInfo.md`** was authored. Bump versions in **`package.json`** as you upgrade Vite, React, or Radix; re-run **`npm run build`** after major upgrades to confirm compatibility.

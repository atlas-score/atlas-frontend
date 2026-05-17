# ATLAS Platform — Design System

> **A Non-Reductionist Philosophy Theory Evaluation System**
> Frontend: React + Tailwind CSS + Radix UI | Data: JSON feed

---

## 1. Brand Identity & Visual Language

ATLAS communicates **cosmic authority, rigorous depth, and intellectual weight**. The colour system follows the **NRP brand palette**: muted purple as the primary brand colour, deep accent purple for depth, teal and sky blue as secondary accents, and a neutral grey scale for surfaces and typography.

**Design principles:**
- Dark-first (Night theme): Surfaces build from near-black neutrals through accent purple into NRP purple highlights.
- Glow > Shadow: Use soft purple and sky-blue glows on interactive elements instead of heavy drop shadows.
- Precision type: **Arial Black**, all caps, for headings; **Arial** regular for body. Score numbers stay prominent (monospace stack).
- Structured hierarchy: Scores are the star. Everything else supports context around them.
- Scale awareness: The three sub-scores (SES, ETS, EIS) always appear together as a unit.

---

## 2. Colour Palette

### 2.1 NRP source palette (brand chart)

These are the canonical brand colours. They are exposed as CSS custom properties on `:root` in `src/index.css` and mapped into `atlas-*` theme tokens per theme mode.

| Role | Name | Hex | CSS variable |
|---|---|---|---|
| Primary | NRP Purple | `#7a6bab` | `--nrp-purple` |
| Secondary | Teal | `#086783` | `--nrp-teal` |
| Secondary | Sky blue | `#039ad2` | `--nrp-sky` |
| Accent | Deep purple | `#40216d` | `--nrp-accent` |
| Neutral | Mid grey | `#646365` | `--nrp-neutral-mid` |
| Neutral | Light grey | `#bfbfbf` | `--nrp-neutral-light` |
| Neutral | Off-white | `#f7f7f7` | `--nrp-neutral-pale` |
| Neutral | Near black | `#101010` | `--nrp-neutral-black` |
| Neutral | Charcoal | `#383838` | `--nrp-neutral-charcoal` |

### 2.2 Theme implementation

Runtime colours live in `src/index.css` under `html[data-theme='night']` and `html[data-theme='day']`. Tailwind references them via CSS variables in `tailwind.config.js` (e.g. `atlas-brand: 'var(--color-atlas-brand)'`).

**Night theme mapping (summary):**

| Token | Hex | NRP basis |
|---|---|---|
| `atlas-space` | `#101010` | Neutral black |
| `atlas-void` | `#181618` | Black + purple undertone |
| `atlas-deep` | `#2a183f` | Accent purple (darkened) |
| `atlas-mid` | `#342052` | Elevated panels |
| `atlas-rich` | `#40216d` | Accent purple |
| `atlas-brand` | `#7a6bab` | NRP Purple |
| `atlas-vivid` | `#039ad2` | Sky blue (interactive) |
| `atlas-border` | `#7a6bab` | NRP Purple |
| `atlas-border-glow` | `#039ad2` | Sky blue |

**Day theme mapping (summary):**

| Token | Hex | NRP basis |
|---|---|---|
| `atlas-void` / surfaces | `#f7f7f7` | Off-white |
| `atlas-white` (text) | `#101010` | Near black |
| `atlas-brand` | `#7a6bab` | NRP Purple |
| `atlas-vivid` | `#086783` | Teal |
| `atlas-border` | `#bfbfbf` | Light grey |

### 2.3 Tailwind CSS configuration (`tailwind.config.js`)

```js
// tailwind.config.js — colours resolve from CSS variables in src/index.css
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          space: 'var(--color-atlas-space)',
          void: 'var(--color-atlas-void)',
          deep: 'var(--color-atlas-deep)',
          mid: 'var(--color-atlas-mid)',
          rich: 'var(--color-atlas-rich)',
          brand: 'var(--color-atlas-brand)',
          bright: 'var(--color-atlas-bright)',
          vivid: 'var(--color-atlas-vivid)',
          glow: 'var(--color-atlas-glow)',
          bloom: 'var(--color-atlas-bloom)',
          // … see tailwind.config.js for full list
        },
      },
      fontFamily: {
        display: ['"Arial Black"', 'Arial', 'sans-serif'],
        body: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
};
```

Composite and sub-scale accent ramps in `src/utils/scoreColor.ts` interpolate through the NRP purple → accent → sky blue range for positive scores.

---

## 3. Colour Reference Table (Night theme)

| Token | Hex | Usage |
|---|---|---|
| `atlas-space` | `#101010` | Page background base (darkest) |
| `atlas-void` | `#181618` | Primary page background |
| `atlas-deep` | `#2a183f` | Default card/panel background |
| `atlas-mid` | `#342052` | Elevated panels, hover states |
| `atlas-rich` | `#40216d` | Active/selected panels (accent purple) |
| `atlas-brand` | `#7a6bab` | Core brand purple (NRP Purple) |
| `atlas-bright` | `#8d82b8` | Lighter brand (pill fills) |
| `atlas-vivid` | `#039ad2` | Primary interactive accent (sky blue) |
| `atlas-glow` | `#7a6bab` | Border glows, icon fills |
| `atlas-bloom` | `#9a8fc4` | Focus rings, aura effects |
| `atlas-white` | `#ffffff` | Primary text on dark |
| `atlas-bright-text` | `#f7f7f7` | Near-white body emphasis |
| `atlas-muted` | `#bfbfbf` | Secondary text, descriptions |
| `atlas-label` | `#9a8fc4` | Labels, captions |
| `atlas-dim` | `#646365` | Disabled / placeholder |
| `atlas-border` | `#7a6bab` | Default borders |
| `atlas-border-glow` | `#039ad2` | Active/highlighted borders |
| `atlas-debunked` | `#101010` | Debunked score pill |
| `atlas-proven-pill` | `#646365` | Proven legend swatch (grey) |

---

## 4. Scoring System — Visual Spec

The ATLAS score is composed of **three sub-scales** rendered as a unit. Each sub-scale displays its score label and numeric value.

### 4.1 Score Scale Definitions

```ts
// types/atlas.ts

export type ETSScore = -1 | 0 | 1 | 2 | 3 | 4;
export type SESScore = -2 | -1 | 0 | 1 | 2 | 3;
export type EISScore = -2 | -1 | 0 | 1 | 2 | 3;

export interface ATLASScore {
  theory: string;
  description?: string;
  ets: {
    score: ETSScore;
    label: string;  // e.g. "Proven Phenomenon Theory"
  };
  ses: {
    score: SESScore;
    label: string;  // e.g. "Strong Scientific Engagement"
  };
  eis: {
    score: EISScore;
    label: string;  // e.g. "Architectonic Integrator"
  };
  composite: number;  // Sum of all three scales
  ontologicalScale?: 'NANO' | 'MICRO' | 'INTERMEDIATE' | 'MACRO' | 'META';
  tags?: string[];
}
```

### 4.2 Score Label Maps

```ts
// constants/atlasLabels.ts

export const ETS_LABELS: Record<ETSScore, string> = {
  4:  'Complete Mechanistic Theory',
  3:  'Proven Phenomenon Theory',
  2:  'Strongly Supported Theory',
  1:  'Emerging Supported Theory',
  0:  'Indeterminate',
 -1:  'Debunked',
};

export const SES_LABELS: Record<SESScore, string> = {
  3:  'Core Scientific Program',
  2:  'Strong Scientific Engagement',
  1:  'Partial Scientific Engagement',
  0:  'No Scientific Interaction',
 -1:  'Methodological Insulation',
 -2:  'Anti-Scientific',
};

export const EIS_LABELS: Record<EISScore, string> = {
  3:  'Architectonic Integrator',
  2:  'Cross-Domain Integrator',
  1:  'Domain Integrator',
  0:  'Standalone Theory',
 -1:  'Fragmenting Theory',
 -2:  'Systemically Incompatible Doctrine',
};
```

### 4.3 Score Pill Colour Logic

```ts
// utils/scoreColor.ts

export function getETSPillStyle(score: ETSScore): string {
  if (score === -1) return 'bg-atlas-debunked text-atlas-muted border border-atlas-border';
  if (score === 0)  return 'bg-atlas-score-0 text-atlas-muted border border-atlas-border-dim';
  if (score === 1)  return 'bg-atlas-score-1 text-atlas-bright-text border border-atlas-border';
  if (score === 2)  return 'bg-atlas-score-2 text-white border border-atlas-vivid';
  if (score === 3)  return 'bg-atlas-score-3 text-white border border-atlas-vivid shadow-atlas-glow-sm';
  if (score === 4)  return 'bg-atlas-score-4 text-white border border-atlas-bloom shadow-atlas-glow-md';
  return '';
}

export function getScoreTextColor(score: number): string {
  if (score < 0)  return 'text-atlas-muted';
  if (score === 0) return 'text-atlas-dim';
  if (score <= 2) return 'text-atlas-label';
  if (score <= 5) return 'text-atlas-glow';
  return 'text-atlas-bloom';
}

export function getCompositeBarWidth(composite: number): string {
  // Composite range: -5 to +10
  const pct = ((composite + 5) / 15) * 100;
  return `${Math.max(2, Math.min(100, pct))}%`;
}
```

---

## 5. Component Specs

### 5.1 Page Layout

```
┌─────────────────────────────────────────────┐
│  HEADER: ATLAS logo + nav (bg-atlas-void)    │
├─────────────────────────────────────────────┤
│  HERO: Theory name + composite score         │
│  (bg-atlas-space with radial glow)           │
├─────────────────────────────────────────────┤
│  SCORE TRIPTYCH: SES | ETS | EIS             │
│  Three equal-width panels, side by side      │
├─────────────────────────────────────────────┤
│  ONTOLOGICAL SCALE indicator                 │
├─────────────────────────────────────────────┤
│  THEORY CARDS GRID (2-3 col)                 │
└─────────────────────────────────────────────┘
```

**Page background:**
```tsx
<div className="min-h-screen bg-atlas-void bg-atlas-space">
```

### 5.2 Score Triptych Component

The central display unit. Three sub-scale panels rendered as a horizontal row.

```tsx
// components/ScoreTriptych.tsx

// Panel structure for each of the 3 scales:
<div className="
  flex flex-col items-center
  bg-atlas-deep
  border border-atlas-border
  rounded-atlas-card
  p-6
  shadow-atlas-card
  hover:border-atlas-border-glow
  hover:shadow-atlas-glow-md
  transition-all duration-300
">
  {/* Scale acronym */}
  <span className="text-2xl font-bold text-atlas-vivid font-mono tracking-widest">
    SES
  </span>

  {/* Full scale name */}
  <span className="text-xs text-atlas-label uppercase tracking-wider mt-1">
    Scientific Engagement Scale
  </span>

  {/* Score number — large and prominent */}
  <div className="my-4">
    <span className="text-6xl font-black text-atlas-white font-mono">
      +3
    </span>
  </div>

  {/* Score label pill */}
  <span className="
    text-sm font-semibold text-white text-center
    bg-atlas-rich border border-atlas-vivid
    rounded-atlas-pill px-4 py-1.5
    shadow-atlas-glow-sm
  ">
    Core Scientific Program
  </span>
</div>
```

### 5.3 Theory Card Component

Used in the grid view for listing multiple theories.

```tsx
// components/TheoryCard.tsx

<div className="
  group relative
  bg-atlas-deep border border-atlas-border
  rounded-atlas-card p-5
  shadow-atlas-card
  hover:border-atlas-border-glow hover:shadow-atlas-glow-md
  transition-all duration-300 cursor-pointer
">
  {/* Subtle top glow bar — colour driven by ETS score */}
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-atlas-vivid rounded-t-atlas-card" />

  {/* Theory name */}
  <h3 className="text-lg font-bold text-atlas-white mb-1">
    Theory of Evolution
  </h3>

  {/* Tags */}
  <div className="flex gap-2 mb-3">
    <span className="text-xs text-atlas-label bg-atlas-mid px-2 py-0.5 rounded-full">
      Biology
    </span>
    <span className="text-xs text-atlas-label bg-atlas-mid px-2 py-0.5 rounded-full">
      MICRO Scale
    </span>
  </div>

  {/* Mini score row */}
  <div className="flex items-center gap-3">
    <ScoreBadge scale="SES" score={3} />
    <ScoreBadge scale="ETS" score={3} />
    <ScoreBadge scale="EIS" score={3} />
    
    {/* Composite */}
    <span className="ml-auto text-2xl font-black text-atlas-bloom font-mono">
      +9
    </span>
  </div>

  {/* Composite bar */}
  <div className="mt-3 h-1.5 bg-atlas-mid rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-atlas-vivid to-atlas-bloom rounded-full"
      style={{ width: '93%' }}  {/* computed from composite */}
    />
  </div>
</div>
```

### 5.4 Score Badge (Mini)

Inline compact badge used inside cards.

```tsx
// components/ScoreBadge.tsx

<span className="
  inline-flex items-center gap-1
  text-xs font-bold font-mono
  px-2.5 py-1 rounded-full
  bg-atlas-bright border border-atlas-vivid
  text-atlas-white
  shadow-atlas-glow-sm
">
  <span className="text-atlas-label">ETS</span>
  <span>+3</span>
</span>
```

### 5.5 Ontological Scale Indicator

Displays which of the 5 ontological scales the theory operates at.

```tsx
// components/OntologicalScale.tsx
// Five bands: NANO → MICRO → INTERMEDIATE → MACRO → META

const SCALES = ['NANO', 'MICRO', 'INTERMEDIATE', 'MACRO', 'META'];

<div className="flex items-center gap-2">
  {SCALES.map((scale) => (
    <div
      key={scale}
      className={cn(
        'px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all',
        activeScale === scale
          ? 'bg-atlas-vivid border-atlas-bloom text-white shadow-atlas-glow-sm'
          : 'bg-atlas-deep border-atlas-border text-atlas-dim'
      )}
    >
      {scale}
    </div>
  ))}
</div>
```

### 5.6 Header / Nav

```tsx
<header className="
  sticky top-0 z-50
  bg-atlas-void/90 backdrop-blur-md
  border-b border-atlas-border
">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo area */}
    <div className="flex items-center gap-3">
      <img src="/atlas-logo.svg" alt="ATLAS" className="h-8 w-8" />
      <span className="text-xl font-black text-atlas-white tracking-widest uppercase">
        ATLAS
      </span>
      <span className="text-xs text-atlas-muted hidden sm:block">
        Assessing Theoretical Legitimacy Across Scales
      </span>
    </div>

    {/* Nav items */}
    <nav className="flex items-center gap-6">
      <a className="text-sm text-atlas-label hover:text-atlas-white transition-colors">
        Theories
      </a>
      <a className="text-sm text-atlas-label hover:text-atlas-white transition-colors">
        Scales
      </a>
      <a className="text-sm text-atlas-label hover:text-atlas-white transition-colors">
        About
      </a>
    </nav>
  </div>
</header>
```

---

## 6. Typography

Per the NRP brand chart:

| Role | Font | Casing | Tailwind |
|---|---|---|---|
| Headings | Arial Black | ALL CAPS | `font-display font-black uppercase` |
| Body | Arial | Regular sentence case | `font-body` |
| Scores / codes | System monospace | As needed | `font-mono` |

| Element | Class | Notes |
|---|---|---|
| Page title | `font-display text-4xl font-black uppercase text-atlas-white tracking-tight` | Theory name hero |
| Section header | `font-display text-xl font-black uppercase tracking-widest text-atlas-white` | Scale names |
| Score number (large) | `text-6xl font-black text-atlas-white font-mono` | The big +/- number |
| Score label | `text-sm font-semibold text-atlas-bright-text` | e.g. "Core Scientific Program" |
| Body text | `font-body text-sm text-atlas-muted leading-relaxed` | Descriptions, prose |
| Caption / meta | `text-xs text-atlas-label uppercase tracking-wider` | Tags, scale names |
| Composite score | `text-3xl font-black text-atlas-bloom font-mono` | Total composite |

No webfont imports are required; Arial and Arial Black are system fonts on Windows and have suitable fallbacks elsewhere.

---

## 7. JSON Feed Schema

The platform consumes a JSON feed. Expected structure:

```json
{
  "theories": [
    {
      "id": "evolution",
      "theory": "Theory of Evolution",
      "description": "The theory that all species of life have descended over time from common ancestors via natural selection.",
      "tags": ["Biology", "Genetics"],
      "ontologicalScale": "MICRO",
      "ets": {
        "score": 3,
        "label": "Proven Phenomenon Theory"
      },
      "ses": {
        "score": 3,
        "label": "Core Scientific Program"
      },
      "eis": {
        "score": 3,
        "label": "Architectonic Integrator"
      },
      "composite": 9
    },
    {
      "id": "flat-earth",
      "theory": "Flat Earth Theory",
      "description": "The claim that the Earth is a flat disc rather than a spheroid.",
      "tags": ["Cosmology", "Pseudoscience"],
      "ontologicalScale": "INTERMEDIATE",
      "ets": {
        "score": -1,
        "label": "Debunked"
      },
      "ses": {
        "score": -2,
        "label": "Anti-Scientific"
      },
      "eis": {
        "score": 0,
        "label": "Standalone Theory"
      },
      "composite": -3
    }
  ]
}
```

---

## 8. Radix UI Component Mapping

| Radix Primitive | ATLAS Usage |
|---|---|
| `@radix-ui/react-tooltip` | Hovering score labels for explanations |
| `@radix-ui/react-dialog` | Theory detail modal / expanded view |
| `@radix-ui/react-tabs` | Switching between Nano/Micro/Intermediate/Macro/Meta scale views |
| `@radix-ui/react-select` | Filter theories by scale or score |
| `@radix-ui/react-slider` | Score range filter (composite -5 to +10) |
| `@radix-ui/react-popover` | Scale definition popover on score badges |
| `@radix-ui/react-badge` | Score badges (extend with atlas classes) |
| `@radix-ui/react-separator` | Dividers between triptych panels |

All Radix components should have their default styles **overridden** with ATLAS dark palette tokens. Use `asChild` prop pattern to preserve functionality while applying Tailwind classes.

---

## 9. Animation & Effects

```css
/* globals.css — custom animations */

/* Glow pulse on score cards */
@keyframes atlas-pulse-glow {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(122, 107, 171, 0.45); }
  50%       { box-shadow: 0 0 24px 6px rgba(3, 154, 210, 0.5); }
}

/* Score bar fill on mount */
@keyframes atlas-bar-fill {
  from { width: 0%; }
  to   { width: var(--bar-width); }
}

/* Subtle starfield shimmer on hero bg */
@keyframes atlas-shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.atlas-glow-pulse { animation: atlas-pulse-glow 3s ease-in-out infinite; }
.atlas-bar-fill   { animation: atlas-bar-fill 0.8s ease-out forwards; }
.atlas-hero-shimmer {
  background-size: 200% 200%;
  animation: atlas-shimmer 8s ease infinite;
}
```

---

## 10. Accessibility Notes

- Maintain **4.5:1 contrast** minimum for all score text against backgrounds. The `atlas-white` on `atlas-deep` is ~10:1.
- Never rely on colour alone — always pair score numbers with labels.
- The "Debunked" pill uses near-black background (`atlas-debunked`, `#101010`) — ensure label text uses `atlas-muted` (`#bfbfbf`) for contrast.
- All interactive elements must have `:focus-visible` ring using `ring-2 ring-atlas-bloom ring-offset-2 ring-offset-atlas-void`.
- Score triptych panels should have `aria-label` describing the scale and score.

---

## 11. Example Tailwind Utility Combos

```
// Page wrapper
bg-atlas-void min-h-screen text-atlas-white

// Default card
bg-atlas-deep border border-atlas-border rounded-atlas-card shadow-atlas-card

// Active/selected card
bg-atlas-mid border border-atlas-border-glow shadow-atlas-glow-md

// Score pill — positive
bg-atlas-bright border border-atlas-vivid text-white rounded-atlas-pill px-4 py-1.5 shadow-atlas-glow-sm

// Score pill — debunked
bg-atlas-debunked border border-atlas-border text-atlas-muted rounded-atlas-pill px-4 py-1.5

// Focus ring
focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void

// Hero radial bg (or use bg-atlas-space utility)
bg-atlas-space

// Composite score text
text-4xl font-black text-atlas-bloom font-mono

// Section label
text-xs text-atlas-label uppercase tracking-widest
```

---

*ATLAS Design System v1.1 — NRP colour palette — Non-Reductionist Philosophy 2026*

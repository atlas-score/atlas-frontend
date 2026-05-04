import type { CSSProperties } from 'react';
import type { OntologicalScale } from '../types/evaluation';

export type ETSScore = -1 | 0 | 1 | 2 | 3 | 4;

// -- Anchor colours: high composite / strong legitimacy → purple; mid → neutral; low → orange → red

const PURPLE = '#c084fc';
const NEUTRAL = '#c8c4dc';
const ORANGE = '#fb923c';
const RED = '#dc2626';
// -- SES/EIS worst tier blends toward warm warning before full red
const WARM_NEG = '#ea580c';

const COMPOSITE_MIN = -5;
const COMPOSITE_MAX = 10;
const ETS_MAX = 4;
const SECONDARY_MIN = -2;
const SECONDARY_MAX = 3;

type RGB = { r: number; g: number; b: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: RGB): string {
  const q = (x: number) =>
    Math.round(clamp(x, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${q(r)}${q(g)}${q(b)}`;
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  const u = clamp(t, 0, 1);
  return {
    r: a.r + (b.r - a.r) * u,
    g: a.g + (b.g - a.g) * u,
    b: a.b + (b.b - a.b) * u,
  };
}

function lerpHex(a: string, b: string, t: number): string {
  return rgbToHex(lerpRgb(hexToRgb(a), hexToRgb(b), t));
}

export function hexAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${clamp(alpha, 0, 1)})`;
}

function blendOntoVoid(accentHex: string, accentStrength: number): string {
  return lerpHex('#1a0a2e', accentHex, clamp(accentStrength, 0, 1));
}

/** Composite −5…+10 — purple at +10, neutral near 0, orange/red toward −5 */
export function getCompositeAccentColor(composite: number): string {
  const c = clamp(composite, COMPOSITE_MIN, COMPOSITE_MAX);
  if (c >= 0) {
    return lerpHex(NEUTRAL, PURPLE, c / COMPOSITE_MAX);
  }
  if (c >= -1) {
    return lerpHex(NEUTRAL, ORANGE, -c);
  }
  return lerpHex(ORANGE, RED, (-c - 1) / (-COMPOSITE_MIN - 1));
}

/** ETS −1…+4 — debunked (−1) red; neutral at 0; strong toward purple at +4 */
export function getEtsAccentColor(score: number): string {
  const s = clamp(score, -1, ETS_MAX);
  if (s <= -1) return RED;
  if (s === 0) return NEUTRAL;
  return lerpHex(NEUTRAL, PURPLE, s / ETS_MAX);
}

/** SES / EIS −2…+3 */
export function getSesEisAccentColor(score: number): string {
  const s = clamp(score, SECONDARY_MIN, SECONDARY_MAX);
  if (s <= 0) {
    const u = (0 - s) / (0 - SECONDARY_MIN);
    return lerpHex(NEUTRAL, WARM_NEG, u);
  }
  return lerpHex(NEUTRAL, PURPLE, s / SECONDARY_MAX);
}

export function getSubscaleAccentColor(
  scale: 'ets' | 'ses' | 'eis',
  score: number
): string {
  return scale === 'ets'
    ? getEtsAccentColor(score)
    : getSesEisAccentColor(score);
}

export function getSubscalePillStyle(
  scale: 'ets' | 'ses' | 'eis',
  score: number
): CSSProperties {
  const accent = getSubscaleAccentColor(scale, score);
  return {
    backgroundColor: blendOntoVoid(accent, 0.38),
    borderColor: accent,
    borderWidth: 1,
    borderStyle: 'solid',
    color: '#f5f3ff',
    boxShadow: `0 0 14px ${hexAlpha(accent, 0.4)}`,
  };
}

export function getCompositeBarFillStyle(composite: number): CSSProperties {
  const c = getCompositeAccentColor(composite);
  const hi = lerpHex(c, '#fdf4ff', 0.22);
  return {
    background: `linear-gradient(90deg, ${c}, ${hi})`,
    boxShadow: `0 0 16px ${hexAlpha(c, 0.45)}`,
  };
}

export function getTheoryCardChromeStyle(
  composite: number,
  selected: boolean
): CSSProperties {
  const accent = getCompositeAccentColor(composite);
  const edge = hexAlpha(accent, selected ? 0.78 : 0.48);
  const glow = hexAlpha(accent, selected ? 0.36 : 0.16);
  return {
    borderColor: edge,
    boxShadow: selected
      ? `0 4px 28px rgba(15, 5, 32, 0.85), 0 0 22px ${glow}`
      : `0 4px 24px rgba(15, 5, 32, 0.75), 0 0 12px ${glow}`,
    backgroundImage: `linear-gradient(135deg, ${blendOntoVoid(accent, selected ? 0.2 : 0.11)} 0%, #2d1155 55%, #1a0a2e 100%)`,
  };
}

export function getTriptychPanelChromeStyle(
  acronym: 'ETS' | 'SES' | 'EIS',
  score: number
): CSSProperties {
  const accent =
    acronym === 'ETS'
      ? getEtsAccentColor(score)
      : getSesEisAccentColor(score);
  const isTruth = acronym === 'ETS';
  const depth = isTruth ? 0.32 : 0.14;
  return {
    borderColor: accent,
    borderWidth: isTruth ? 2 : 1,
    borderStyle: 'solid',
    boxShadow: isTruth
      ? `0 0 36px ${hexAlpha(accent, 0.42)}, inset 0 0 0 1px ${hexAlpha(accent, 0.2)}`
      : `0 0 18px ${hexAlpha(accent, 0.22)}`,
    backgroundImage: `linear-gradient(to bottom right, ${blendOntoVoid(accent, depth)} 0%, #2d1155 55%, #2d1155 100%)`,
  };
}

export function triptychAcronymStyle(accentHex: string): CSSProperties {
  return {
    color: accentHex,
    textShadow: `0 0 18px ${hexAlpha(accentHex, 0.55)}`,
  };
}

export function triptychSubtitleStyle(accentHex: string): CSSProperties {
  return {
    color: lerpHex('#a78bfa', accentHex, 0.38),
  };
}

export function triptychScoreNumberStyle(accentHex: string): CSSProperties {
  return {
    color: '#f5f3ff',
    textShadow: `0 0 26px ${hexAlpha(accentHex, 0.42)}`,
  };
}

export function getCompositeBarWidth(composite: number): string {
  const pct = ((composite + 5) / 15) * 100;
  return `${Math.max(2, Math.min(100, pct))}%`;
}

export function formatSigned(n: number): string {
  if (n > 0) return `+${n}`;
  return String(n);
}

const SCALE_ORDER: OntologicalScale[] = [
  'Nano',
  'Micro',
  'Intermediate',
  'Macro',
  'Meta',
];

export function normalizeScale(s: string): OntologicalScale | null {
  const t = s.trim();
  const hit = SCALE_ORDER.find(
    (x) => x.toLowerCase() === t.toLowerCase()
  );
  return hit ?? null;
}

export function scalesToUpper(s: OntologicalScale): string {
  return s.toUpperCase();
}

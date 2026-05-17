import type { CSSProperties } from 'react';
import type { OntologicalScale } from '../types/evaluation';
import type { ThemeMode } from '../types/theme';

export type ETSScore = -1 | 0 | 1 | 2 | 3 | 4;

const NEUTRAL = '#bfbfbf';
const ORANGE = '#fb923c';
const RED = '#dc2626';
const WARM_NEG = '#ea580c';

const COMPOSITE_MIN = -5;
const COMPOSITE_MAX = 10;

const COMPOSITE_POSITIVE_STOPS: readonly string[] = [
  '#bfbfbf',
  '#b0a8c8',
  '#a198bb',
  '#9289ae',
  '#7a6bab',
  '#6d5f9e',
  '#605390',
  '#534682',
  '#40216d',
  '#2d5f87',
  '#039ad2',
];
const ETS_MAX = 4;
const SECONDARY_MIN = -2;
const SECONDARY_MAX = 3;

export type SubscaleKey = 'ets' | 'ses' | 'eis';
export type ScaleAcronym = 'ETS' | 'SES' | 'EIS';

export const SCALE_MAX: Record<SubscaleKey, number> = {
  ets: ETS_MAX,
  ses: SECONDARY_MAX,
  eis: SECONDARY_MAX,
};

export const SCALE_MIN: Record<SubscaleKey, number> = {
  ets: -1,
  ses: SECONDARY_MIN,
  eis: SECONDARY_MIN,
};

export const ACRONYM_TO_SCALE: Record<ScaleAcronym, SubscaleKey> = {
  ETS: 'ets',
  SES: 'ses',
  EIS: 'eis',
};

export function getScaleMax(scale: SubscaleKey | ScaleAcronym): number {
  if (scale === 'ETS' || scale === 'SES' || scale === 'EIS') {
    return SCALE_MAX[ACRONYM_TO_SCALE[scale]];
  }
  return SCALE_MAX[scale];
}

export function formatScoreOutOf(
  score: number,
  scale: SubscaleKey | ScaleAcronym
): string {
  return `${score} out of ${getScaleMax(scale)}`;
}

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

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Deepen light pastel accents so score colours stay readable on cream paper */
function adjustAccentForLightSurface(hex: string): string {
  const L = relativeLuminance(hex);
  if (L > 0.72) {
    return lerpHex(hex, '#40216d', 0.5);
  }
  if (L > 0.55) {
    return lerpHex(hex, '#534482', 0.32);
  }
  if (L > 0.42) {
    return lerpHex(hex, '#2a183f', 0.18);
  }
  return hex;
}

function cardBase(mode: ThemeMode): string {
  return mode === 'day' ? '#ffffff' : '#181618';
}

function cardBaseMid(mode: ThemeMode): string {
  return mode === 'day' ? '#f7f7f7' : '#2a183f';
}

function blendOntoCard(
  accentHex: string,
  accentStrength: number,
  mode: ThemeMode
): string {
  return lerpHex(cardBase(mode), accentHex, clamp(accentStrength, 0, 1));
}

function sampleStops(
  stops: readonly string[],
  minScore: number,
  maxScore: number,
  value: number
): string {
  if (stops.length < 2) return stops[0] ?? NEUTRAL;
  const v = clamp(value, minScore, maxScore);
  const span = maxScore - minScore;
  const t = span <= 0 ? 0 : (v - minScore) / span;
  const maxIdx = stops.length - 1;
  const idx = t * maxIdx;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return lerpHex(stops[lo], stops[hi], frac);
}

export function getCompositePositiveRampT(composite: number): number {
  if (composite <= 0) return 0;
  return clamp(composite / COMPOSITE_MAX, 0, 1);
}

export function getCompositeAccentColor(
  composite: number,
  mode: ThemeMode = 'night'
): string {
  const c = clamp(composite, COMPOSITE_MIN, COMPOSITE_MAX);
  let base: string;
  if (c >= 0) {
    base = sampleStops(COMPOSITE_POSITIVE_STOPS, 0, COMPOSITE_MAX, c);
  } else if (c >= -1) {
    base = lerpHex(NEUTRAL, ORANGE, -c);
  } else {
    base = lerpHex(ORANGE, RED, (-c - 1) / (-COMPOSITE_MIN - 1));
  }
  return mode === 'day' ? adjustAccentForLightSurface(base) : base;
}

export function getEtsAccentColor(
  score: number,
  mode: ThemeMode = 'night'
): string {
  const s = clamp(score, -1, ETS_MAX);
  let base: string;
  if (s <= -1) base = RED;
  else if (s === 0) base = NEUTRAL;
  else base = sampleStops(COMPOSITE_POSITIVE_STOPS, 0, ETS_MAX, s);
  return mode === 'day' ? adjustAccentForLightSurface(base) : base;
}

export function getSesEisAccentColor(
  score: number,
  mode: ThemeMode = 'night'
): string {
  const s = clamp(score, SECONDARY_MIN, SECONDARY_MAX);
  let base: string;
  if (s <= 0) {
    const u = (0 - s) / (0 - SECONDARY_MIN);
    base = lerpHex(NEUTRAL, WARM_NEG, u);
  } else {
    base = sampleStops(COMPOSITE_POSITIVE_STOPS, 0, SECONDARY_MAX, s);
  }
  return mode === 'day' ? adjustAccentForLightSurface(base) : base;
}

export function getSubscaleAccentColor(
  scale: 'ets' | 'ses' | 'eis',
  score: number,
  mode: ThemeMode = 'night'
): string {
  return scale === 'ets'
    ? getEtsAccentColor(score, mode)
    : getSesEisAccentColor(score, mode);
}

export function getSubscalePillStyle(
  scale: 'ets' | 'ses' | 'eis',
  score: number,
  mode: ThemeMode = 'night'
): CSSProperties {
  const accent = getSubscaleAccentColor(scale, score, mode);
  if (mode === 'day') {
    return {
      backgroundColor: blendOntoCard(accent, 0.14, mode),
      borderColor: accent,
      borderWidth: 1,
      borderStyle: 'solid',
      color: '#383838',
      boxShadow: 'none',
    };
  }
  return {
    backgroundColor: blendOntoCard(accent, 0.38, mode),
    borderColor: accent,
    borderWidth: 1,
    borderStyle: 'solid',
    color: '#f7f7f7',
    boxShadow: `0 0 14px ${hexAlpha(accent, 0.4)}`,
  };
}

export function getCompositeBarFillStyle(
  composite: number,
  mode: ThemeMode = 'night'
): CSSProperties {
  const c = getCompositeAccentColor(composite, mode);
  const hi = lerpHex(c, mode === 'day' ? '#f7f7f7' : '#ffffff', 0.22);
  const t = getCompositePositiveRampT(composite);
  if (mode === 'day') {
    return {
      background: `linear-gradient(90deg, ${c}, ${hi})`,
      boxShadow: `0 1px 3px ${hexAlpha(c, 0.2)}`,
    };
  }
  const glowA = composite >= 0 ? 0.28 + t * 0.38 : 0.38;
  return {
    background: `linear-gradient(90deg, ${c}, ${hi})`,
    boxShadow: `0 0 ${14 + t * 14}px ${hexAlpha(c, glowA)}`,
  };
}

export function getTheoryCardChromeStyle(
  composite: number,
  selected: boolean,
  mode: ThemeMode = 'night'
): CSSProperties {
  const accent = getCompositeAccentColor(composite, mode);
  const t = getCompositePositiveRampT(composite);
  if (mode === 'day') {
    const edge = hexAlpha(accent, selected ? 0.55 : 0.38);
    return {
      borderColor: edge,
      borderWidth: composite >= 5 ? 2 : 1,
      boxShadow: selected
        ? `0 2px 10px ${hexAlpha(accent, 0.14)}, 0 0 0 1px ${hexAlpha(accent, 0.12)}`
        : `0 1px 3px rgba(30, 27, 46, 0.07)`,
      backgroundImage: `linear-gradient(135deg, ${blendOntoCard(accent, selected ? 0.1 : 0.05, mode)} 0%, #faf8ff 55%, ${cardBase(mode)} 100%)`,
    };
  }
  const edgeBase = composite >= 0 ? 0.32 + t * 0.46 : selected ? 0.72 : 0.44;
  const edgeSel = composite >= 0 ? 0.55 + t * 0.28 : 0.85;
  const edge = hexAlpha(accent, selected ? edgeSel : edgeBase);
  const glowLo = composite >= 0 ? 0.1 + t * 0.34 : 0.14;
  const glowHi = composite >= 0 ? 0.28 + t * 0.28 : 0.38;
  const glow = hexAlpha(accent, selected ? glowHi : glowLo);
  const bgTint = selected ? 0.14 + t * 0.12 : 0.08 + t * 0.1;
  return {
    borderColor: edge,
    borderWidth: composite >= 5 ? 2 : 1,
    boxShadow: selected
      ? `0 4px 28px rgba(16, 16, 16, 0.85), 0 0 ${18 + t * 22}px ${glow}`
      : `0 4px 24px rgba(16, 16, 16, 0.75), 0 0 ${10 + t * 20}px ${glow}`,
    backgroundImage: `linear-gradient(135deg, ${blendOntoCard(accent, bgTint + (selected ? 0.06 : 0), mode)} 0%, ${cardBaseMid(mode)} 55%, ${cardBase(mode)} 100%)`,
  };
}

export function getTriptychPanelChromeStyle(
  acronym: 'ETS' | 'SES' | 'EIS',
  score: number,
  mode: ThemeMode = 'night'
): CSSProperties {
  const accent =
    acronym === 'ETS'
      ? getEtsAccentColor(score, mode)
      : getSesEisAccentColor(score, mode);
  const isTruth = acronym === 'ETS';
  const depth = isTruth ? 0.32 : 0.14;
  if (mode === 'day') {
    return {
      borderColor: accent,
      borderWidth: isTruth ? 2 : 1,
      borderStyle: 'solid',
      boxShadow: `0 1px 3px ${hexAlpha(accent, 0.12)}`,
      backgroundImage: `linear-gradient(to bottom right, ${blendOntoCard(accent, depth * 0.6, mode)} 0%, ${cardBase(mode)} 70%)`,
    };
  }
  return {
    borderColor: accent,
    borderWidth: isTruth ? 2 : 1,
    borderStyle: 'solid',
    boxShadow: isTruth
      ? `0 0 36px ${hexAlpha(accent, 0.42)}, inset 0 0 0 1px ${hexAlpha(accent, 0.2)}`
      : `0 0 18px ${hexAlpha(accent, 0.22)}`,
    backgroundImage: `linear-gradient(to bottom right, ${blendOntoCard(accent, depth, mode)} 0%, ${cardBaseMid(mode)} 55%, ${cardBaseMid(mode)} 100%)`,
  };
}

export function triptychAcronymStyle(
  accentHex: string,
  mode: ThemeMode = 'night'
): CSSProperties {
  if (mode === 'day') {
    return { color: accentHex };
  }
  return {
    color: accentHex,
    textShadow: `0 0 18px ${hexAlpha(accentHex, 0.55)}`,
  };
}

export function triptychSubtitleStyle(
  accentHex: string,
  mode: ThemeMode = 'night'
): CSSProperties {
  if (mode === 'day') {
    return { color: lerpHex('#40216d', accentHex, 0.35) };
  }
  return {
    color: lerpHex('#9a8fc4', accentHex, 0.38),
  };
}

export function triptychScoreNumberStyle(
  accentHex: string,
  mode: ThemeMode = 'night'
): CSSProperties {
  if (mode === 'day') {
    return {
      color: '#383838',
      textShadow: `0 1px 0 ${hexAlpha(accentHex, 0.15)}`,
    };
  }
  return {
    color: '#f7f7f7',
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

/** Compact score with scale ceiling, e.g. `4/4` or `-1/4` */
export function formatScoreSlash(
  score: number,
  scale: SubscaleKey | ScaleAcronym
): string {
  return `${score}/${getScaleMax(scale)}`;
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

import type { OntologicalScale } from '../types/evaluation';

export type ETSScore = -1 | 0 | 1 | 2 | 3 | 4;

export function getETSPillClass(score: number): string {
  if (score === -1)
    return 'bg-atlas-debunked text-atlas-muted border border-atlas-border';
  if (score === 0)
    return 'bg-atlas-score-0 text-atlas-muted border border-atlas-border-dim';
  if (score === 1)
    return 'bg-atlas-score-1 text-atlas-bright-text border border-atlas-border';
  if (score === 2)
    return 'bg-atlas-score-2 text-white border border-atlas-vivid';
  if (score === 3)
    return 'bg-atlas-score-3 text-white border border-atlas-vivid shadow-atlas-glow-sm';
  if (score === 4)
    return 'bg-atlas-score-4 text-white border border-atlas-bloom shadow-atlas-glow-md';
  return 'bg-atlas-mid text-atlas-muted border border-atlas-border';
}

export function getSecondaryPillClass(score: number): string {
  if (score < 0)
    return 'bg-atlas-score-neg1 text-atlas-muted border border-atlas-border';
  if (score === 0)
    return 'bg-atlas-score-0 text-atlas-muted border border-atlas-border-dim';
  if (score === 1)
    return 'bg-atlas-score-1 text-atlas-bright-text border border-atlas-border';
  if (score === 2)
    return 'bg-atlas-score-2 text-white border border-atlas-vivid shadow-atlas-glow-sm';
  if (score >= 3)
    return 'bg-atlas-score-3 text-white border border-atlas-bloom shadow-atlas-glow-sm';
  return 'bg-atlas-mid text-atlas-muted border border-atlas-border';
}

export function getScoreTextClass(score: number): string {
  if (score < 0) return 'text-atlas-muted';
  if (score === 0) return 'text-atlas-dim';
  if (score <= 2) return 'text-atlas-label';
  if (score <= 5) return 'text-atlas-glow';
  return 'text-atlas-bloom';
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

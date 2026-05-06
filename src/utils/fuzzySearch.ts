import type { AtlasEvaluation } from '../types/evaluation';

export interface FuzzyMatch {
  evaluation: AtlasEvaluation;
  score: number;
  reasons: string[];
}

function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function tokenize(raw: string): string[] {
  const t = normalizeText(raw);
  if (!t) return [];
  return t.split(/\s+/g).filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const m = a.length;
  const n = b.length;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

function similarity01(a: string, b: string): number {
  if (!a || !b) return 0;
  const A = normalizeText(a);
  const B = normalizeText(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  const d = levenshtein(A, B);
  const denom = Math.max(A.length, B.length);
  return denom === 0 ? 0 : Math.max(0, 1 - d / denom);
}

function buildHaystack(e: AtlasEvaluation): string {
  const parts: string[] = [
    e.framework_name,
    e.specific_claim,
    e.id,
    e.framework_status,
    e.claim_type,
    e.ets.label,
    e.ses.label,
    e.eis.label,
    ...(e.metadata?.tags ?? []),
  ];
  return normalizeText(parts.join(' '));
}

function fieldBoost(query: string, field: string): number {
  const q = normalizeText(query);
  const f = normalizeText(field);
  if (!q || !f) return 0;
  if (f === q) return 6;
  if (f.startsWith(q)) return 5;
  if (f.includes(q)) return 3;

  const qt = tokenize(q);
  const ft = tokenize(f);
  if (qt.length === 0 || ft.length === 0) return 0;

  let tokenHits = 0;
  for (const token of qt) {
    if (ft.some((w) => w.startsWith(token))) tokenHits++;
    else if (ft.some((w) => similarity01(token, w) >= 0.78)) tokenHits++;
  }
  return (tokenHits / qt.length) * 2.2;
}

function typoBoost(query: string, field: string): number {
  const q = normalizeText(query);
  const f = normalizeText(field);
  if (!q || !f) return 0;

  const qTokens = tokenize(q);
  const fTokens = tokenize(f);
  if (qTokens.length === 0 || fTokens.length === 0) return 0;

  // -- For each query token, find best token similarity in field.
  let sum = 0;
  for (const qt of qTokens) {
    let best = 0;
    for (const ft of fTokens) {
      const s = similarity01(qt, ft);
      if (s > best) best = s;
      if (best >= 0.92) break;
    }
    sum += best;
  }
  const avg = sum / qTokens.length;

  // -- Require some minimum typo similarity before scoring.
  if (avg < 0.62) return 0;
  return avg * 2.6;
}

export function fuzzySearchEvaluations(
  query: string,
  evaluations: AtlasEvaluation[],
  options?: {
    limit?: number;
    minScore?: number;
  }
): FuzzyMatch[] {
  const q = query.trim();
  if (!q) return [];

  const limit = options?.limit ?? 10;
  const minScore = options?.minScore ?? 1.15;

  const matches: FuzzyMatch[] = [];
  for (const e of evaluations) {
    const hay = buildHaystack(e);
    const reasons: string[] = [];

    // -- Heavy weighting on name + id for Wikipedia-like feel.
    const nameBoost = fieldBoost(q, e.framework_name);
    const idBoost = fieldBoost(q, e.id);
    const claimBoost = fieldBoost(q, e.specific_claim) * 0.85;

    const typo = Math.max(
      typoBoost(q, e.framework_name),
      typoBoost(q, e.id),
      typoBoost(q, e.specific_claim) * 0.75
    );

    const globalContains = hay.includes(normalizeText(q)) ? 0.9 : 0;

    const score = nameBoost + idBoost + claimBoost + typo + globalContains;

    if (nameBoost >= 3) reasons.push('name');
    if (idBoost >= 3) reasons.push('id');
    if (claimBoost >= 2) reasons.push('claim');
    if (typo >= 1.6) reasons.push('typo');
    if (globalContains > 0) reasons.push('contains');

    if (score >= minScore) {
      matches.push({ evaluation: e, score, reasons });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit));
}


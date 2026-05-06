import type { AtlasEvaluation } from '../types/evaluation';
import type { ThemeMode } from '../types/theme';
import type { CSSProperties } from 'react';
import { hexAlpha } from './scoreColor';

export type HighlightTagTone =
  | 'closure_override'
  | 'negative_override'
  | 'closure_layer'
  | 'truth_debunked'
  | 'truth_indeterminate'
  | 'truth_emerging'
  | 'truth_strong'
  | 'truth_proven'
  | 'truth_mechanistic'
  | 'engagement_negative'
  | 'engagement_low'
  | 'engagement_mid'
  | 'engagement_high'
  | 'integration_severe'
  | 'integration_fragment'
  | 'integration_neutral'
  | 'integration_domain'
  | 'integration_cross'
  | 'integration_architectonic'
  | 'meta';

export interface HighlightTag {
  id: string;
  label: string;
  tone: HighlightTagTone;
}

function humanizeSlug(raw: string): string {
  return raw
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function toneForEts(score: number, label: string): HighlightTagTone {
  const t = label.toLowerCase();
  if (score <= -1 || t.includes('debunked')) return 'truth_debunked';
  if (score === 0 || t.includes('indeterminate')) return 'truth_indeterminate';
  if (t.includes('weak') || t.includes('inconsistent'))
    return 'truth_emerging';
  if (t.includes('emerging')) return 'truth_emerging';
  if (t.includes('developing') || t.includes('partially established'))
    return 'truth_strong';
  if (t.includes('proven phenomenon')) return 'truth_proven';
  if (t.includes('complete mechanistic') || score >= 4)
    return 'truth_mechanistic';
  if (score >= 3) return 'truth_proven';
  if (score >= 2) return 'truth_strong';
  return 'truth_emerging';
}

function toneForSes(score: number, label: string): HighlightTagTone {
  const t = label.toLowerCase();
  if (score <= -2 || t.includes('anti-scientific'))
    return 'engagement_negative';
  if (score === -1 || t.includes('non-scientific')) return 'engagement_negative';
  if (score === 0 || t.includes('no scientific engagement'))
    return 'engagement_low';
  if (score === 1 || t.includes('partial')) return 'engagement_mid';
  if (score === 2 || t.includes('active research') || t.includes('strong'))
    return 'engagement_high';
  return 'engagement_high';
}

function toneForEis(score: number, label: string): HighlightTagTone {
  const t = label.toLowerCase();
  if (score <= -2 || t.includes('systemically incompatible'))
    return 'integration_severe';
  if (score === -1 || t.includes('fragmenting')) return 'integration_fragment';
  if (
    score === 0 ||
    t.includes('standalone') ||
    t.includes('no integration') ||
    t.includes('limited integration')
  )
    return 'integration_neutral';
  if (t.includes('domain integrator')) return 'integration_domain';
  if (t.includes('cross-domain')) return 'integration_cross';
  if (t.includes('architectonic')) return 'integration_architectonic';
  if (score >= 3) return 'integration_architectonic';
  if (score === 2) return 'integration_cross';
  if (score === 1) return 'integration_domain';
  return 'integration_neutral';
}

function toneForClosureLayer(_status: string): HighlightTagTone {
  return 'closure_layer';
}

/** -- Derives prominent chips: override rules, scale labels, closure layer, feed metadata. */
export function buildEvaluationHighlightTags(
  evaluation: AtlasEvaluation
): HighlightTag[] {
  const tags: HighlightTag[] = [];
  const seen = new Set<string>();

  const add = (label: string, tone: HighlightTagTone) => {
    const key = label.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    tags.push({
      id: `tag-${tags.length}-${key.slice(0, 32).replace(/\s+/g, '-')}`,
      label: label.trim(),
      tone,
    });
  };

  if (evaluation.override_status.closure_override_applied) {
    add('Closure Override Rule', 'closure_override');
  }
  if (evaluation.override_status.negative_override_applied) {
    add('Negative Override Rule', 'negative_override');
  }

  add(evaluation.ets.label, toneForEts(evaluation.ets.score, evaluation.ets.label));

  const cs = evaluation.ets.closure_status;
  if (cs && cs !== 'None') {
    add(cs, toneForClosureLayer(cs));
  }

  add(evaluation.ses.label, toneForSes(evaluation.ses.score, evaluation.ses.label));
  add(evaluation.eis.label, toneForEis(evaluation.eis.score, evaluation.eis.label));

  for (const raw of evaluation.metadata?.tags ?? []) {
    add(humanizeSlug(raw), 'meta');
  }

  return tags;
}

export function getHighlightTagStyle(
  tone: HighlightTagTone,
  mode: ThemeMode
): CSSProperties {
  const day = mode === 'day';
  const textDark = '#2d1f45';
  const textLight = '#f5f3ff';

  const chip = (
    border: string,
    fillAlpha: number,
    text: string,
    glow?: string
  ): CSSProperties => ({
    border: `1px solid ${border}`,
    backgroundColor: hexAlpha(border, fillAlpha),
    color: text,
    ...(glow && mode !== 'day' ? { boxShadow: `0 0 14px ${glow}` } : {}),
  });

  switch (tone) {
    case 'closure_override':
      return chip(
        day ? '#0ea5e9' : '#22d3ee',
        day ? 0.14 : 0.22,
        day ? '#0c4a6e' : '#ecfeff',
        hexAlpha('#22d3ee', 0.35)
      );
    case 'negative_override':
      return chip(
        day ? '#be123c' : '#fb7185',
        day ? 0.12 : 0.22,
        day ? '#881337' : '#ffe4e6',
        hexAlpha('#fb7185', 0.32)
      );
    case 'closure_layer':
      return chip(
        day ? '#7c3aed' : '#a78bfa',
        day ? 0.12 : 0.22,
        day ? textDark : textLight,
        hexAlpha('#a78bfa', 0.28)
      );
    case 'truth_debunked':
      return chip(
        day ? '#dc2626' : '#f87171',
        day ? 0.14 : 0.24,
        day ? '#7f1d1d' : '#fef2f2',
        hexAlpha('#f87171', 0.35)
      );
    case 'truth_indeterminate':
      return chip(
        day ? '#78716c' : '#a8a29e',
        day ? 0.12 : 0.2,
        day ? '#44403c' : '#f5f5f4',
        undefined
      );
    case 'truth_emerging':
      return chip(
        day ? '#ca8a04' : '#facc15',
        day ? 0.12 : 0.18,
        day ? '#713f12' : '#fef9c3',
        undefined
      );
    case 'truth_strong':
      return chip(
        day ? '#059669' : '#34d399',
        day ? 0.12 : 0.18,
        day ? '#064e3b' : '#ecfdf5',
        undefined
      );
    case 'truth_proven':
      return chip(
        day ? '#2563eb' : '#60a5fa',
        day ? 0.12 : 0.2,
        day ? '#1e3a8a' : '#eff6ff',
        hexAlpha('#60a5fa', 0.25)
      );
    case 'truth_mechanistic':
      return chip(
        day ? '#6d28d9' : '#a855f7',
        day ? 0.14 : 0.26,
        day ? textDark : textLight,
        hexAlpha('#a855f7', 0.38)
      );
    case 'engagement_negative':
      return chip(
        day ? '#ea580c' : '#fb923c',
        day ? 0.14 : 0.22,
        day ? '#7c2d12' : '#ffedd5',
        hexAlpha('#fb923c', 0.3)
      );
    case 'engagement_low':
      return chip(
        day ? '#78716c' : '#a8a29e',
        day ? 0.1 : 0.18,
        day ? '#44403c' : '#f5f5f4',
        undefined
      );
    case 'engagement_mid':
      return chip(
        day ? '#0d9488' : '#2dd4bf',
        day ? 0.1 : 0.16,
        day ? '#134e4a' : '#ccfbf1',
        undefined
      );
    case 'engagement_high':
      return chip(
        day ? '#4f46e5' : '#818cf8',
        day ? 0.12 : 0.22,
        day ? '#312e81' : '#e0e7ff',
        hexAlpha('#818cf8', 0.22)
      );
    case 'integration_severe':
      return chip(
        day ? '#ea580c' : '#fb923c',
        day ? 0.15 : 0.24,
        day ? '#7c2d12' : '#fff7ed',
        hexAlpha('#fb923c', 0.32)
      );
    case 'integration_fragment':
      return chip(
        day ? '#d97706' : '#fdba74',
        day ? 0.14 : 0.2,
        day ? '#7c2d12' : '#fff7ed',
        undefined
      );
    case 'integration_neutral':
      return chip(
        day ? '#64748b' : '#94a3b8',
        day ? 0.1 : 0.16,
        day ? '#1e293b' : '#f1f5f9',
        undefined
      );
    case 'integration_domain':
      return chip(
        day ? '#0f766e' : '#5eead4',
        day ? 0.1 : 0.16,
        day ? '#134e4a' : '#ccfbf1',
        undefined
      );
    case 'integration_cross':
      return chip(
        day ? '#7c3aed' : '#c084fc',
        day ? 0.12 : 0.2,
        day ? textDark : textLight,
        hexAlpha('#c084fc', 0.24)
      );
    case 'integration_architectonic':
      return chip(
        day ? '#5b21b6' : '#d946ef',
        day ? 0.14 : 0.26,
        day ? textDark : textLight,
        hexAlpha('#d946ef', 0.32)
      );
    case 'meta':
    default:
      return chip(
        day ? '#8b7bb0' : '#c8c4dc',
        day ? 0.08 : 0.14,
        day ? textDark : '#e9e4f5',
        undefined
      );
  }
}

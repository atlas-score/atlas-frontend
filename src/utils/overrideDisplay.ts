import type { AtlasEvaluation } from '../types/evaluation';

export type AppliedOverrideKey =
  | 'negative_override_applied'
  | 'closure_override_applied';

export interface AppliedOverrideRow {
  key: AppliedOverrideKey;
  title: string;
  explanation: string;
}

const OVERRIDE_COPY: Record<
  AppliedOverrideKey,
  { title: string; explanation: string }
> = {
  closure_override_applied: {
    title: 'Closure override',
    explanation:
      'When ETS = 4 (complete mechanistic theory), the composite score is anchored at 10 regardless of SES and EIS values.',
  },
  negative_override_applied: {
    title: 'Negative override',
    explanation:
      'When ETS = −1 (debunked), only negative SES and EIS values are included in the composite sum.',
  },
};

function ruleMentionsOverride(
  ruleApplied: string,
  key: AppliedOverrideKey
): boolean {
  const lower = ruleApplied.toLowerCase();
  if (key === 'closure_override_applied') {
    return lower.includes('closure');
  }
  return lower.includes('negative');
}

export function getAppliedOverrides(
  evaluation: AtlasEvaluation
): AppliedOverrideRow[] {
  const rows: AppliedOverrideRow[] = [];
  const { override_status, score_calculation } = evaluation;

  if (override_status.closure_override_applied) {
    const copy = OVERRIDE_COPY.closure_override_applied;
    rows.push({
      key: 'closure_override_applied',
      title: copy.title,
      explanation: copy.explanation,
    });
  }

  if (override_status.negative_override_applied) {
    const copy = OVERRIDE_COPY.negative_override_applied;
    rows.push({
      key: 'negative_override_applied',
      title: copy.title,
      explanation: copy.explanation,
    });
  }

  const rule = score_calculation.rule_applied?.trim();
  if (rule) {
    return rows.map((row) => {
      if (!ruleMentionsOverride(rule, row.key)) return row;
      return {
        ...row,
        explanation: `${row.explanation} Rule applied: ${rule}`,
      };
    });
  }

  return rows;
}

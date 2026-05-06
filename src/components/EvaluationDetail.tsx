import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { AtlasEvaluation } from '../types/evaluation';
import {
  buildEvaluationHighlightTags,
  getHighlightTagStyle,
} from '../utils/evaluationHighlightTags';
import {
  formatSigned,
  getCompositeAccentColor,
  getCompositePositiveRampT,
  hexAlpha,
} from '../utils/scoreColor';

const ANALYSIS_LABELS: Record<string, string> = {
  scientific_significance: 'Scientific significance',
  mechanistic_closure_analysis: 'Mechanistic closure',
  mechanistic_development_status: 'Mechanistic development',
  evidentiary_accessibility: 'Evidentiary accessibility',
  debunking_evidence_summary: 'Debunking evidence',
  scientific_scope_clarification: 'Scientific scope',
  contextual_impact_analysis: 'Contextual impact',
  boundary_between_theory_and_speculation: 'Theory vs speculation',
};

interface EvaluationDetailProps {
  evaluation: AtlasEvaluation;
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-atlas-card border border-atlas-border bg-atlas-deep/80 p-4 shadow-atlas-card sm:p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-atlas-label">
        {title}
      </h3>
      <div className="mt-2 text-sm leading-relaxed text-atlas-muted">
        {children}
      </div>
    </section>
  );
}

export function EvaluationDetail({ evaluation }: EvaluationDetailProps) {
  const { theme: mode } = useTheme();
  const aa = evaluation.additional_analysis;
  const filled = Object.entries(aa).filter(
    ([, v]) => v != null && String(v).trim() !== ''
  ) as [string, string][];
  const compositeScore = evaluation.composite_score;
  const compositeAccent = getCompositeAccentColor(compositeScore, mode);
  const compositeRamp = getCompositePositiveRampT(compositeScore);
  const highlightTags = buildEvaluationHighlightTags(evaluation);

  return (
    <div className="w-full space-y-4">
      <InfoBlock title="Specific claim evaluated">
        <p className="font-medium text-atlas-bright-text">
          {evaluation.specific_claim}
        </p>
      </InfoBlock>

      <InfoBlock title="Framework description">
        <p>{evaluation.framework_description}</p>
      </InfoBlock>

      <InfoBlock title="Composite score">
        <p
          className="font-mono text-3xl font-black"
          style={{
            color: compositeAccent,
            ...(mode === 'day'
              ? { textShadow: 'none' }
              : {
                  textShadow: `0 0 ${8 + compositeRamp * 20}px ${hexAlpha(
                    compositeAccent,
                    0.2 + compositeRamp * 0.35
                  )}`,
                }),
          }}
        >
          {formatSigned(evaluation.composite_score)}
        </p>
      </InfoBlock>

      <InfoBlock title="Score calculation">
        <dl className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
          <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
            <dt className="text-atlas-label">Raw ETS</dt>
            <dd>{evaluation.score_calculation.raw_ets}</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
            <dt className="text-atlas-label">Raw SES</dt>
            <dd>{evaluation.score_calculation.raw_ses}</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
            <dt className="text-atlas-label">Raw EIS</dt>
            <dd>{evaluation.score_calculation.raw_eis}</dd>
          </div>
          <div className="col-span-full border-b border-atlas-border-dim py-1">
            <dt className="text-atlas-label">Rule applied</dt>
            <dd className="mt-1 font-sans text-sm font-medium text-atlas-bright-text">
              {evaluation.score_calculation.rule_applied}
            </dd>
          </div>
          <div className="flex justify-between gap-2 py-1">
            <dt className="text-atlas-label">SES counted</dt>
            <dd>
              {evaluation.score_calculation.ses_counted === undefined
                ? '—'
                : evaluation.score_calculation.ses_counted
                  ? 'Yes'
                  : 'No'}
            </dd>
          </div>
          <div className="flex justify-between gap-2 py-1">
            <dt className="text-atlas-label">EIS counted</dt>
            <dd>
              {evaluation.score_calculation.eis_counted === undefined
                ? '—'
                : evaluation.score_calculation.eis_counted
                  ? 'Yes'
                  : 'No'}
            </dd>
          </div>
          <div className="col-span-full flex justify-between border-t border-atlas-border pt-2">
            <dt className="text-atlas-label">Final score</dt>
            <dd className="font-bold text-atlas-bloom">
              {formatSigned(evaluation.score_calculation.final_score)}
            </dd>
          </div>
        </dl>
      </InfoBlock>

      <InfoBlock title="Highlights">
        <p className="mb-3 text-xs text-atlas-dim">
          Key classifications and rules applied to this evaluation (colours
          follow severity: debunked and systemic conflict lean red or orange;
          overrides use strong accent).
        </p>
        <div className="flex flex-wrap gap-2">
          {highlightTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-xs font-semibold leading-tight tracking-wide"
              style={getHighlightTagStyle(tag.tone, mode)}
            >
              <span className="break-words text-center">{tag.label}</span>
            </span>
          ))}
        </div>
      </InfoBlock>

      <InfoBlock title="Context of validity">
        <p>{evaluation.context_of_validity}</p>
      </InfoBlock>

      <InfoBlock title="Domains of inquiry">
        <ul className="list-inside list-disc space-y-1">
          {evaluation.domains_of_inquiry.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </InfoBlock>

      <InfoBlock title="Ontological scales">
        <ul className="list-inside list-disc space-y-1">
          {evaluation.ontological_scales.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </InfoBlock>

      <InfoBlock title="Framework classification">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-atlas-label">Framework status</dt>
            <dd className="text-atlas-bright-text">
              {evaluation.framework_status}
            </dd>
          </div>
          <div>
            <dt className="text-atlas-label">Claim type</dt>
            <dd className="text-atlas-bright-text">{evaluation.claim_type}</dd>
          </div>
        </dl>
      </InfoBlock>

      <InfoBlock title="Interpretation">
        <p className="text-atlas-bright-text">{evaluation.interpretation}</p>
      </InfoBlock>

      <InfoBlock title="Override status">
        <ul className="space-y-1 text-atlas-bright-text">
          <li>
            Negative override:{' '}
            {evaluation.override_status.negative_override_applied
              ? 'applied'
              : 'not applied'}
          </li>
          <li>
            Closure override:{' '}
            {evaluation.override_status.closure_override_applied
              ? 'applied'
              : 'not applied'}
          </li>
        </ul>
      </InfoBlock>

      <InfoBlock title="Scale scores">
        <dl className="space-y-4 text-sm">
          <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
            <dt className="text-atlas-label">ETS</dt>
            <dd className="mt-1 text-atlas-bright-text">
              <span className="font-mono font-bold">
                {formatSigned(evaluation.ets.score)}
              </span>
              <span className="text-atlas-muted"> — {evaluation.ets.label}</span>
            </dd>
            {evaluation.ets.closure_status ? (
              <dd className="mt-1 text-xs text-atlas-dim">
                Closure: {evaluation.ets.closure_status}
              </dd>
            ) : null}
          </div>
          <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
            <dt className="text-atlas-label">SES</dt>
            <dd className="mt-1 text-atlas-bright-text">
              <span className="font-mono font-bold">
                {formatSigned(evaluation.ses.score)}
              </span>
              <span className="text-atlas-muted"> — {evaluation.ses.label}</span>
            </dd>
            {evaluation.ses.counted_in_composite === false ? (
              <dd className="mt-1 text-xs text-atlas-dim">
                Not counted in composite (negative override)
              </dd>
            ) : null}
          </div>
          <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
            <dt className="text-atlas-label">EIS</dt>
            <dd className="mt-1 text-atlas-bright-text">
              <span className="font-mono font-bold">
                {formatSigned(evaluation.eis.score)}
              </span>
              <span className="text-atlas-muted"> — {evaluation.eis.label}</span>
            </dd>
            {evaluation.eis.counted_in_composite === false ? (
              <dd className="mt-1 text-xs text-atlas-dim">
                Not counted in composite (negative override)
              </dd>
            ) : null}
          </div>
        </dl>
      </InfoBlock>

      <InfoBlock title="ETS justification">
        <p>{evaluation.ets.justification}</p>
      </InfoBlock>
      <InfoBlock title="SES justification">
        <p>{evaluation.ses.justification}</p>
      </InfoBlock>
      <InfoBlock title="EIS justification">
        <p>{evaluation.eis.justification}</p>
      </InfoBlock>

      <section className="rounded-atlas-card border border-atlas-border bg-atlas-deep/80 p-4 shadow-atlas-card sm:p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-atlas-label">
          Triggered notes
        </h3>
        <div className="mt-2 space-y-4 text-sm leading-relaxed text-atlas-muted">
          {filled.length === 0 ? (
            <p className="text-atlas-dim">
              No conditional analysis blocks are populated for this record.
            </p>
          ) : (
            filled.map(([key, text]) => (
              <div
                key={key}
                className="border-t border-atlas-border-dim pt-4 first:border-t-0 first:pt-0"
              >
                <h4 className="text-xs font-bold uppercase tracking-wide text-atlas-label">
                  {ANALYSIS_LABELS[key] ?? key}
                </h4>
                <p className="mt-2">{text}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

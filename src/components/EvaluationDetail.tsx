import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { AtlasEvaluation } from '../types/evaluation';
import {
  buildEvaluationHighlightTags,
  getHighlightTagStyle,
} from '../utils/evaluationHighlightTags';
import {
  formatScoreOutOf,
  formatSigned,
  getScaleMax,
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
  right,
  children,
}: {
  title: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-atlas-card border border-atlas-border bg-atlas-deep/80 p-4 shadow-atlas-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-atlas-label">
          {title}
        </h3>
        {right ? <div className="-mt-0.5 shrink-0">{right}</div> : null}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-atlas-muted">
        {children}
      </div>
    </section>
  );
}

export function EvaluationDetail({ evaluation }: EvaluationDetailProps) {
  const { theme: mode } = useTheme();
  const [scoreView, setScoreView] = useState<'calculation' | 'scales'>(
    'calculation'
  );
  const aa = evaluation.additional_analysis;
  const filled = Object.entries(aa).filter(
    ([, v]) => v != null && String(v).trim() !== ''
  ) as [string, string][];
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

      <InfoBlock
        title="Score calculation"
        right={
          <button
            type="button"
            onClick={() =>
              setScoreView((v) => (v === 'calculation' ? 'scales' : 'calculation'))
            }
            className="inline-flex items-center gap-2 rounded-full border border-atlas-border bg-atlas-deep/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-atlas-label transition-colors hover:border-atlas-border-glow hover:text-atlas-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
            aria-label={
              scoreView === 'calculation'
                ? 'Show simplified scale scores'
                : 'Show score calculation breakdown'
            }
          >
            <span>{scoreView === 'calculation' ? 'Scale scores' : 'Calculation'}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="opacity-90"
            >
              <path
                d="M12 6V4m0 16v-2m6-6h2M4 12h2m10.95-6.95 1.41-1.41M5.64 18.36l1.41-1.41m0-10.9-1.41-1.41m12.72 12.72-1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        }
      >
        {scoreView === 'calculation' ? (
          <dl className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
            <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
              <dt className="text-atlas-label">
                Raw{' '}
                <abbr
                  title="Established Truth Scale (ETS)"
                  className="font-sans font-bold text-atlas-bright-text underline decoration-atlas-border decoration-dotted underline-offset-2"
                >
                  Truth
                </abbr>{' '}
                score
              </dt>
              <dd>{evaluation.score_calculation.raw_ets}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
              <dt className="text-atlas-label">
                Raw{' '}
                <abbr
                  title="Scientific Engagement Scale (SES)"
                  className="font-sans font-bold text-atlas-bright-text underline decoration-atlas-border decoration-dotted underline-offset-2"
                >
                  Engagement
                </abbr>{' '}
                score
              </dt>
              <dd>{evaluation.score_calculation.raw_ses}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
              <dt className="text-atlas-label">
                Raw{' '}
                <abbr
                  title="Explanatory Integration Scale (EIS)"
                  className="font-sans font-bold text-atlas-bright-text underline decoration-atlas-border decoration-dotted underline-offset-2"
                >
                  Integration
                </abbr>{' '}
                score
              </dt>
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
        ) : (
          <dl className="space-y-4 text-sm">
            <div className="rounded-atlas-card border-2 border-atlas-brand/70 bg-atlas-void/50 p-4 shadow-atlas-glow-sm">
              <dt className="text-sm font-bold uppercase tracking-wider text-atlas-label">
                Truth (ETS){' '}
                <span className="font-normal normal-case text-atlas-dim">
                  — primary, out of {getScaleMax('ETS')}
                </span>
              </dt>
              <dd className="mt-2 text-atlas-bright-text">
                <span className="font-mono text-3xl font-black sm:text-4xl">
                  {formatSigned(evaluation.ets.score)}
                </span>
                <span className="ml-2 font-mono text-lg font-semibold text-atlas-muted">
                  {formatScoreOutOf(evaluation.ets.score, 'ETS')}
                </span>
                <p className="mt-2 text-sm text-atlas-muted">
                  {evaluation.ets.label}
                </p>
              </dd>
              {evaluation.ets.closure_status ? (
                <dd className="mt-1 text-xs text-atlas-dim">
                  Closure: {evaluation.ets.closure_status}
                </dd>
              ) : null}
            </div>
            <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
              <dt className="text-atlas-label">
                Engagement (SES){' '}
                <span className="font-normal text-atlas-dim">
                  (out of {getScaleMax('SES')})
                </span>
              </dt>
              <dd className="mt-1 text-atlas-bright-text">
                <span className="font-mono text-xl font-bold">
                  {formatSigned(evaluation.ses.score)}
                </span>
                <span className="ml-2 font-mono text-sm font-semibold text-atlas-muted">
                  {formatScoreOutOf(evaluation.ses.score, 'SES')}
                </span>
                <p className="mt-1 text-sm text-atlas-muted">
                  {evaluation.ses.label}
                </p>
              </dd>
              {evaluation.ses.counted_in_composite === false ? (
                <dd className="mt-1 text-xs text-atlas-dim">
                  Not counted in composite (negative override)
                </dd>
              ) : null}
            </div>
            <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
              <dt className="text-atlas-label">
                Integration (EIS){' '}
                <span className="font-normal text-atlas-dim">
                  (out of {getScaleMax('EIS')})
                </span>
              </dt>
              <dd className="mt-1 text-atlas-bright-text">
                <span className="font-mono text-xl font-bold">
                  {formatSigned(evaluation.eis.score)}
                </span>
                <span className="ml-2 font-mono text-sm font-semibold text-atlas-muted">
                  {formatScoreOutOf(evaluation.eis.score, 'EIS')}
                </span>
                <p className="mt-1 text-sm text-atlas-muted">
                  {evaluation.eis.label}
                </p>
              </dd>
              {evaluation.eis.counted_in_composite === false ? (
                <dd className="mt-1 text-xs text-atlas-dim">
                  Not counted in composite (negative override)
                </dd>
              ) : null}
            </div>
          </dl>
        )}
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

      <InfoBlock
        title={
          <>
            Established <span className="text-atlas-bright-text">Truth</span>{' '}
            Scale (ETS) justification
          </>
        }
      >
        <p>{evaluation.ets.justification}</p>
      </InfoBlock>
      <InfoBlock
        title={
          <>
            Scientific <span className="text-atlas-bright-text">Engagement</span>{' '}
            Scale (SES) justification
          </>
        }
      >
        <p>{evaluation.ses.justification}</p>
      </InfoBlock>
      <InfoBlock
        title={
          <>
            Explanatory <span className="text-atlas-bright-text">Integration</span>{' '}
            Scale (EIS) justification
          </>
        }
      >
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

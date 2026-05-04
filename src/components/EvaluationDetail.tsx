import * as Tabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';
import { formatSigned, getCompositeAccentColor } from '../utils/scoreColor';

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
  const aa = evaluation.additional_analysis;
  const filled = Object.entries(aa).filter(
    ([, v]) => v != null && String(v).trim() !== ''
  ) as [string, string][];

  return (
    <Tabs.Root defaultValue="overview" className="w-full">
      <Tabs.List
        className="mb-4 flex flex-wrap gap-2 border-b border-atlas-border pb-3"
        aria-label="Evaluation sections"
      >
        {(['overview', 'scoring', 'analysis'] as const).map((id) => (
          <Tabs.Trigger
            key={id}
            value={id}
            className={cn(
              'rounded-atlas-pill border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
              'text-atlas-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
              'data-[state=active]:border-atlas-bloom data-[state=active]:bg-atlas-vivid data-[state=active]:text-white data-[state=active]:shadow-atlas-glow-sm',
              'data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-atlas-white'
            )}
          >
            {id === 'overview' && 'Overview'}
            {id === 'scoring' && 'Scoring'}
            {id === 'analysis' && `Triggered notes (${filled.length})`}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="overview" className="space-y-4 outline-none">
        <InfoBlock title="Specific claim evaluated">
          <p className="text-atlas-bright-text">{evaluation.specific_claim}</p>
        </InfoBlock>
        <InfoBlock title="Framework description">
          <p>{evaluation.framework_description}</p>
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
        <InfoBlock title="Interpretation">
          <p className="text-atlas-bright-text">{evaluation.interpretation}</p>
        </InfoBlock>
      </Tabs.Content>

      <Tabs.Content value="scoring" className="space-y-4 outline-none">
        <InfoBlock title="Composite score">
          <p
            className="font-mono text-3xl font-black"
            style={{ color: getCompositeAccentColor(evaluation.composite_score) }}
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
              <dd className="mt-1 text-atlas-bright-text">
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
        <InfoBlock title="ETS justification">
          <p>{evaluation.ets.justification}</p>
        </InfoBlock>
        <InfoBlock title="SES justification">
          <p>{evaluation.ses.justification}</p>
        </InfoBlock>
        <InfoBlock title="EIS justification">
          <p>{evaluation.eis.justification}</p>
        </InfoBlock>
      </Tabs.Content>

      <Tabs.Content value="analysis" className="space-y-4 outline-none">
        {filled.length === 0 ? (
          <p className="text-sm text-atlas-dim">
            No conditional analysis blocks are populated for this record.
          </p>
        ) : (
          filled.map(([key, text]) => (
            <InfoBlock key={key} title={ANALYSIS_LABELS[key] ?? key}>
              <p>{text}</p>
            </InfoBlock>
          ))
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}

import type {ReactNode} from 'react';
import {useCallback, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {
    CompactSectionHeading,
    CompactSubheading,
} from './CompactSectionHeading';
import {ScoreTriptych} from './ScoreTriptych';
import {useTheme} from '../context/ThemeContext';
import type {AtlasEvaluation} from '../types/evaluation';
import {
    COMPACT_EXPAND_QUERY,
    readCompactExpandedPreference,
    writeCompactExpandedPreference,
} from '../utils/compactSectionId';
import {
    buildEvaluationHighlightTags,
    getHighlightTagStyle,
} from '../utils/evaluationHighlightTags';
import {getAppliedOverrides} from '../utils/overrideDisplay';
import {
    formatScoreOutOf,
    formatSigned,
    getCompositeAccentColor,
    getCompositePositiveRampT,
    getScaleMax,
    hexAlpha,
} from '../utils/scoreColor';
import {cn} from '../lib/cn';
import {
    CompactScaleJustificationTitle,
    ScaleAcronymHover,
} from './ScaleDisplay';

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

const EXPANDED_ONLY_SLUGS = new Set([
    'highlights',
    'domains',
    'ontological',
    'classification',
    'context',
    'interpretation',
    'score-calculation',
    'ets-justification',
    'ses-justification',
    'eis-justification',
    'overrides',
    'triggered-notes',
]);

function slugFromHash(hash: string): string | null {
    const id = hash.replace(/^#/, '');
    if (!id.startsWith('compact-')) return null;
    return id.slice('compact-'.length);
}

interface EvaluationDetailCompactProps {
    evaluation: AtlasEvaluation;
}

function CompactBlock({
                          children,
                          className,
                          divider = true,
                      }: {
    children: ReactNode;
    className?: string;
    divider?: boolean;
}) {
    return (
        <div
            className={cn(
                'mt-5',
                divider && 'border-t border-atlas-border-dim/60 pt-5',
                className
            )}
        >
            {children}
        </div>
    );
}

function ExpandToggleIcon({expanded}: { expanded: boolean }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="shrink-0 opacity-90"
        >
            {expanded ? (
                <path
                    d="m6 14 6-6 6 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ) : (
                <path
                    d="m6 10 6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
}

function AppliedBadge({mode}: { mode: 'day' | 'night' }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-bold',
                mode === 'day' ? 'text-emerald-600' : 'text-emerald-400'
            )}
        >
      <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="shrink-0"
      >
        <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
      Applied
    </span>
    );
}

export function EvaluationDetailCompact({
                                            evaluation,
                                        }: EvaluationDetailCompactProps) {
    const {theme: mode} = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [scoreView, setScoreView] = useState<'calculation' | 'scales'>(
        'calculation'
    );

    const expandedFromUrl =
        searchParams.get(COMPACT_EXPAND_QUERY) === '1' ||
        searchParams.get(COMPACT_EXPAND_QUERY) === 'true';

    const [expanded, setExpanded] = useState(
        () => expandedFromUrl || readCompactExpandedPreference()
    );

    const highlightTags = buildEvaluationHighlightTags(evaluation);
    const appliedOverrides = getAppliedOverrides(evaluation);
    const aa = evaluation.additional_analysis;
    const filled = Object.entries(aa).filter(
        ([, v]) => v != null && String(v).trim() !== ''
    ) as [string, string][];

    const compositeColor = getCompositeAccentColor(
        evaluation.composite_score,
        mode
    );

    const setExpandedWithUrl = useCallback(
        (next: boolean) => {
            setExpanded(next);
            writeCompactExpandedPreference(next);
            setSearchParams(
                (prev) => {
                    const params = new URLSearchParams(prev);
                    if (next) {
                        params.set(COMPACT_EXPAND_QUERY, '1');
                    } else {
                        params.delete(COMPACT_EXPAND_QUERY);
                    }
                    return params;
                },
                {replace: true}
            );
        },
        [setSearchParams]
    );

    useEffect(() => {
        if (expandedFromUrl) {
            writeCompactExpandedPreference(true);
        }
    }, [expandedFromUrl]);

    useEffect(() => {
        const shouldExpand = expandedFromUrl || readCompactExpandedPreference();
        setExpanded(shouldExpand);
        if (shouldExpand && !expandedFromUrl) {
            setSearchParams(
                (prev) => {
                    const params = new URLSearchParams(prev);
                    if (params.get(COMPACT_EXPAND_QUERY) === '1') return prev;
                    params.set(COMPACT_EXPAND_QUERY, '1');
                    return params;
                },
                {replace: true}
            );
        }
    }, [evaluation.id, expandedFromUrl, setSearchParams]);

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;
        const slug = slugFromHash(hash);
        if (slug && EXPANDED_ONLY_SLUGS.has(slug)) {
            setExpandedWithUrl(true);
        }
        const el = document.getElementById(hash.replace(/^#/, ''));
        if (el) {
            requestAnimationFrame(() => {
                el.scrollIntoView({behavior: 'smooth', block: 'start'});
            });
        }
    }, [evaluation.id, setExpandedWithUrl]);

    const listGridClass =
        'mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-atlas-muted sm:grid-cols-1';

    const highlightsGridClass =
        'mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2';

    const metaSectionGridClass = cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-0',
        '[&>*:nth-child(2n)]:sm:border-l [&>*:nth-child(2n)]:sm:border-atlas-border-dim',
        '[&>*:nth-child(2n)]:sm:pl-5 [&>*:nth-child(2n+1)]:sm:pr-5'
    );

    return (
        <>
            <article
                className="rounded-atlas-card border border-atlas-border bg-atlas-deep/80 p-4 shadow-atlas-card sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-2xl font-black tracking-tight text-atlas-white sm:text-3xl">
                        {evaluation.framework_name}
                    </h1>
                    <span
                        className="inline-flex items-center rounded-full border border-atlas-border bg-atlas-void/50 px-3 py-1 font-mono text-sm font-black"
                        style={{
                            color: compositeColor,
                            borderColor: hexAlpha(compositeColor, 0.65),
                        }}
                    >
          {formatSigned(evaluation.composite_score)}
        </span>
                </div>

                <CompactBlock divider={false}>
                    <CompactSectionHeading slug="composite">
                        Composite score
                    </CompactSectionHeading>
                    <p
                        className="mt-2 font-mono text-4xl font-black sm:text-5xl"
                        style={{
                            color: compositeColor,
                            ...(mode === 'day'
                                ? {textShadow: 'none'}
                                : {
                                    textShadow: `0 0 ${12 + getCompositePositiveRampT(evaluation.composite_score) * 20}px ${hexAlpha(compositeColor, 0.28)}`,
                                }),
                        }}
                    >
                        {formatSigned(evaluation.composite_score)}
                    </p>
                </CompactBlock>

                <CompactBlock>
                    <CompactSectionHeading slug="base-scores">
                        Base scores
                    </CompactSectionHeading>
                    <p className="mt-1 text-xs text-atlas-dim">
                        Truth (<ScaleAcronymHover acronym="ETS"/>) out of {getScaleMax('ETS')}
                        ; Engagement (<ScaleAcronymHover acronym="SES"/>) and Integration (
                        <ScaleAcronymHover acronym="EIS"/>) out of {getScaleMax('SES')}.
                    </p>
                    <div className="mt-2 -mx-1">
                        <ScoreTriptych evaluation={evaluation}/>
                    </div>
                </CompactBlock>

                <CompactBlock>
                    <CompactSectionHeading slug="specific-claim">
                        Specific claim evaluated
                    </CompactSectionHeading>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-atlas-bright-text">
                        {evaluation.specific_claim}
                    </p>
                </CompactBlock>

                <CompactBlock>
                    <CompactSectionHeading slug="framework-description">
                        Framework description
                    </CompactSectionHeading>
                    <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
                        {evaluation.framework_description}
                    </p>
                </CompactBlock>


                {expanded ? (
                    <div className="mt-6 space-y-0 border-t border-atlas-border-dim pt-6">
                        <div className={metaSectionGridClass}>
                            <CompactBlock className="mt-0" divider={false}>
                                <CompactSectionHeading slug="highlights">
                                    Highlights
                                </CompactSectionHeading>
                                <div className={highlightsGridClass}>
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
                            </CompactBlock>

                            <CompactBlock className="mt-0" divider={false}>
                                <CompactSectionHeading slug="domains">
                                    Domains of inquiry
                                </CompactSectionHeading>
                                <ul className={listGridClass}>
                                    {evaluation.domains_of_inquiry.map((d) => (
                                        <li key={d} className="list-disc list-inside">
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </CompactBlock>

                            <CompactBlock className="mt-0" divider={false}>
                                <CompactSectionHeading slug="ontological">
                                    Ontological scales
                                </CompactSectionHeading>
                                <ul className={listGridClass}>
                                    {evaluation.ontological_scales.map((s) => (
                                        <li key={s} className="list-disc list-inside">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </CompactBlock>

                            <CompactBlock className="mt-0" divider={false}>
                                <CompactSectionHeading slug="classification">
                                    Framework classification
                                </CompactSectionHeading>
                                <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wide text-atlas-label">
                                            Framework status
                                        </dt>
                                        <dd className="mt-1 text-sm text-atlas-bright-text">
                                            {evaluation.framework_status}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wide text-atlas-label">
                                            Claim type
                                        </dt>
                                        <dd className="mt-1 text-sm text-atlas-bright-text">
                                            {evaluation.claim_type}
                                        </dd>
                                    </div>
                                </dl>
                            </CompactBlock>
                        </div>

                        <CompactBlock>
                            <CompactSectionHeading slug="context">
                                Context of validity
                            </CompactSectionHeading>
                            <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
                                {evaluation.context_of_validity}
                            </p>
                        </CompactBlock>

                        <CompactBlock>
                            <CompactSectionHeading slug="interpretation">
                                Interpretation
                            </CompactSectionHeading>
                            <p className="mt-2 text-sm leading-relaxed text-atlas-bright-text">
                                {evaluation.interpretation}
                            </p>
                        </CompactBlock>

                        <CompactBlock>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <CompactSectionHeading slug="score-calculation">
                                    Score calculation
                                </CompactSectionHeading>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setScoreView((v) =>
                                            v === 'calculation' ? 'scales' : 'calculation'
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-full border border-atlas-border bg-atlas-deep/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-atlas-label transition-colors hover:border-atlas-border-glow hover:text-atlas-white"
                                >
                                    {scoreView === 'calculation' ? 'Scale scores' : 'Calculation'}
                                </button>
                            </div>
                            {scoreView === 'calculation' ? (
                                <dl className="mt-2 grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
                                    <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
                                        <dt className="text-atlas-label">Raw Truth score</dt>
                                        <dd>{evaluation.score_calculation.raw_ets}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
                                        <dt className="text-atlas-label">Raw Engagement score</dt>
                                        <dd>{evaluation.score_calculation.raw_ses}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2 border-b border-atlas-border-dim py-1">
                                        <dt className="text-atlas-label">Raw Integration score</dt>
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
                                    <div
                                        className="col-span-full flex justify-between border-t border-atlas-border pt-2">
                                        <dt className="text-atlas-label">Final score</dt>
                                        <dd className="font-bold text-atlas-bloom">
                                            {formatSigned(evaluation.score_calculation.final_score)}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <dl className="mt-2 space-y-3 text-sm">
                                    <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
                                        <dt className="text-xs font-bold uppercase text-atlas-label">
                                            Truth (ETS)
                                        </dt>
                                        <dd className="mt-1 font-mono text-xl font-bold text-atlas-bright-text">
                                            {formatSigned(evaluation.ets.score)}{' '}
                                            <span className="text-sm font-semibold text-atlas-muted">
                      {formatScoreOutOf(evaluation.ets.score, 'ETS')}
                    </span>
                                        </dd>
                                        <dd className="text-sm text-atlas-muted">
                                            {evaluation.ets.label}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
                                        <dt className="text-xs font-bold uppercase text-atlas-label">
                                            Engagement (SES)
                                        </dt>
                                        <dd className="mt-1 font-mono text-xl font-bold text-atlas-bright-text">
                                            {formatSigned(evaluation.ses.score)}{' '}
                                            <span className="text-sm font-semibold text-atlas-muted">
                      {formatScoreOutOf(evaluation.ses.score, 'SES')}
                    </span>
                                        </dd>
                                        <dd className="text-sm text-atlas-muted">
                                            {evaluation.ses.label}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-atlas-border-dim bg-atlas-void/40 p-3">
                                        <dt className="text-xs font-bold uppercase text-atlas-label">
                                            Integration (EIS)
                                        </dt>
                                        <dd className="mt-1 font-mono text-xl font-bold text-atlas-bright-text">
                                            {formatSigned(evaluation.eis.score)}{' '}
                                            <span className="text-sm font-semibold text-atlas-muted">
                      {formatScoreOutOf(evaluation.eis.score, 'EIS')}
                    </span>
                                        </dd>
                                        <dd className="text-sm text-atlas-muted">
                                            {evaluation.eis.label}
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </CompactBlock>

                        {appliedOverrides.length > 0 ? (
                            <CompactBlock>
                                <CompactSectionHeading slug="overrides">
                                    Overrides
                                </CompactSectionHeading>
                                <ul className="mt-2 space-y-4">
                                    {appliedOverrides.map((row) => (
                                        <li key={row.key} className="pt-1 first:pt-0">
                                            <p className="text-sm font-bold text-atlas-bright-text">
                                                {row.title}
                                            </p>
                                            <p className="mt-1">
                                                <AppliedBadge mode={mode}/>
                                            </p>
                                            <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
                                                {row.explanation}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </CompactBlock>
                        ) : null}

                        <CompactBlock>
                            <CompactSectionHeading slug="ets-justification">
                                <CompactScaleJustificationTitle acronym="ETS"/>
                            </CompactSectionHeading>
                            <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
                                {evaluation.ets.justification}
                            </p>
                        </CompactBlock>
                        <CompactBlock>
                            <CompactSectionHeading slug="ses-justification">
                                <CompactScaleJustificationTitle acronym="SES"/>
                            </CompactSectionHeading>
                            <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
                                {evaluation.ses.justification}
                            </p>
                        </CompactBlock>
                        <CompactBlock>
                            <CompactSectionHeading slug="eis-justification">
                                <CompactScaleJustificationTitle acronym="EIS"/>
                            </CompactSectionHeading>
                            <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
                                {evaluation.eis.justification}
                            </p>
                        </CompactBlock>

                        <CompactBlock>
                            <CompactSectionHeading slug="triggered-notes">
                                Triggered notes
                            </CompactSectionHeading>
                            <div className="mt-2 space-y-4 text-sm leading-relaxed text-atlas-muted">
                                {filled.length === 0 ? (
                                    <p className="text-atlas-dim">
                                        No conditional analysis blocks are populated for this record.
                                    </p>
                                ) : (
                                    filled.map(([key, text]) => (
                                        <div key={key}>
                                            <CompactSubheading>
                                                {ANALYSIS_LABELS[key] ?? key}
                                            </CompactSubheading>
                                            <p className="mt-2">{text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CompactBlock>

                    </div>
                ) : null}
            </article>
            <button
                type="button"
                onClick={() => setExpandedWithUrl(!expanded)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-atlas-pill border border-atlas-border bg-atlas-mid/40 px-4 py-2.5 text-sm font-bold text-atlas-white transition-colors hover:border-atlas-border-glow hover:bg-atlas-mid/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom"
                aria-expanded={expanded}
            >
                <ExpandToggleIcon expanded={expanded}/>
                {expanded ? 'Show Compact' : 'Show Full Evaluation'}
            </button>
        </>
    );
}

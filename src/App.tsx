import { useMemo, useState, type CSSProperties } from 'react';
import feed from '../atlas-score-examples.json';
import type { AtlasEvaluation, ExamplesFeed } from './types/evaluation';
import type { OntologicalScale } from './types/evaluation';
import { Header } from './components/Header';
import { EvaluationSelect } from './components/EvaluationSelect';
import { CompositeRangeSlider } from './components/CompositeRangeSlider';
import { OntologicalScaleBar } from './components/OntologicalScaleBar';
import { TheoryCard } from './components/TheoryCard';
import { ScoreTriptych } from './components/ScoreTriptych';
import { EvaluationDetail } from './components/EvaluationDetail';
import { ExplorerGuide } from './components/ExplorerGuide';
import {
  getCompositeAccentColor,
  getCompositeBarFillStyle,
  getCompositeBarWidth,
  formatSigned,
  hexAlpha,
} from './utils/scoreColor';
import * as Tooltip from '@radix-ui/react-tooltip';

const data = feed as ExamplesFeed;

function matchesFilters(
  ev: AtlasEvaluation,
  scale: OntologicalScale | 'all',
  range: [number, number]
): boolean {
  const [lo, hi] = range;
  if (ev.composite_score < lo || ev.composite_score > hi) return false;
  if (scale === 'all') return true;
  return ev.ontological_scales.includes(scale);
}

export default function App() {
  const examples = data.examples;
  const [selectedId, setSelectedId] = useState(examples[0]?.id ?? '');
  const [scaleFilter, setScaleFilter] = useState<OntologicalScale | 'all'>(
    'all'
  );
  const [compositeRange, setCompositeRange] = useState<[number, number]>([
    -5, 10,
  ]);

  const filtered = useMemo(
    () =>
      examples.filter((ev) => matchesFilters(ev, scaleFilter, compositeRange)),
    [examples, scaleFilter, compositeRange]
  );

  const current =
    examples.find((e) => e.id === selectedId) ?? examples[0] ?? null;

  if (!current) {
    return (
      <div className="min-h-screen bg-atlas-void p-8 text-atlas-muted">
        No evaluations loaded.
      </div>
    );
  }

  const heroBar = getCompositeBarWidth(current.composite_score);
  const heroAccent = getCompositeAccentColor(current.composite_score);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="min-h-screen bg-atlas-void bg-atlas-space font-body text-atlas-white">
        <Header />
        <main id="explorer" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="mb-2 text-xs uppercase tracking-widest text-atlas-label">
            {data.schema_version}
          </p>
          <h1 className="font-display text-3xl font-black tracking-tight text-atlas-white sm:text-4xl">
            ATLAS score explorer
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-muted">
            {data.description}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-atlas-muted">
            Each row in the feed is one bounded evaluation: a specific claim under
            a named framework, scored on three independent scales and rolled into
            a composite for quick comparison. Numbers are accompanied by labels and
            prose so colour and rank never stand alone—see the design system notes
            in{' '}
            <code className="rounded bg-atlas-deep px-1 font-mono text-atlas-label">
              design.md
            </code>{' '}
            for accessibility and visual rules.
          </p>

          <div className="mt-8">
            <ExplorerGuide />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(280px,360px)_1fr]">
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-2">
                <label
                  htmlFor="atlas-select"
                  className="text-xs font-bold uppercase tracking-widest text-atlas-label"
                >
                  Select evaluation
                </label>
                <div id="atlas-select">
                  <EvaluationSelect
                    evaluations={examples}
                    value={selectedId}
                    onChange={setSelectedId}
                  />
                </div>
              </div>

              <CompositeRangeSlider
                value={compositeRange}
                onChange={setCompositeRange}
              />

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
                  Ontological scale filter
                </p>
                <OntologicalScaleBar
                  active={[]}
                  filterMode
                  selectedFilter={scaleFilter}
                  onFilterSelect={setScaleFilter}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
                  Matching frameworks ({filtered.length})
                </p>
                {!filtered.some((e) => e.id === selectedId) && (
                    <p className="rounded-atlas-panel border border-atlas-vivid bg-atlas-mid/40 px-3 py-2 text-xs text-atlas-bright-text">
                      Selected evaluation is outside the current filters. Adjust
                      the slider or scale tabs, or pick a visible card.
                    </p>
                  )}
                <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
                  {filtered.map((ev) => (
                    <TheoryCard
                      key={ev.id}
                      evaluation={ev}
                      selected={ev.id === selectedId}
                      onSelect={() => setSelectedId(ev.id)}
                    />
                  ))}
                </div>
                {filtered.length === 0 && (
                  <p className="text-sm text-atlas-dim">
                    No records match these filters. Widen the composite range or
                    choose &quot;All&quot; scales.
                  </p>
                )}
              </div>
            </aside>

            <article className="min-w-0 space-y-8">
              <section
                className="atlas-hero-shimmer relative overflow-hidden rounded-atlas-card border border-atlas-border bg-atlas-space bg-[radial-gradient(ellipse_at_top,_#2e0f5e_0%,_#1a0a2e_50%,_#0f0520_100%)] px-6 py-8 shadow-atlas-card sm:px-10 sm:py-10"
                aria-labelledby="hero-title"
              >
                <div className="pointer-events-none absolute inset-0 bg-atlas-glow opacity-30" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-widest text-atlas-label">
                    {current.framework_status} · {current.claim_type}
                  </p>
                  <h2
                    id="hero-title"
                    className="mt-2 font-display text-3xl font-black tracking-tight text-atlas-white sm:text-4xl"
                  >
                    {current.framework_name}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-atlas-muted">
                    {current.specific_claim}
                  </p>
                  <div className="mt-6 flex flex-wrap items-end gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-atlas-label">
                        Composite
                      </p>
                      <p
                        className="font-mono text-4xl font-black sm:text-5xl"
                        style={{
                          color: heroAccent,
                          textShadow: `0 0 28px ${hexAlpha(heroAccent, 0.45)}`,
                        }}
                      >
                        {formatSigned(current.composite_score)}
                      </p>
                    </div>
                    <div className="min-w-[120px] flex-1 pb-1">
                      <div className="h-2 overflow-hidden rounded-full bg-atlas-mid">
                        <div
                          className="atlas-bar-fill h-full rounded-full"
                          style={
                            {
                              '--bar-width': heroBar,
                              ...getCompositeBarFillStyle(current.composite_score),
                            } as CSSProperties & { '--bar-width': string }
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3" aria-label="Ontological scales">
                <h3 className="text-xl font-bold uppercase tracking-widest text-atlas-white">
                  Ontological scales
                </h3>
                <OntologicalScaleBar active={current.ontological_scales} />
              </section>

              <section className="space-y-3" aria-label="Score triptych">
                <h3 className="text-xl font-bold uppercase tracking-widest text-atlas-white">
                  Sub-scores
                </h3>
                <ScoreTriptych evaluation={current} />
              </section>

              <EvaluationDetail evaluation={current} />
            </article>
          </div>

          <footer
            id="about"
            className="mt-20 border-t border-atlas-border pt-10 text-sm text-atlas-muted"
          >
            <h2 className="text-lg font-bold uppercase tracking-widest text-atlas-white">
              About this explorer
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed">
              Static React build styled with the ATLAS design system (Tailwind +
              Radix). Data conforms to{' '}
              <code className="rounded bg-atlas-deep px-1 font-mono text-atlas-label">
                atlas-evaluation-schema.json
              </code>{' '}
              and sample rows from{' '}
              <code className="rounded bg-atlas-deep px-1 font-mono text-atlas-label">
                atlas-score-examples.json
              </code>
              . Scores are diagnostic summaries of epistemic status, not final
              truth judgments.
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed">
              The composite score is bounded from −5 to +10 in this schema. Under
              a standard rule it is the sum of ETS + SES + EIS, but when ETS is
              debunked (−1), positive SES/EIS values are excluded so a false
              claim cannot look credible through &quot;busy science&quot; around
              it; when ETS reaches full mechanistic closure (4), the composite is
              anchored at 10 so domain-limited integration does not undercut a
              fully closed mechanism. Each JSON record states which rule was
              applied in{' '}
              <code className="rounded bg-atlas-deep px-1 font-mono text-atlas-label">
                score_calculation.rule_applied
              </code>
              .
            </p>
            <div className="mt-6 max-w-3xl rounded-atlas-card border border-atlas-border-dim bg-atlas-deep/50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-atlas-label">
                Repository documentation
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                <li>
                  <strong className="text-atlas-bright-text">README.md</strong>{' '}
                  — setup, npm scripts, project map, and where to change data.
                </li>
                <li>
                  <strong className="text-atlas-bright-text">generalInfo.md</strong>{' '}
                  — step-by-step account of how this UI was derived from{' '}
                  <code className="rounded bg-atlas-mid px-1 font-mono text-xs">
                    design.md
                  </code>
                  , the schema, and the example feed (maintainer handoff).
                </li>
                <li>
                  <strong className="text-atlas-bright-text">design.md</strong>{' '}
                  — canonical palette, typography, component recipes, and Radix
                  mapping for the ATLAS skin.
                </li>
              </ul>
              <p className="mt-3 text-xs text-atlas-dim">
                These markdown files live next to the source in the repository;
                the production <code className="font-mono">dist/</code> folder
                from <code className="font-mono">npm run build</code> does not
                copy them unless your deploy pipeline adds that step.
              </p>
            </div>
            {current.metadata?.evaluator && (
              <p className="mt-4 text-xs text-atlas-dim">
                Sample metadata: ATLAS {current.metadata.atlas_version} ·{' '}
                {current.metadata.evaluation_date} · {current.metadata.evaluator}
              </p>
            )}
          </footer>
        </main>
      </div>
    </Tooltip.Provider>
  );
}

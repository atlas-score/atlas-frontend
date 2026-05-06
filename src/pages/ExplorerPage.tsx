import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import feed from '../../atlas-score-examples.json';
import type { AtlasEvaluation, ExamplesFeed } from '../types/evaluation';
import type { OntologicalScale } from '../types/evaluation';
import { EvaluationSelect } from '../components/EvaluationSelect';
import { CompositeRangeSlider } from '../components/CompositeRangeSlider';
import { OntologicalScaleBar } from '../components/OntologicalScaleBar';
import { TheoryCard } from '../components/TheoryCard';
import { ScoreTriptych } from '../components/ScoreTriptych';
import { EvaluationDetail } from '../components/EvaluationDetail';
import { ExplorerGuide } from '../components/ExplorerGuide';
import {
  getCompositeAccentColor,
  getCompositeBarFillStyle,
  getCompositeBarWidth,
  getCompositePositiveRampT,
  formatSigned,
  hexAlpha,
} from '../utils/scoreColor';

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

export function ExplorerPage() {
  const { theme: mode } = useTheme();
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
      <div className="bg-atlas-void p-8 text-atlas-muted">
        No evaluations loaded.
      </div>
    );
  }

  const heroBar = getCompositeBarWidth(current.composite_score);
  const heroAccent = getCompositeAccentColor(current.composite_score, mode);
  const heroRamp = getCompositePositiveRampT(current.composite_score);

  return (
    <main
      id="explorer"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      <h1 className="font-display text-3xl font-black tracking-tight text-atlas-white sm:text-4xl">
        ATLAS score explorer
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-atlas-muted">
        Compare example evaluations of specific claims: a composite score,
        three sub-scores for truth, scientific engagement, and fit with
        established knowledge, plus narrative detail for context.
      </p>

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
                Selected evaluation is outside the current filters. Adjust the
                slider or scale tabs, or pick a visible card.
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
                          ...(mode === 'day'
                            ? { textShadow: 'none' }
                            : {
                                textShadow: `0 0 ${12 + heroRamp * 28}px ${hexAlpha(
                                  heroAccent,
                                  0.26 + heroRamp * 0.44
                                )}`,
                              }),
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
                              ...getCompositeBarFillStyle(
                                current.composite_score,
                                mode
                              ),
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
              Base scores
            </h3>
            <ScoreTriptych evaluation={current} />
          </section>

          <EvaluationDetail evaluation={current} />
        </article>
      </div>

      <div className="mt-14">
        <ExplorerGuide />
      </div>

      <footer
        id="about"
        className="mt-20 border-t border-atlas-border pt-8 text-sm text-atlas-muted"
      >
        <p className="max-w-2xl leading-relaxed">
          These scores support comparison and learning; they are not final
          judgments about a theory or claim.{' '}
          <Link
            to="/about"
            className="text-atlas-label underline decoration-atlas-border underline-offset-4 transition-colors hover:text-atlas-bloom"
          >
            About the ATLAS system
          </Link>
        </p>
      </footer>
    </main>
  );
}

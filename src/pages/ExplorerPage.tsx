import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import feed from '../../atlas-score-examples.json';
import type { ExamplesFeed } from '../types/evaluation';
import { ExplorerPanel, type ExplorerPanelState } from '../components/ExplorerPanel';
import { ExplorerGuide } from '../components/ExplorerGuide';
import { AtlasLogo } from '../components/AtlasLogo';
import { RecentTheoryHistory } from '../components/RecentTheoryHistory';

const data = feed as ExamplesFeed;

type ScaleFilter = ExplorerPanelState['scaleFilter'];

const SCALE_KEYS: readonly ScaleFilter[] = [
  'all',
  'Nano',
  'Micro',
  'Intermediate',
  'Macro',
  'Meta',
];

function parseScaleFilter(raw: string | null): ScaleFilter {
  if (!raw) return 'all';
  const t = raw.trim().toLowerCase();
  const hit = SCALE_KEYS.find((k) => String(k).toLowerCase() === t);
  return hit ?? 'all';
}

function parseRange(raw: string | null): [number, number] {
  if (!raw) return [-5, 10];
  const m = raw.match(/^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/);
  if (!m) return [-5, 10];
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return [-5, 10];
  const lo = Math.max(-5, Math.min(10, Math.min(a, b)));
  const hi = Math.max(-5, Math.min(10, Math.max(a, b)));
  return [lo, hi];
}

export function ExplorerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const examples = data.examples;
  const [sidebarOpen] = useState(true);

  const [panelState, setPanelState] = useState<ExplorerPanelState>(() => ({
    query: searchParams.get('q') ?? '',
    compositeRange: parseRange(searchParams.get('range')),
    scaleFilter: parseScaleFilter(searchParams.get('scale')),
  }));

  const pickCount = useMemo(() => examples.length, [examples.length]);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const range = parseRange(searchParams.get('range'));
    const scale = parseScaleFilter(searchParams.get('scale'));
    setPanelState((prev) => {
      if (
        prev.query === q &&
        prev.compositeRange[0] === range[0] &&
        prev.compositeRange[1] === range[1] &&
        prev.scaleFilter === scale
      ) {
        return prev;
      }
      return { query: q, compositeRange: range, scaleFilter: scale };
    });
  }, [searchParams]);

  const updatePanelState = (next: ExplorerPanelState) => {
    setPanelState(next);
    const params = new URLSearchParams(searchParams);
    if (next.query.trim()) params.set('q', next.query.trim());
    else params.delete('q');
    params.set('range', `${next.compositeRange[0]},${next.compositeRange[1]}`);
    if (next.scaleFilter !== 'all') params.set('scale', String(next.scaleFilter));
    else params.delete('scale');
    setSearchParams(params, { replace: true });
  };

  return (
    <main
      id="explorer"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      <header className="space-y-4">
        <h1 className="font-display text-3xl font-black tracking-tight text-atlas-white sm:text-4xl">
          ATLAS
        </h1>
        <p className="text-xs uppercase tracking-widest text-atlas-label">
          Loaded evaluations: {pickCount}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <article className="min-w-0 space-y-8">
          <section className="rounded-atlas-card border border-atlas-border bg-atlas-deep/50 p-6 shadow-atlas-card sm:p-8">
            <h2 className="font-display text-2xl font-black tracking-tight text-atlas-white">
              What is an ATLAS score?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-atlas-muted">
              ATLAS evaluates a specific claim using three base scales:<br />
              1. Established <strong>Truth</strong> Scale<br />
              2. Scientific <strong>Engagement</strong> Scale<br />
              3. Explanatory <strong>Integration</strong> Scale<br />
              to produce a composite diagnostic score.
            </p>
            <figure className="mt-8 flex justify-center">
              <AtlasLogo
                variant="hero"
                alt="ATLAS diagram: Truth (ETS), Engagement (SES), and Integration (EIS) forming the composite score"
                className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl"
              />
            </figure>
          </section>

          <section aria-label="Explorer">
            <div className="lg:hidden">
              <ExplorerPanel
                evaluations={examples}
                value={panelState}
                onChange={updatePanelState}
                onPickEvaluation={(ev) => navigate(`/${ev.id}`)}
                autoFocusSearch={false}
              />
            </div>
          </section>
        </article>

        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          {sidebarOpen ? (
            <ExplorerPanel
              evaluations={examples}
              value={panelState}
              onChange={updatePanelState}
              onPickEvaluation={(ev) => navigate(`/${ev.id}`)}
            />
          ) : null}
        </aside>
      </div>

      <div className="mt-12 lg:hidden">
        <ExplorerGuide />
      </div>

      <div className="mt-12 hidden lg:block">
        <ExplorerGuide />
      </div>

      <div className="mt-8">
        <RecentTheoryHistory evaluations={examples} limit={5} />
      </div>

      <div className="mt-14">
        <footer
          id="about"
          className="border-t border-atlas-border pt-8 text-sm text-atlas-muted"
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
      </div>
    </main>
  );
}

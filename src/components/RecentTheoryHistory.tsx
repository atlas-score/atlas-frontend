import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { AtlasEvaluation } from '../types/evaluation';
import { loadRecentTheoryViews } from '../utils/recentTheoryHistory';
import { normalizeSlug } from '../utils/normalizeSlug';

export function RecentTheoryHistory({
  evaluations,
  limit = 5,
}: {
  evaluations: AtlasEvaluation[];
  limit?: number;
}) {
  const items = useMemo(() => {
    const views = loadRecentTheoryViews();
    const byId = new Map<string, AtlasEvaluation>();
    for (const e of evaluations) byId.set(normalizeSlug(e.id), e);

    return views
      .map((v) => ({
        view: v,
        evaluation: byId.get(normalizeSlug(v.id)) ?? null,
      }))
      .filter((x) => x.evaluation != null)
      .slice(0, limit) as { view: { id: string; viewedAt: string }; evaluation: AtlasEvaluation }[];
  }, [evaluations, limit]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-atlas-card border border-atlas-border bg-atlas-deep/40 p-5 shadow-atlas-card">
      <h3 className="text-xs font-bold uppercase tracking-widest text-atlas-label">
        Recently viewed
      </h3>
      <div className="mt-3 space-y-2">
        {items.map(({ view, evaluation }) => (
          <Link
            key={`${evaluation.id}-${view.viewedAt}`}
            to={`/${evaluation.id}`}
            className="block rounded-atlas-panel border border-atlas-border/60 bg-atlas-void/60 px-4 py-3 transition-colors hover:border-atlas-border hover:bg-atlas-deep/70"
          >
            <p className="text-sm font-bold text-atlas-white">
              {evaluation.framework_name}
            </p>
            <p className="mt-1 text-xs text-atlas-muted">
              Viewed {new Date(view.viewedAt).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}


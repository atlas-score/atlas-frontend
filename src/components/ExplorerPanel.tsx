import { useMemo } from 'react';
import type { AtlasEvaluation } from '../types/evaluation';
import type { OntologicalScale } from '../types/evaluation';
import { CompositeRangeSlider } from './CompositeRangeSlider';
import { OntologicalScaleBar } from './OntologicalScaleBar';
import { fuzzySearchEvaluations } from '../utils/fuzzySearch';
import { cn } from '../lib/cn';

export interface ExplorerPanelState {
  query: string;
  compositeRange: [number, number];
  scaleFilter: OntologicalScale | 'all';
}

export interface ExplorerPanelProps {
  evaluations: AtlasEvaluation[];
  value: ExplorerPanelState;
  onChange: (next: ExplorerPanelState) => void;
  onPickEvaluation: (evaluation: AtlasEvaluation) => void;
  autoFocusSearch?: boolean;
  className?: string;
}

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

export function ExplorerPanel({
  evaluations,
  value,
  onChange,
  onPickEvaluation,
  autoFocusSearch,
  className,
}: ExplorerPanelProps) {
  const filtered = useMemo(
    () =>
      evaluations.filter((ev) =>
        matchesFilters(ev, value.scaleFilter, value.compositeRange)
      ),
    [evaluations, value.scaleFilter, value.compositeRange]
  );

  const searched = useMemo(() => {
    const q = value.query.trim();
    if (!q) return filtered;
    return fuzzySearchEvaluations(q, filtered, {
      limit: Math.max(25, filtered.length),
      minScore: 0.85,
    }).map((m) => m.evaluation);
  }, [value.query, filtered]);

  return (
    <section
      className={cn(
        'space-y-6 rounded-atlas-card border border-atlas-border bg-atlas-deep/40 p-5 shadow-atlas-card',
        className
      )}
      aria-label="Explorer"
    >
      <div className="space-y-2">
        <label
          htmlFor="atlas-search"
          className="text-xs font-bold uppercase tracking-widest text-atlas-label"
        >
          Search
        </label>
        <input
          id="atlas-search"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="Search theories (try “cos”, “intellligent”)…"
          autoFocus={autoFocusSearch}
          className={cn(
            'h-11 w-full rounded-atlas-card border border-atlas-border bg-atlas-deep px-4 text-sm text-atlas-bright-text shadow-atlas-card transition-colors',
            'placeholder:text-atlas-dim hover:border-atlas-border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void'
          )}
        />
      </div>

      <CompositeRangeSlider
        value={value.compositeRange}
        onChange={(next) => onChange({ ...value, compositeRange: next })}
      />

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
          Ontological scale filter
        </p>
        <OntologicalScaleBar
          active={[]}
          filterMode
          selectedFilter={value.scaleFilter}
          onFilterSelect={(next) => onChange({ ...value, scaleFilter: next })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
            Matching frameworks ({searched.length})
          </p>
          {value.query.trim() ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, query: '' })}
              className="text-xs font-semibold text-atlas-label underline decoration-atlas-border underline-offset-4 hover:text-atlas-bloom"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
          {searched.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => onPickEvaluation(ev)}
              className={cn(
                'w-full rounded-atlas-panel border border-atlas-border/60 bg-atlas-void/60 px-4 py-3 text-left shadow-atlas-card transition-colors',
                'hover:border-atlas-border hover:bg-atlas-deep/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void'
              )}
            >
              <p className="text-sm font-bold text-atlas-white">
                {ev.framework_name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-atlas-muted">
                {ev.specific_claim}
              </p>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-atlas-dim">
            No records match these filters. Widen the composite range or choose
            “All” scales.
          </p>
        ) : searched.length === 0 ? (
          <p className="text-sm text-atlas-dim">
            No results for this search. Try fewer letters or a different
            spelling.
          </p>
        ) : null}
      </div>
    </section>
  );
}


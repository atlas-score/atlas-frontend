import type { OntologicalScale } from '../types/evaluation';
import { cn } from '../lib/cn';
import { scalesToUpper } from '../utils/scoreColor';

const SCALES: OntologicalScale[] = [
  'Nano',
  'Micro',
  'Intermediate',
  'Macro',
  'Meta',
];

interface OntologicalScaleBarProps {
  active: OntologicalScale[];
  /** When used as filter tabs, highlight selected tab */
  filterMode?: boolean;
  selectedFilter?: OntologicalScale | 'all';
  onFilterSelect?: (scale: OntologicalScale | 'all') => void;
}

export function OntologicalScaleBar({
  active,
  filterMode,
  selectedFilter,
  onFilterSelect,
}: OntologicalScaleBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role={filterMode ? 'tablist' : undefined}
      aria-label="Ontological scales"
    >
      {filterMode && onFilterSelect && (
        <button
          type="button"
          role="tab"
          aria-selected={selectedFilter === 'all'}
          onClick={() => onFilterSelect('all')}
          className={cn(
            'rounded-atlas-panel border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
            selectedFilter === 'all'
              ? 'border-atlas-bloom bg-atlas-vivid text-white shadow-atlas-glow-sm'
              : 'border-atlas-border bg-atlas-deep text-atlas-dim hover:text-atlas-label'
          )}
        >
          All
        </button>
      )}
      {SCALES.map((scale) => {
        const isActiveOnTheory = active.includes(scale);
        const isSelectedTab = filterMode && selectedFilter === scale;
        if (filterMode && onFilterSelect) {
          return (
            <button
              key={scale}
              type="button"
              role="tab"
              aria-selected={isSelectedTab}
              onClick={() => onFilterSelect(scale)}
              className={cn(
                'rounded-atlas-panel border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
                isSelectedTab
                  ? 'border-atlas-bloom bg-atlas-vivid text-white shadow-atlas-glow-sm'
                  : 'border-atlas-border bg-atlas-deep text-atlas-dim hover:text-atlas-label'
              )}
            >
              {scalesToUpper(scale)}
            </button>
          );
        }
        return (
          <div
            key={scale}
            className={cn(
              'rounded-atlas-panel border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
              isActiveOnTheory
                ? 'border-atlas-bloom bg-atlas-vivid text-white shadow-atlas-glow-sm'
                : 'border-atlas-border bg-atlas-deep text-atlas-dim'
            )}
          >
            {scalesToUpper(scale)}
          </div>
        );
      })}
    </div>
  );
}

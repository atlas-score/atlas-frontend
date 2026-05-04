import type { CSSProperties } from 'react';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';
import { ScoreBadge } from './ScoreBadge';
import {
  getCompositeBarWidth,
  getScoreTextClass,
  formatSigned,
} from '../utils/scoreColor';

interface TheoryCardProps {
  evaluation: AtlasEvaluation;
  selected: boolean;
  onSelect: () => void;
}

export function TheoryCard({
  evaluation,
  selected,
  onSelect,
}: TheoryCardProps) {
  const { framework_name, composite_score, ets, ses, eis, metadata } =
    evaluation;
  const displayTags = [
    evaluation.framework_status,
    ...(metadata?.tags?.slice(0, 2) ?? []),
    ...evaluation.ontological_scales.map((s) => String(s)),
  ].slice(0, 5);

  const barWidth = getCompositeBarWidth(composite_score);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-atlas-card border p-5 text-left shadow-atlas-card transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
        selected
          ? 'border-atlas-border-glow bg-atlas-mid shadow-atlas-glow-md'
          : 'cursor-pointer border-atlas-border bg-atlas-deep hover:border-atlas-border-glow hover:shadow-atlas-glow-md'
      )}
    >
      <div
        className={cn(
          'absolute left-0 right-0 top-0 h-0.5 rounded-t-atlas-card',
          ets.score <= -1
            ? 'bg-atlas-debunked'
            : ets.score === 0
              ? 'bg-atlas-dim'
              : 'bg-atlas-vivid'
        )}
      />
      <h3 className="mb-1 text-lg font-bold text-atlas-white">
        {framework_name}
      </h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {displayTags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-atlas-mid px-2 py-0.5 text-xs text-atlas-label"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <ScoreBadge scale="SES" score={ses.score} />
        <ScoreBadge scale="ETS" score={ets.score} />
        <ScoreBadge scale="EIS" score={eis.score} />
        <span
          className={cn(
            'ml-auto font-mono text-2xl font-black',
            getScoreTextClass(composite_score)
          )}
        >
          {formatSigned(composite_score)}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-atlas-mid">
        <div
          className="atlas-bar-fill h-full rounded-full bg-gradient-to-r from-atlas-vivid to-atlas-bloom"
          style={{ '--bar-width': barWidth } as CSSProperties}
        />
      </div>
    </button>
  );
}

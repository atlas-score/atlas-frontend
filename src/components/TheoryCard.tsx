import type { CSSProperties } from 'react';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';
import { ScoreBadge } from './ScoreBadge';
import {
  getCompositeAccentColor,
  getCompositeBarFillStyle,
  getCompositeBarWidth,
  formatSigned,
  getTheoryCardChromeStyle,
  hexAlpha,
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
  const cardAccent = getCompositeAccentColor(composite_score);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full cursor-pointer rounded-atlas-card border p-5 text-left transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void'
      )}
      style={getTheoryCardChromeStyle(composite_score, selected)}
    >
      <div
        className="absolute left-0 right-0 top-0 h-0.5 rounded-t-atlas-card"
        style={{ backgroundColor: cardAccent }}
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
        <ScoreBadge scale="ETS" score={ets.score} />
        <ScoreBadge scale="SES" score={ses.score} />
        <ScoreBadge scale="EIS" score={eis.score} />
        <span
          className="ml-auto font-mono text-2xl font-black"
          style={{
            color: cardAccent,
            textShadow: `0 0 16px ${hexAlpha(cardAccent, 0.4)}`,
          }}
        >
          {formatSigned(composite_score)}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-atlas-mid">
        <div
          className="atlas-bar-fill h-full rounded-full"
          style={
            {
              '--bar-width': barWidth,
              ...getCompositeBarFillStyle(composite_score),
            } as CSSProperties
          }
        />
      </div>
    </button>
  );
}

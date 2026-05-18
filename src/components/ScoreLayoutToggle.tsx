import { useTheme } from '../context/ThemeContext';
import { useScoreLayout } from '../context/ScoreLayoutContext';
import { cn } from '../lib/cn';

export function ScoreLayoutToggle() {
  const { theme } = useTheme();
  const { layout, setLayout } = useScoreLayout();

  return (
    <div
      className={cn(
        'flex items-center gap-0 rounded-atlas-pill border p-1 backdrop-blur-sm',
        theme === 'night' &&
          'border-atlas-border bg-atlas-deep/90 shadow-atlas-card',
        theme === 'day' &&
          'border-atlas-border bg-atlas-deep shadow-md ring-1 ring-atlas-border-dim'
      )}
      role="group"
      aria-label="Score layout"
    >
      <span className="pl-3 pr-1 text-xs font-bold uppercase tracking-wider text-atlas-label">
        Layout
      </span>
      <div
        className={cn(
          'flex rounded-atlas-pill p-0.5',
          theme === 'night' && 'bg-atlas-mid/50',
          theme === 'day' && 'bg-atlas-mid'
        )}
      >
        <button
          type="button"
          onClick={() => setLayout('classic')}
          className={cn(
            'rounded-atlas-pill px-3 py-1.5 text-xs font-bold transition-colors',
            layout === 'classic'
              ? 'bg-atlas-vivid text-white shadow-sm'
              : 'text-atlas-muted hover:text-atlas-bright-text'
          )}
          aria-pressed={layout === 'classic'}
        >
          Classic
        </button>
        <button
          type="button"
          onClick={() => setLayout('compact')}
          className={cn(
            'rounded-atlas-pill px-3 py-1.5 text-xs font-bold transition-colors',
            layout === 'compact'
              ? 'bg-[#086783] text-white shadow-sm'
              : 'text-atlas-muted hover:text-atlas-bright-text'
          )}
          aria-pressed={layout === 'compact'}
        >
          Compact
        </button>
      </div>
    </div>
  );
}

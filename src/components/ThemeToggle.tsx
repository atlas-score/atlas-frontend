import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/cn';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

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
      aria-label="Colour theme"
    >
      <span
        className={cn(
          'pl-3 pr-1 text-xs font-bold uppercase tracking-wider',
          theme === 'night' && 'text-atlas-label',
          theme === 'day' && 'text-atlas-label'
        )}
      >
        Theme
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
          onClick={() => setTheme('night')}
          className={cn(
            'rounded-atlas-pill px-3 py-1.5 text-xs font-bold transition-colors',
            theme === 'night'
              ? 'bg-atlas-vivid text-white shadow-sm'
              : cn(
                  theme === 'day'
                    ? 'text-atlas-muted hover:text-atlas-bright-text'
                    : 'text-atlas-muted hover:text-atlas-bright-text'
                )
          )}
          aria-pressed={theme === 'night'}
        >
          Night
        </button>
        <button
          type="button"
          onClick={() => setTheme('day')}
          className={cn(
            'rounded-atlas-pill px-3 py-1.5 text-xs font-bold transition-colors',
            theme === 'day'
              ? 'bg-amber-100 text-amber-950 shadow-sm ring-1 ring-amber-300/70'
              : cn(
                  theme === 'night'
                    ? 'text-atlas-muted hover:text-atlas-white'
                    : 'text-atlas-muted hover:text-atlas-bright-text'
                )
          )}
          aria-pressed={theme === 'day'}
        >
          Day
        </button>
      </div>
    </div>
  );
}

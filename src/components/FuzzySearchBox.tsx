import * as Popover from '@radix-ui/react-popover';
import { useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AtlasEvaluation } from '../types/evaluation';
import { fuzzySearchEvaluations } from '../utils/fuzzySearch';
import { cn } from '../lib/cn';

export function FuzzySearchBox({
  evaluations,
  placeholder,
  onPick,
  onExplore,
  autoFocus,
  className,
  inputClassName,
}: {
  evaluations: AtlasEvaluation[];
  placeholder: string;
  onPick: (ev: AtlasEvaluation) => void;
  /** -- Override Explorer navigation (defaults to `navigate('/#explorer')`). */
  onExplore?: () => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const navigate = useNavigate();
  const resultsId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const goToExplorer = onExplore ?? (() => navigate('/#explorer'));

  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    if (!trimmedQuery) return [];
    return fuzzySearchEvaluations(trimmedQuery, evaluations, {
      limit: 8,
      minScore: 0.85,
    });
  }, [trimmedQuery, evaluations]);

  // -- Panel shows whenever there is a query and we want the menu (including zero-result state).
  const popoverOpen = open && trimmedQuery.length > 0;

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 140);
  };

  return (
    <Popover.Root
      open={popoverOpen}
      onOpenChange={(next) => {
        // -- Radix only needs us on dismiss; opening is driven by typing / Enter.
        if (!next) {
          clearCloseTimer();
          setOpen(false);
        }
      }}
    >
      <Popover.Anchor asChild>
        <div className={cn('relative', className)}>
          <input
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              if (v.trim().length > 0) {
                clearCloseTimer();
                setOpen(true);
              } else {
                clearCloseTimer();
                setOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              const q = e.currentTarget.value.trim();
              if (!q) return;
              e.preventDefault();
              clearCloseTimer();
              setOpen(true);
            }}
            onFocus={(e) => {
              clearCloseTimer();
              if (e.target.value.trim().length > 0) {
                setOpen(true);
              }
            }}
            onBlur={() => {
              // -- Let clicks on results / Explorer row register before closing.
              scheduleClose();
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              'h-10 w-full rounded-atlas-card border border-atlas-border bg-atlas-deep px-3 text-sm text-atlas-bright-text shadow-atlas-card transition-colors',
              'placeholder:text-atlas-dim hover:border-atlas-border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
              inputClassName
            )}
            aria-label="Search theories"
            aria-expanded={popoverOpen}
            aria-controls={resultsId}
            autoComplete="off"
          />
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          id={resultsId}
          side="bottom"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-[220] w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-atlas-card border border-atlas-border bg-atlas-void shadow-atlas-glow-lg"
        >
          <div className="max-h-[50vh] overflow-y-auto p-1">
            {results.length === 0 ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  clearCloseTimer();
                  setQuery('');
                  setOpen(false);
                  goToExplorer();
                }}
                className={cn(
                  'w-full rounded-atlas-panel px-3 py-2 text-left transition-colors',
                  'hover:bg-atlas-deep/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom'
                )}
              >
                <p className="text-sm font-bold text-atlas-white">
                  No matching theories
                </p>
                <p className="mt-0.5 text-xs text-atlas-muted">
                  Open the Explorer to browse or adjust filters.
                </p>
              </button>
            ) : (
              results.map(({ evaluation: ev }) => (
                <button
                  key={ev.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    clearCloseTimer();
                    setQuery('');
                    setOpen(false);
                    onPick(ev);
                  }}
                  className={cn(
                    'w-full rounded-atlas-panel px-3 py-2 text-left transition-colors',
                    'hover:bg-atlas-deep/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom'
                  )}
                >
                  <p className="text-sm font-bold text-atlas-white">
                    {ev.framework_name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-atlas-muted">
                    {ev.specific_claim}
                  </p>
                </button>
              ))
            )}
          </div>
          <Popover.Arrow className="fill-atlas-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}


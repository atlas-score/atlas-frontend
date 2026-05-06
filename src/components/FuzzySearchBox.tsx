import * as Popover from '@radix-ui/react-popover';
import { useMemo, useRef, useState } from 'react';
import type { AtlasEvaluation } from '../types/evaluation';
import { fuzzySearchEvaluations } from '../utils/fuzzySearch';
import { cn } from '../lib/cn';

export function FuzzySearchBox({
  evaluations,
  placeholder,
  onPick,
  autoFocus,
  className,
  inputClassName,
}: {
  evaluations: AtlasEvaluation[];
  placeholder: string;
  onPick: (ev: AtlasEvaluation) => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuzzySearchEvaluations(q, evaluations, {
      limit: 8,
      minScore: 0.85,
    });
  }, [query, evaluations]);

  const show = open && query.trim().length > 0 && results.length > 0;

  return (
    <Popover.Root open={show} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className={cn('relative', className)}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (closeTimer.current != null) {
                window.clearTimeout(closeTimer.current);
                closeTimer.current = null;
              }
              setOpen(true);
            }}
            onBlur={() => {
              // -- Let clicks on results register.
              if (closeTimer.current != null) {
                window.clearTimeout(closeTimer.current);
              }
              closeTimer.current = window.setTimeout(() => {
                setOpen(false);
                closeTimer.current = null;
              }, 140);
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              'h-10 w-full rounded-atlas-card border border-atlas-border bg-atlas-deep px-3 text-sm text-atlas-bright-text shadow-atlas-card transition-colors',
              'placeholder:text-atlas-dim hover:border-atlas-border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
              inputClassName
            )}
            aria-label="Search theories"
          />
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-[220] w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-atlas-card border border-atlas-border bg-atlas-void shadow-atlas-glow-lg"
        >
          <div className="max-h-[50vh] overflow-y-auto p-1">
            {results.map(({ evaluation: ev }) => (
              <button
                key={ev.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (closeTimer.current != null) {
                    window.clearTimeout(closeTimer.current);
                    closeTimer.current = null;
                  }
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
            ))}
          </div>
          <Popover.Arrow className="fill-atlas-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}


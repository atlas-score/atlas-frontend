import * as Select from '@radix-ui/react-select';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';

interface EvaluationSelectProps {
  evaluations: AtlasEvaluation[];
  value: string;
  onChange: (id: string) => void;
}

export function EvaluationSelect({
  evaluations,
  value,
  onChange,
}: EvaluationSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          'inline-flex h-11 min-w-[240px] max-w-full items-center justify-between gap-2 rounded-atlas-card border border-atlas-border bg-atlas-deep px-4 text-left text-sm font-medium text-atlas-bright-text shadow-atlas-card transition-colors',
          'hover:border-atlas-border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void data-[state=open]:border-atlas-border-glow'
        )}
        aria-label="Select an ATLAS evaluation"
      >
        <Select.Value placeholder="Choose a framework…" />
        <Select.Icon aria-hidden>
          <svg
            className="h-4 w-4 shrink-0 text-atlas-glow"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 5.5L7.5 9.5L11.5 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-[200] max-h-[min(70vh,480px)] overflow-hidden rounded-atlas-card border border-atlas-border bg-atlas-deep shadow-atlas-glow-lg"
          position="popper"
          sideOffset={6}
        >
          <Select.ScrollUpButton className="flex h-6 items-center justify-center text-atlas-label" />
          <Select.Viewport className="p-1">
            {evaluations.map((ev) => (
              <Select.Item
                key={ev.id}
                value={ev.id}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-atlas-panel py-2.5 pl-8 pr-3 text-sm text-atlas-muted outline-none',
                  'data-[highlighted]:bg-atlas-mid data-[highlighted]:text-atlas-white data-[state=checked]:text-atlas-bloom'
                )}
              >
                <Select.ItemIndicator className="absolute left-2 flex w-4 items-center justify-center">
                  <svg
                    className="h-4 w-4 text-atlas-bloom"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 7.5L6 10L11.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Select.ItemIndicator>
                <Select.ItemText>{ev.framework_name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-6 items-center justify-center text-atlas-label" />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

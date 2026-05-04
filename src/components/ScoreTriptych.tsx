import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';
import {
  formatSigned,
  getETSPillClass,
  getSecondaryPillClass,
} from '../utils/scoreColor';

interface PanelProps {
  acronym: 'SES' | 'ETS' | 'EIS';
  fullName: string;
  score: number;
  label: string;
  justification: string;
  pillClass: string;
}

function TriptychPanel({
  acronym,
  fullName,
  score,
  label,
  justification,
  pillClass,
}: PanelProps) {
  const isTruth = acronym === 'ETS'
  const aria = `${acronym}, ${fullName}, score ${formatSigned(
    score
  )}, ${label}`

  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <div
          role="group"
          aria-label={aria}
          className={cn(
            'flex min-w-0 flex-1 flex-col items-center rounded-atlas-card p-4 transition-all duration-300 sm:p-6',
            isTruth
              ? cn(
                  'relative z-[1] border-2 border-atlas-bloom bg-gradient-to-br from-atlas-brand/50 via-atlas-rich/80 to-atlas-deep',
                  'shadow-atlas-glow-lg ring-1 ring-inset ring-atlas-bloom/25',
                  'hover:border-atlas-glow hover:shadow-atlas-bloom hover:ring-atlas-bloom/40'
                )
              : cn(
                  'border border-atlas-border bg-atlas-deep shadow-atlas-card',
                  'hover:border-atlas-border-glow hover:shadow-atlas-glow-md'
                )
          )}
        >
          <span
            className={cn(
              'font-mono text-xl font-bold tracking-widest sm:text-2xl',
              isTruth
                ? 'text-atlas-bloom drop-shadow-[0_0_16px_rgba(168,85,247,0.55)]'
                : 'text-atlas-vivid'
            )}
          >
            {acronym}
          </span>
          <span
            className={cn(
              'mt-1 text-center text-xs uppercase tracking-wider',
              isTruth ? 'text-atlas-bright-text' : 'text-atlas-label'
            )}
          >
            {fullName}
          </span>
          <div className="my-3 sm:my-4">
            <span
              className={cn(
                'font-mono text-5xl font-black sm:text-6xl',
                isTruth
                  ? 'text-atlas-bright-text drop-shadow-[0_0_22px_rgba(139,92,246,0.35)]'
                  : 'text-atlas-white'
              )}
            >
              {formatSigned(score)}
            </span>
          </div>
          <span
            className={cn(
              'max-w-full rounded-atlas-pill px-3 py-1.5 text-center text-xs font-semibold sm:px-4 sm:text-sm',
              pillClass
            )}
          >
            {label}
          </span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-[100] max-w-sm rounded-atlas-panel border border-atlas-border bg-atlas-void p-3 text-xs leading-relaxed text-atlas-muted shadow-atlas-glow-md"
          sideOffset={8}
        >
          <p className="font-semibold text-atlas-bright-text">Justification</p>
          <p className="mt-1">{justification}</p>
          <Tooltip.Arrow className="fill-atlas-border" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface ScoreTriptychProps {
  evaluation: AtlasEvaluation;
}

export function ScoreTriptych({ evaluation }: ScoreTriptychProps) {
  const { ets, ses, eis } = evaluation;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-0">
        <TriptychPanel
          acronym="ETS"
          fullName="Established Truth Scale"
          score={ets.score}
          label={ets.label}
          justification={ets.justification}
          pillClass={getETSPillClass(ets.score)}
        />
        <Separator.Root
          orientation="vertical"
          decorative
          className="hidden w-px shrink-0 self-stretch bg-atlas-border md:block"
        />
        <Separator.Root
          orientation="horizontal"
          decorative
          className="h-px w-full bg-atlas-border md:hidden"
        />
        <TriptychPanel
          acronym="SES"
          fullName="Scientific Engagement Scale"
          score={ses.score}
          label={ses.label}
          justification={ses.justification}
          pillClass={getSecondaryPillClass(ses.score)}
        />
        <Separator.Root
          orientation="vertical"
          decorative
          className="hidden w-px shrink-0 self-stretch bg-atlas-border md:block"
        />
        <Separator.Root
          orientation="horizontal"
          decorative
          className="h-px w-full bg-atlas-border md:hidden"
        />
        <TriptychPanel
          acronym="EIS"
          fullName="Explanatory Integration Scale"
          score={eis.score}
          label={eis.label}
          justification={eis.justification}
          pillClass={getSecondaryPillClass(eis.score)}
        />
      </div>
    </div>
  );
}

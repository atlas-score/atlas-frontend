import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import * as Popover from '@radix-ui/react-popover';
import { useTheme } from '../context/ThemeContext';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';
import {
  formatSigned,
  getEtsAccentColor,
  getSesEisAccentColor,
  getSubscalePillStyle,
  getTriptychPanelChromeStyle,
  triptychAcronymStyle,
  triptychScoreNumberStyle,
  triptychSubtitleStyle,
} from '../utils/scoreColor';

interface PanelProps {
  acronym: 'SES' | 'ETS' | 'EIS';
  primaryName: 'Truth' | 'Engagement' | 'Integration';
  fullName: string;
  score: number;
  label: string;
  justification: string;
  mode: 'day' | 'night';
}

function triptychScaleKey(
  acronym: PanelProps['acronym']
): 'ets' | 'ses' | 'eis' {
  if (acronym === 'ETS') return 'ets';
  if (acronym === 'SES') return 'ses';
  return 'eis';
}

function TriptychPanel({
  acronym,
  primaryName,
  fullName,
  score,
  label,
  justification,
  mode,
}: PanelProps) {
  const accent =
    acronym === 'ETS'
      ? getEtsAccentColor(score, mode)
      : getSesEisAccentColor(score, mode);
  const panelStyle = getTriptychPanelChromeStyle(acronym, score, mode);
  const pillStyle = getSubscalePillStyle(triptychScaleKey(acronym), score, mode);
  const aria = `${primaryName} (${acronym}), ${fullName}, score ${formatSigned(
    score
  )}, ${label}`;

  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <div
          role="group"
          aria-label={aria}
          className={cn(
            'flex min-w-0 flex-1 flex-col items-center rounded-atlas-card p-4 transition-all duration-300 sm:p-6',
            mode === 'night' && 'hover:brightness-[1.03]',
            mode === 'day' && 'hover:bg-atlas-mid/30'
          )}
          style={panelStyle}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="text-center text-sm font-black uppercase tracking-widest text-atlas-white"
              style={triptychAcronymStyle(accent, mode)}
            >
              {primaryName}
            </span>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    'rounded-full border px-2 py-1 font-mono text-[11px] font-bold tracking-widest transition-colors',
                    'border-atlas-border text-atlas-label hover:text-atlas-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void'
                  )}
                  aria-label={`${fullName} (${acronym})`}
                >
                  {acronym}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-[100] max-w-xs rounded-atlas-panel border border-atlas-border bg-atlas-deep p-3 text-sm leading-relaxed text-atlas-muted shadow-atlas-glow-md"
                  sideOffset={8}
                >
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-atlas-vivid">
                    {primaryName} · {acronym}
                  </p>
                  <p className="mt-1 text-atlas-bright-text">{fullName}</p>
                  <Popover.Arrow className="fill-atlas-border" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <span
            className="mt-2 text-center text-xs uppercase tracking-wider"
            style={triptychSubtitleStyle(accent, mode)}
          >
            {label}
          </span>
          <div className="my-3 sm:my-4">
            <span
              className="font-mono text-5xl font-black sm:text-6xl"
              style={triptychScoreNumberStyle(accent, mode)}
            >
              {formatSigned(score)}
            </span>
          </div>
          <span
            className="max-w-full rounded-atlas-pill px-3 py-1.5 text-center text-xs font-semibold sm:px-4 sm:text-sm"
            style={pillStyle}
          >
            {fullName}
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
  const { theme: mode } = useTheme();
  const { ets, ses, eis } = evaluation;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-0">
        <TriptychPanel
          acronym="ETS"
          primaryName="Truth"
          fullName="Established Truth Scale"
          score={ets.score}
          label={ets.label}
          justification={ets.justification}
          mode={mode}
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
          primaryName="Engagement"
          fullName="Scientific Engagement Scale"
          score={ses.score}
          label={ses.label}
          justification={ses.justification}
          mode={mode}
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
          primaryName="Integration"
          fullName="Explanatory Integration Scale"
          score={eis.score}
          label={eis.label}
          justification={eis.justification}
          mode={mode}
        />
      </div>
    </div>
  );
}

import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import * as Popover from '@radix-ui/react-popover';
import { useTheme } from '../context/ThemeContext';
import type { AtlasEvaluation } from '../types/evaluation';
import { cn } from '../lib/cn';
import {
  ACRONYM_TO_SCALE,
  formatScoreOutOf,
  formatSigned,
  getEtsAccentColor,
  getScaleMax,
  getSesEisAccentColor,
  getSubscalePillStyle,
  getTriptychPanelChromeStyle,
  SCALE_MIN,
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
  emphasized?: boolean;
}

function scaleRangeLabel(acronym: PanelProps['acronym']): string {
  const key = ACRONYM_TO_SCALE[acronym];
  const min = SCALE_MIN[key];
  const max = getScaleMax(acronym);
  return `Valid range ${min} to +${max}; displayed as score out of ${max}`;
}

function TriptychPanel({
  acronym,
  primaryName,
  fullName,
  score,
  label,
  justification,
  mode,
  emphasized = false,
}: PanelProps) {
  const scaleKey = ACRONYM_TO_SCALE[acronym];
  const accent =
    acronym === 'ETS'
      ? getEtsAccentColor(score, mode)
      : getSesEisAccentColor(score, mode);
  const panelStyle = getTriptychPanelChromeStyle(acronym, score, mode);
  const pillStyle = getSubscalePillStyle(scaleKey, score, mode);
  const aria = `${primaryName} (${acronym}), ${fullName}, score ${formatScoreOutOf(
    score,
    acronym
  )}, ${label}`;

  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <div
          role="group"
          aria-label={aria}
          className={cn(
            'flex min-w-0 flex-col items-center rounded-atlas-card transition-all duration-300',
            emphasized
              ? 'flex-[1.35] p-5 sm:p-7 md:p-8'
              : 'flex-1 p-4 sm:p-5 md:p-6',
            mode === 'night' && 'hover:brightness-[1.03]',
            mode === 'day' && 'hover:bg-atlas-mid/30'
          )}
          style={panelStyle}
        >
          <div
            className={cn(
              'flex flex-wrap items-center justify-center gap-2',
              emphasized && 'gap-2.5'
            )}
          >
            <span
              className={cn(
                'text-center font-black uppercase tracking-widest text-atlas-white',
                emphasized ? 'text-base sm:text-lg' : 'text-sm'
              )}
              style={triptychAcronymStyle(accent, mode)}
            >
              {primaryName}
            </span>
            {emphasized ? (
              <span className="rounded-full border border-atlas-border-glow/60 bg-atlas-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-atlas-label">
                Primary
              </span>
            ) : null}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    'rounded-full border px-2 py-1 font-mono font-bold tracking-widest transition-colors',
                    'border-atlas-border text-atlas-label hover:text-atlas-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
                    emphasized ? 'text-xs' : 'text-[11px]'
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
                  <p className="mt-2 text-xs text-atlas-dim">
                    {scaleRangeLabel(acronym)}
                  </p>
                  <Popover.Arrow className="fill-atlas-border" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          <div
            className={cn(
              'flex flex-col items-center',
              emphasized ? 'my-4 sm:my-5' : 'my-3 sm:my-4'
            )}
          >
            <span
              className={cn(
                'font-mono font-black leading-none',
                emphasized ? 'text-6xl sm:text-7xl md:text-8xl' : 'text-4xl sm:text-5xl'
              )}
              style={triptychScoreNumberStyle(accent, mode)}
            >
              {formatSigned(score)}
            </span>
            <span
              className={cn(
                'mt-2 font-mono font-semibold text-atlas-muted',
                emphasized ? 'text-base sm:text-lg' : 'text-sm'
              )}
            >
              {formatScoreOutOf(score, acronym)}
            </span>
          </div>

          <span
            className="max-w-full text-center text-xs font-semibold uppercase tracking-wide sm:text-sm"
            style={triptychSubtitleStyle(accent, mode)}
          >
            {label}
          </span>

          <span
            className={cn(
              'mt-3 max-w-full rounded-atlas-pill px-3 py-1.5 text-center font-semibold text-atlas-muted',
              emphasized ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
            )}
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
          emphasized
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

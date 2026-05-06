import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
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
  const aria = `${acronym}, ${fullName}, score ${formatSigned(
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
          <span
            className="font-mono text-xl font-bold tracking-widest sm:text-2xl"
            style={triptychAcronymStyle(accent, mode)}
          >
            {acronym}
          </span>
          <span
            className="mt-1 text-center text-xs uppercase tracking-wider"
            style={triptychSubtitleStyle(accent, mode)}
          >
            {fullName}
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
  const { theme: mode } = useTheme();
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

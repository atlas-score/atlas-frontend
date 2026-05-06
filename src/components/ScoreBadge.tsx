import * as Popover from '@radix-ui/react-popover';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/cn';
import { formatSigned, getSubscalePillStyle } from '../utils/scoreColor';

const SCALE_BLURBS: Record<string, string> = {
  ETS:
    'Established Truth Scale: convergent evidence and justification for the claim (−1 debunked … +4 mechanistic closure).',
  SES:
    'Scientific Engagement Scale: how the framework participates in falsifiable, evidence-led inquiry (−2 anti-scientific … +3 core program).',
  EIS:
    'Explanatory Integration Scale: fit with the broader architecture of established knowledge (−2 systemically incompatible … +3 architectonic).',
};

type Scale = 'ETS' | 'SES' | 'EIS';

const SCALE_KEY: Record<Scale, 'ets' | 'ses' | 'eis'> = {
  ETS: 'ets',
  SES: 'ses',
  EIS: 'eis',
};

interface ScoreBadgeProps {
  scale: Scale;
  score: number;
  className?: string;
}

export function ScoreBadge({ scale, score, className }: ScoreBadgeProps) {
  const { theme: mode } = useTheme();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
            className
          )}
          style={getSubscalePillStyle(SCALE_KEY[scale], score, mode)}
          aria-label={`${scale} score ${formatSigned(score)}, open scale definition`}
        >
          <span
            className={cn(
              mode === 'night' && 'opacity-90',
              mode === 'day' && 'opacity-80'
            )}
          >
            {scale}
          </span>
          <span>{formatSigned(score)}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[100] max-w-xs rounded-atlas-panel border border-atlas-border bg-atlas-deep p-3 text-sm leading-relaxed text-atlas-muted shadow-atlas-glow-md"
          sideOffset={6}
        >
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-atlas-vivid">
            {scale}
          </p>
          <p className="mt-1">{SCALE_BLURBS[scale]}</p>
          <Popover.Arrow className="fill-atlas-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

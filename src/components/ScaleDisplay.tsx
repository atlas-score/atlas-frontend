import * as Tooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import type { ScaleAcronym } from '../utils/scoreColor';
import { cn } from '../lib/cn';

export const SCALE_META: Record<
  ScaleAcronym,
  { prefix: string; emphasis: string; suffix: string }
> = {
  ETS: { prefix: 'Established', emphasis: 'Truth', suffix: 'Scale' },
  SES: { prefix: 'Scientific', emphasis: 'Engagement', suffix: 'Scale' },
  EIS: { prefix: 'Explanatory', emphasis: 'Integration', suffix: 'Scale' },
};

function scalePlainTitle(acronym: ScaleAcronym): string {
  const { prefix, emphasis, suffix } = SCALE_META[acronym];
  return `${prefix} ${emphasis} ${suffix} (${acronym})`;
}

/** Full scale name with the key word emphasized (classic justification headings). */
export function ScaleFullName({
  acronym,
  className,
}: {
  acronym: ScaleAcronym;
  className?: string;
}) {
  const { prefix, emphasis, suffix } = SCALE_META[acronym];
  return (
    <span className={className}>
      {prefix}{' '}
      <span className="text-atlas-bright-text">{emphasis}</span> {suffix}
    </span>
  );
}

/** Classic-mode justification section title. */
export function ScaleJustificationTitle({
  acronym,
}: {
  acronym: ScaleAcronym;
}) {
  return (
    <>
      <ScaleFullName acronym={acronym} /> ({acronym}) justification
    </>
  );
}

/** Compact-mode justification title: acronym with full-name tooltip. */
export function CompactScaleJustificationTitle({
  acronym,
}: {
  acronym: ScaleAcronym;
}) {
  return (
    <>
      <ScaleAcronymHover acronym={acronym} /> justification
    </>
  );
}

const abbrClassName =
  'cursor-help font-inherit underline decoration-atlas-border decoration-dotted underline-offset-2';

/** Hover/focus tooltip for a bare scale acronym (matches classic abbr + rich tooltip). */
export function ScaleAcronymHover({
  acronym,
  className,
}: {
  acronym: ScaleAcronym;
  className?: string;
}) {
  const title = scalePlainTitle(acronym);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <abbr
          title={title}
          tabIndex={0}
          className={cn(abbrClassName, className)}
        >
          {acronym}
        </abbr>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-[100] max-w-xs rounded-atlas-panel border border-atlas-border bg-atlas-deep px-3 py-2 text-sm normal-case leading-snug tracking-normal text-atlas-muted shadow-atlas-glow-md"
          sideOffset={6}
        >
          <ScaleFullName acronym={acronym} />
          <Tooltip.Arrow className="fill-atlas-border" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** Raw score row label word with abbr title (classic score calculation). */
export function ScaleScoreLabelWord({
  acronym,
  children,
}: {
  acronym: ScaleAcronym;
  children: ReactNode;
}) {
  return (
    <abbr
      title={scalePlainTitle(acronym)}
      className="font-sans font-bold text-atlas-bright-text underline decoration-atlas-border decoration-dotted underline-offset-2"
    >
      {children}
    </abbr>
  );
}

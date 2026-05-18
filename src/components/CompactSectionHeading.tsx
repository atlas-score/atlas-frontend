import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { compactSectionId } from '../utils/compactSectionId';

interface CompactSectionHeadingProps {
  slug: string;
  children: ReactNode;
  className?: string;
}

async function copySectionUrl(sectionId: string) {
  const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${sectionId}`;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const el = document.createElement('textarea');
    el.value = url;
    el.setAttribute('readonly', 'true');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

/** Main section title (H2) in compact evaluation layout */
export function CompactSectionHeading({
  slug,
  children,
  className,
}: CompactSectionHeadingProps) {
  const id = compactSectionId(slug);

  return (
    <div className={cn('group flex scroll-mt-24 items-center gap-2', className)}>
      <h2
        id={id}
        className="font-display text-xs font-black uppercase tracking-widest text-[#039ad2]"
      >
        {children}
      </h2>
      <button
        type="button"
        onClick={() => copySectionUrl(id)}
        className={cn(
          'inline-flex shrink-0 items-center rounded border border-transparent bg-transparent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-atlas-dim opacity-0 transition-[opacity,border-color,background-color,color] hover:border-atlas-border hover:bg-atlas-void/40 hover:text-atlas-label hover:opacity-100 focus-visible:border-atlas-border focus-visible:bg-atlas-void/40 focus-visible:text-atlas-label focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom',
          'group-hover:opacity-70 group-hover:hover:opacity-100',
          'motion-reduce:opacity-100 motion-reduce:group-hover:opacity-100'
        )}
        aria-label={`Copy link to ${slug.replace(/-/g, ' ')} section`}
        title="Copy section link"
      >
        #
      </button>
    </div>
  );
}

/** Sub-section title (H3) under a compact section, e.g. triggered analysis blocks */
export function CompactSubheading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'font-display text-xs font-black uppercase tracking-widest text-[#086783]',
        className
      )}
    >
      {children}
    </h3>
  );
}

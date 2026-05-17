import type { CSSProperties } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';
import feed from '../../atlas-score-examples.json';
import type { ExamplesFeed } from '../types/evaluation';
import { AtlasLogo, HEADER_LOGO_SIZE_REM } from './AtlasLogo';
import { FuzzySearchBox } from './FuzzySearchBox';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-[2.5rem] items-center rounded-t-atlas-card border border-b-0 px-4 py-2 text-sm font-bold tracking-wide transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
    isActive
      ? 'border-atlas-bloom bg-atlas-mid text-atlas-white shadow-atlas-glow-sm'
      : 'border-atlas-border/60 border-b-atlas-void bg-atlas-void/80 text-atlas-label hover:border-atlas-border hover:bg-atlas-deep/80 hover:text-atlas-white'
  );

const data = feed as ExamplesFeed;

const logoRest = `${HEADER_LOGO_SIZE_REM}rem`;
const logoHoverMax = `min(${HEADER_LOGO_SIZE_REM * 2}rem, calc(100dvh - 6rem), calc(100vw - 2rem))`;

export function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b border-atlas-border bg-atlas-void/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-x-4 gap-y-3 px-4 pb-3 pt-4 sm:px-6">
        <Link
          to="/"
          className={cn(
            'group -ml-1 flex max-w-full items-start gap-3 rounded-atlas-card p-2 transition-[padding,background-color] duration-200 ease-out',
            'hover:bg-atlas-deep/50 hover:pb-3',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
            'motion-reduce:transition-none motion-reduce:hover:pb-2'
          )}
        >
          <span
            className={cn(
              'flex shrink-0 items-center justify-center',
              'h-[var(--logo-rest)] w-[var(--logo-rest)]',
              'transition-[width,height,filter] duration-200 ease-out',
              'group-hover:h-[var(--logo-hover)] group-hover:w-[var(--logo-hover)]',
              'group-hover:drop-shadow-[0_6px_20px_rgba(122,107,171,0.45)]',
              'motion-reduce:transition-none motion-reduce:group-hover:h-[var(--logo-rest)] motion-reduce:group-hover:w-[var(--logo-rest)]'
            )}
            style={
              {
                '--logo-rest': logoRest,
                '--logo-hover': logoHoverMax,
              } as CSSProperties
            }
          >
            <AtlasLogo variant="header" />
          </span>
          <span className="min-w-0 pt-0.5">
            <span className="block font-display text-xl font-black uppercase tracking-widest text-atlas-white">
              ATLAS
            </span>
            <span className="mt-0.5 hidden text-xs leading-snug text-atlas-muted transition-colors group-hover:text-atlas-label sm:block">
              Assessing Theoretical Legitimacy Across Scales
            </span>
          </span>
        </Link>

        <div className="flex w-full min-w-0 flex-1 flex-wrap items-end justify-end gap-3 sm:w-auto">
          <div className="w-full max-w-[520px] sm:w-auto sm:min-w-[320px]">
            <FuzzySearchBox
              evaluations={data.examples}
              placeholder="Search ATLAS (try “cos”, “intellligent”)…"
              onPick={(ev) => navigate(`/${ev.id}`)}
            />
          </div>

          <nav
            className="flex gap-0 rounded-t-atlas-card bg-atlas-deep/40 p-1 pb-0 ring-1 ring-atlas-border/50 sm:gap-1"
            aria-label="Primary"
          >
            <NavLink to="/" end className={tabClass}>
              Explorer
            </NavLink>
            <NavLink to="/about" className={tabClass}>
              About
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

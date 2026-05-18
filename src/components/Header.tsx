import type { CSSProperties } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';
import { evaluations } from '../data/evaluations';
import { useCurrentEvaluation } from '../hooks/useCurrentEvaluation';
import { useScoreLayout } from '../context/ScoreLayoutContext';
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

const logoRest = `${HEADER_LOGO_SIZE_REM}rem`;
const logoHoverMax = `min(${HEADER_LOGO_SIZE_REM * 2}rem, calc(100dvh - 6rem), calc(100vw - 2rem))`;

export function Header() {
  const navigate = useNavigate();
  const evaluation = useCurrentEvaluation();
  const { layout } = useScoreLayout();
  const theoryTitleInPage = layout === 'compact' && evaluation;

  return (
    <header className="sticky top-0 z-50 border-b border-atlas-border bg-atlas-void/90 backdrop-blur-md">
      <div
        className={cn(
          'mx-auto grid max-w-7xl grid-cols-1 items-center gap-x-4 gap-y-3 px-4 pb-3 pt-4 sm:px-6',
          evaluation
            ? 'lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)]'
            : 'lg:grid-cols-[minmax(0,1fr)_auto]'
        )}
      >
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

        {evaluation ? (
          <div className="min-w-0 px-1 text-center lg:col-start-2 lg:px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-atlas-label lg:sr-only">
              Current theory
            </p>
            {theoryTitleInPage ? (
              <p
                className="truncate font-display text-base font-black leading-snug text-atlas-white sm:text-lg lg:text-xl"
                title={evaluation.framework_name}
              >
                {evaluation.framework_name}
              </p>
            ) : (
              <h1
                className="truncate font-display text-base font-black leading-snug text-atlas-white sm:text-lg lg:text-xl"
                title={evaluation.framework_name}
              >
                {evaluation.framework_name}
              </h1>
            )}
          </div>
        ) : null}

        <div
          className={cn(
            'flex w-full min-w-0 flex-wrap items-end justify-end gap-3',
            evaluation ? 'lg:col-start-3' : 'lg:col-start-2'
          )}
        >
          <div className="w-full max-w-[520px] sm:w-auto sm:min-w-[320px]">
            <FuzzySearchBox
              evaluations={evaluations}
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

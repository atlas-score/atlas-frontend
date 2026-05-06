import { Link, NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-[2.5rem] items-center rounded-t-atlas-card border border-b-0 px-4 py-2 text-sm font-bold tracking-wide transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void',
    isActive
      ? 'border-atlas-bloom bg-atlas-mid text-atlas-white shadow-atlas-glow-sm'
      : 'border-atlas-border/60 border-b-atlas-void bg-atlas-void/80 text-atlas-label hover:border-atlas-border hover:bg-atlas-deep/80 hover:text-atlas-white'
  );

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-atlas-border bg-atlas-void/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 pb-0 pt-4 sm:px-6">
        <Link
          to="/"
          className="group mb-3 flex items-center gap-3 rounded-atlas-card px-1 py-1 transition-colors hover:bg-atlas-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
        >
          <img
            src={`${import.meta.env.BASE_URL}atlas-logo.svg`}
            alt="ATLAS"
            className="h-8 w-8"
          />
          <span className="font-display text-xl font-black uppercase tracking-widest text-atlas-white">
            ATLAS
          </span>
          <span className="hidden text-xs text-atlas-muted group-hover:text-atlas-label sm:inline">
            Assessing Theoretical Legitimacy Across Scales
          </span>
        </Link>

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
    </header>
  );
}

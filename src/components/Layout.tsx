import { Outlet } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Header } from './Header';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="min-h-screen bg-atlas-void bg-atlas-space font-body text-atlas-white">
        <Header />
        <Outlet />
        <footer className="border-t border-atlas-border px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-7xl justify-center">
            <ThemeToggle />
          </div>
        </footer>
      </div>
    </Tooltip.Provider>
  );
}

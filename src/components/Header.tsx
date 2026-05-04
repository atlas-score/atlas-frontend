import * as Dialog from '@radix-ui/react-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-atlas-border bg-atlas-void/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}atlas-logo.svg`}
            alt="ATLAS"
            className="h-8 w-8"
          />
          <span className="font-display text-xl font-black uppercase tracking-widest text-atlas-white">
            ATLAS
          </span>
          <span className="hidden text-xs text-atlas-muted sm:inline">
            Assessing Theoretical Legitimacy Across Scales
          </span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6" aria-label="Primary">
          <a
            href="#explorer"
            className="text-sm text-atlas-label transition-colors hover:text-atlas-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
          >
            Explorer
          </a>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="text-sm text-atlas-label transition-colors hover:text-atlas-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
              >
                About
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/70" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] max-h-[85vh] w-[min(100%,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-atlas-card border border-atlas-border-glow bg-atlas-deep p-6 shadow-atlas-bloom">
                <Dialog.Title className="font-display text-xl font-black uppercase tracking-wide text-atlas-white">
                  About this site
                </Dialog.Title>
                <Dialog.Description asChild>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-atlas-muted">
                    <p>
                      This is a read-only <strong className="text-atlas-bright-text">static</strong>{' '}
                      explorer: React reads evaluation objects bundled from{' '}
                      <code className="rounded bg-atlas-mid px-1 font-mono text-xs text-atlas-label">
                        atlas-score-examples.json
                      </code>
                      . There is no write API and no server requirement beyond
                      serving HTML/JS/CSS.
                    </p>
                    <p>
                      Each record shows three sub-scales—{' '}
                      <strong className="text-atlas-bright-text">ETS</strong>{' '}
                      (truth relative to evidence),{' '}
                      <strong className="text-atlas-bright-text">SES</strong>{' '}
                      (scientific engagement), and{' '}
                      <strong className="text-atlas-bright-text">EIS</strong>{' '}
                      (integration with established knowledge)—plus a composite,
                      ontological scale tags, and long-form interpretation.
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-atlas-muted">
                      <li>
                        <strong className="text-atlas-bright-text">Select</strong>{' '}
                        jumps to any framework; the card list can be narrowed by
                        filters without losing that global jump.
                      </li>
                      <li>
                        <strong className="text-atlas-bright-text">Slider</strong>{' '}
                        filters by composite band;{' '}
                        <strong className="text-atlas-bright-text">scale tabs</strong>{' '}
                        filter by ontological level.
                      </li>
                      <li>
                        <strong className="text-atlas-bright-text">Hover / focus</strong>{' '}
                        triptych panels for full justifications;{' '}
                        <strong className="text-atlas-bright-text">badges</strong>{' '}
                        open popovers with short scale definitions.
                      </li>
                    </ul>
                    <p className="text-xs text-atlas-dim">
                      For install instructions and a maintainer build narrative,
                      open <code className="font-mono">README.md</code> and{' '}
                      <code className="font-mono">generalInfo.md</code> in the
                      repository root.
                    </p>
                  </div>
                </Dialog.Description>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <Dialog.Close asChild>
                    <a
                      href="#about"
                      className="rounded-atlas-pill border border-atlas-border px-4 py-2 text-sm text-atlas-label transition-colors hover:border-atlas-border-glow hover:text-atlas-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-deep"
                    >
                      Footer details
                    </a>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-atlas-pill border border-atlas-vivid bg-atlas-bright px-4 py-2 text-sm font-semibold text-white shadow-atlas-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-deep"
                    >
                      Close
                    </button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </nav>
      </div>
    </header>
  );
}

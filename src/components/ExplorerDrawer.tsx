import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export function ExplorerDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-[130] max-h-[92vh] overflow-y-auto rounded-t-atlas-card border border-atlas-border bg-atlas-void p-4 shadow-atlas-glow-lg',
            'focus-visible:outline-none'
          )}
        >
          <div className="mx-auto flex max-w-2xl items-start justify-between gap-4 pb-3">
            <div>
              <Dialog.Title className="text-sm font-black uppercase tracking-widest text-atlas-white">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-atlas-muted">
                Search, filter, then open a theory page.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-3 py-2 text-xs font-bold text-atlas-white transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
              >
                Close
              </button>
            </Dialog.Close>
          </div>
          <div className="mx-auto max-w-2xl pb-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


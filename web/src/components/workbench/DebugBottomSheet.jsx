import { useState } from 'react';
import { Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';

export default function DebugBottomSheet({ scope = {}, session = {} }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs shadow-lg backdrop-blur"
        aria-label="Open debug panel"
      >
        ⚙ Debug
      </button>
      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4">
          <Surface className="mx-auto max-w-3xl rounded-t-3xl border border-border/60 bg-background/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Debug</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Scope
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>Decision: {scope.decision || 'n/a'}</li>
                  <li>Files: {scope.metrics?.predictedFileCount ?? 'n/a'}</li>
                  <li>LoC: {scope.metrics?.predictedLoC ?? 'n/a'}</li>
                  <li>Bundle bytes: {scope.metrics?.bundleBytes ?? 'n/a'}</li>
                  {Array.isArray(scope.reasons) && scope.reasons.length ? (
                    <li>Reasons: {scope.reasons.join(', ')}</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Session
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>Status: {session.state || 'idle'}</li>
                  <li>Steps: {session.steps ?? 0}</li>
                  <li>User: {session.user || 'guest'}</li>
                </ul>
              </div>
            </div>
          </Surface>
        </div>
      ) : null}
    </>
  );
}



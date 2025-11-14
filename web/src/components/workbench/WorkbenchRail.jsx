import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button';
import { History, LayoutGrid, User as UserIcon } from 'lucide-react';
import { Surface } from '@/components/layout';

export default function WorkbenchRail({
  activeView,
  onSelectView,
  sessionEntries = [],
  className = ''
}) {
  return (
    <div className={cn('hidden lg:flex lg:flex-col lg:gap-4', className)}>
      <Surface muted className="flex flex-col gap-3 rounded-2xl p-4">
        <nav className="grid gap-2">
          <Button
            variant={activeView === 'workbench' ? 'default' : 'ghost'}
            size="sm"
            shape="pill"
            className="justify-start gap-2"
            onClick={() => onSelectView?.('workbench')}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Workbench
          </Button>
          <Button
            variant={activeView === 'templates' ? 'default' : 'ghost'}
            size="sm"
            shape="pill"
            className="justify-start gap-2"
            onClick={() => onSelectView?.('templates')}
          >
            <History className="h-4 w-4" aria-hidden />
            Templates
          </Button>
          <Button
            variant={activeView === 'creator-portal' ? 'default' : 'ghost'}
            size="sm"
            shape="pill"
            className="justify-start gap-2"
            onClick={() => onSelectView?.('creator-portal')}
          >
            <UserIcon className="h-4 w-4" aria-hidden />
            My Account
          </Button>
        </nav>
      </Surface>

      <Surface className="flex flex-col gap-3 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            History
          </h3>
          <span className="text-xs text-muted-foreground">
            {sessionEntries.length || 0}
          </span>
        </div>
        <ol className="space-y-2">
          {sessionEntries.slice(-5).map((entry) => (
            <li
              key={entry.id}
              className="truncate rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground"
              title={entry.prompt}
            >
              {entry.prompt}
            </li>
          ))}
          {!sessionEntries.length ? (
            <li className="text-xs text-muted-foreground">No entries yet.</li>
          ) : null}
        </ol>
      </Surface>
    </div>
  );
}



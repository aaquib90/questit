import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/layout';
import { cn } from '@/lib/utils.js';

const VIEW_TABS = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'my-tools', label: 'My Tools' },
  { id: 'creator-portal', label: 'Creator Portal' }
];

export function WorkbenchHeader({
  activeView,
  onSelectView,
  user,
  userLabel,
  onLogin,
  onSignOut,
  onNavigateHome
}) {
  return (
    <Surface as="header" className="flex flex-row items-center justify-between rounded-3xl border border-border/60 px-4 py-3 shadow-md sm:px-5 sm:py-3.5">
      <button
        type="button"
        onClick={() => onNavigateHome?.()}
        className="questit-logo relative -ml-1 cursor-pointer border-none bg-transparent p-0 text-left outline-none transition hover:opacity-90"
      >
        Questit
      </button>
      <nav
        aria-label="Workbench sections"
        className="flex flex-1 items-center justify-center gap-2 pl-4 pr-4 md:justify-center"
      >
        {VIEW_TABS.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <Button
              key={tab.id}
              size="sm"
              variant="ghost"
              onClick={() => onSelectView(tab.id)}
              aria-pressed={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </Button>
          );
        })}
      </nav>
      <div className="flex items-center justify-end gap-2">
        {user ? (
          <>
            <Badge variant="secondary" className="hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex">
              {userLabel}
            </Badge>
            <Button variant="ghost" size="sm" className="text-sm" onClick={onSignOut}>
              Sign out
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" className="rounded-full px-4 text-sm" onClick={onLogin}>
            Log in
          </Button>
        )}
      </div>
    </Surface>
  );
}

export default WorkbenchHeader;

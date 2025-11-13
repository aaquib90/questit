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
    <Surface as="header" className="flex flex-col gap-4 rounded-3xl border border-border/60 p-5 shadow-md sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => onNavigateHome?.()}
            className="questit-logo relative -ml-1 cursor-pointer border-none bg-transparent p-0 text-left outline-none transition hover:opacity-90"
          >
            Questit
          </button>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
          <nav
            aria-label="Workbench sections"
            className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end"
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
                    'rounded-full px-4 text-sm font-medium transition-colors md:px-5',
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
          <div className="flex w-full items-center justify-start gap-2 md:w-auto md:justify-end">
            {user ? (
              <>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {userLabel}
                </Badge>
                <Button variant="ghost" size="sm" className="text-sm" onClick={onSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full px-5 text-sm" onClick={onLogin}>
                Log in
              </Button>
            )}
          </div>
        </div>
      </div>
    </Surface>
  );
}

export default WorkbenchHeader;

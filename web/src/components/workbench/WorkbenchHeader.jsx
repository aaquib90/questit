import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const VIEW_TABS = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'my-tools', label: 'My Tools' }
];

export function WorkbenchHeader({
  activeView,
  onSelectView,
  user,
  userLabel,
  onLogin,
  onSignOut
}) {
  return (
    <header className="questit-glass flex flex-col gap-4 rounded-3xl border border-border/60 p-4 shadow-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <span className="questit-logo text-3xl text-primary">Questit</span>
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Workspace
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <div className="flex w-full rounded-full border border-primary/20 bg-primary/10 p-1 shadow-sm md:w-auto">
            {VIEW_TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeView === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSelectView(tab.id)}
                aria-pressed={activeView === tab.id}
                className="flex-1 rounded-full px-4 text-sm transition-[box-shadow,transform] md:flex-initial md:px-5"
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:flex-row md:items-center md:justify-center md:gap-3">
            {user ? (
              <>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium md:w-auto">
                  {userLabel}
                </Badge>
                <Button variant="ghost" className="w-full text-sm md:w-auto" onClick={onSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 rounded-full px-5 text-sm md:w-auto"
                onClick={onLogin}
              >
                Log in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default WorkbenchHeader;

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const VIEW_TABS = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'history', label: 'History' },
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
    <header className="questit-glass flex flex-col gap-4 rounded-3xl border border-border/60 p-6 shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <span className="questit-logo text-3xl text-primary">Questit</span>
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Workspace
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex rounded-full border border-primary/20 bg-primary/10 p-1 shadow-sm">
            {VIEW_TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeView === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSelectView(tab.id)}
                aria-pressed={activeView === tab.id}
                className="rounded-full px-5 text-sm transition-[box-shadow,transform]"
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            {user ? (
              <>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                  {userLabel}
                </Badge>
                <Button variant="ghost" className="text-sm" onClick={onSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="gap-2 rounded-full px-5 text-sm"
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

import BrandLogo from '@/components/layout/BrandLogo.jsx';
import { Surface } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils.js';

const VIEW_TABS = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'templates', label: 'Templates' },
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
  onNavigateHome,
  selectedTheme,
  onThemeChange,
  themeOptions,
  colorMode,
    onColorModeChange,
    colorModeOptions
  }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/78 via-white/58 to-white/32 shadow-[0_42px_110px_-48px_rgba(15,23,42,0.45)] blur-sm dark:from-slate-800/70 dark:via-slate-900/58 dark:to-slate-950/38 dark:shadow-[0_42px_110px_-48px_rgba(8,47,73,0.6)]" />
      <Surface
        as="header"
        muted
        className="relative flex flex-col gap-3 rounded-[28px] bg-white/92 px-4 py-4 backdrop-blur-lg shadow-[0_28px_80px_-36px_rgba(15,23,42,0.38)] dark:bg-slate-900/84 dark:shadow-[0_28px_80px_-34px_rgba(8,47,73,0.62)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
      >
      <button
        type="button"
        onClick={() => onNavigateHome?.()}
        className="relative -ml-1 inline-flex items-center border-none bg-transparent p-0 text-left outline-none transition hover:opacity-90"
        aria-label="Questit home"
      >
        <BrandLogo className="h-9 w-auto" aria-hidden />
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
              shape="pill"
              variant="ghost"
              onClick={() => onSelectView(tab.id)}
              aria-pressed={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'px-4 text-sm font-medium transition-colors',
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
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <Select value={colorMode} onValueChange={onColorModeChange}>
            <SelectTrigger className="w-[110px] rounded-full border-border/40 bg-background/60 text-xs font-medium uppercase tracking-wide">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent align="end">
              {colorModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTheme} onValueChange={onThemeChange}>
            <SelectTrigger className="w-[130px] rounded-full border-border/40 bg-background/60 text-xs font-medium uppercase tracking-wide">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent align="end">
              {themeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Button variant="outline" size="sm" shape="pill" className="px-4 text-sm" onClick={onLogin}>
            Log in
          </Button>
        )}
      </div>
      </Surface>
    </div>
  );
}

export default WorkbenchHeader;

import { useState } from 'react';
import { Menu as MenuIcon } from 'lucide-react';

import BrandLogo from '@/components/layout/BrandLogo.jsx';
import { Surface } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils.js';

const VIEW_TABS = [
  { id: 'workbench', label: 'Workbench', description: 'Compose, iterate, and run Questit tools.' },
  { id: 'templates', label: 'Templates', description: 'Start from pre-built automation templates.' },
  { id: 'my-tools', label: 'My Tools', description: 'Manage and refine the tools you have saved.' },
  { id: 'creator-portal', label: 'Creator Portal', description: 'Publish bundles, track usage, and billing.' }
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
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);

  const handleNavigate = (tabId) => {
    onSelectView(tabId);
    setMegaMenuOpen(false);
  };

  const handleSignOut = () => {
    onSignOut?.();
    setMegaMenuOpen(false);
  };

  const handleLogin = () => {
    onLogin?.();
    setMegaMenuOpen(false);
  };
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/78 via-white/58 to-white/32 shadow-[0_42px_110px_-48px_rgba(15,23,42,0.45)] blur-sm dark:from-slate-800/70 dark:via-slate-900/58 dark:to-slate-950/38 dark:shadow-[0_42px_110px_-48px_rgba(8,47,73,0.6)]" />
      <Surface
        as="header"
        muted
        className="relative flex flex-col gap-4 rounded-[28px] bg-white/92 px-4 py-4 backdrop-blur-lg shadow-[0_28px_80px_-36px_rgba(15,23,42,0.38)] dark:bg-slate-900/84 dark:shadow-[0_28px_80px_-34px_rgba(8,47,73,0.62)] sm:px-6 sm:py-5"
      >
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[auto,1fr,auto] lg:items-center lg:gap-6">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => onNavigateHome?.()}
              className="relative -ml-1 inline-flex items-center border-none bg-transparent p-0 text-left outline-none transition hover:opacity-90"
              aria-label="Questit home"
            >
              <BrandLogo className="h-9 w-auto" aria-hidden />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2 rounded-full border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-foreground"
                onClick={() => setMegaMenuOpen(true)}
                aria-expanded={isMegaMenuOpen}
                aria-controls="questit-mega-menu"
              >
                <MenuIcon className="h-4 w-4" />
                Menu
              </Button>
              {user ? (
                <Button variant="ghost" size="sm" className="text-sm" onClick={onSignOut}>
                  Sign out
                </Button>
              ) : (
                <Button variant="outline" size="sm" shape="pill" className="px-4 text-sm" onClick={onLogin}>
                  Log in
                </Button>
              )}
            </div>
          </div>
          <nav
            aria-label="Workbench sections"
            className="hidden flex-wrap items-center justify-center gap-2 px-1 sm:px-4 lg:flex"
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
                    'flex-shrink-0 px-4 text-sm font-medium transition-colors',
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
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 lg:justify-end">
            <div className="hidden items-center gap-2 lg:flex">
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
            <div className="hidden items-center gap-2 lg:flex">
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
          </div>
        </div>
      </Surface>
      <Dialog open={isMegaMenuOpen} onOpenChange={setMegaMenuOpen}>
        <DialogContent
          id="questit-mega-menu"
          aria-label="Questit navigation and personalization"
          className="max-w-2xl rounded-[32px] border-border/40 bg-background/95 p-0 text-left text-foreground backdrop-blur"
        >
          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Navigate</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {VIEW_TABS.map((tab) => {
                  const isActive = activeView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleNavigate(tab.id)}
                      className={cn(
                        'flex w-full flex-col gap-1 rounded-2xl border border-border/60 bg-background/80 p-4 text-left transition hover:border-primary/60 hover:bg-background',
                        isActive && 'border-primary bg-primary/10 shadow-sm'
                      )}
                    >
                      <span className="text-base font-semibold">{tab.label}</span>
                      {tab.description ? (
                        <span className="text-sm text-muted-foreground">{tab.description}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-[24px] border border-border/60 bg-muted/40 p-4 dark:bg-slate-900/40">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Personalize</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select value={colorMode} onValueChange={onColorModeChange}>
                  <SelectTrigger className="w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-5 text-left text-base font-semibold">
                    <SelectValue placeholder="Color mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorModeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTheme} onValueChange={onThemeChange}>
                  <SelectTrigger className="w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-5 text-left text-base font-semibold">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Account</p>
              {user ? (
                <>
                  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signed in as</p>
                    <p className="text-lg font-semibold">{userLabel}</p>
                  </div>
                  <Button variant="ghost" size="lg" className="justify-center text-base" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button variant="default" size="lg" className="justify-center text-base" onClick={handleLogin}>
                  Log in
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkbenchHeader;

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/layout/BrandLogo.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Moon, Sun, Menu, LogIn, LogOut, UserRound } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/build', label: 'Build' },
  { to: '/templates', label: 'Templates' },
  { to: '/tools', label: 'Tools' },
  { to: '/my-tools', label: 'My Tools' },
  { to: '/profile', label: 'Profile' }
];

function navLinkClass({ isActive }) {
  return [
    'text-sm font-medium transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  ].join(' ');
}

export default function SiteHeader({
  ctaLabel = 'Start Building',
  ctaHref = '/build',
  colorMode,
  onToggleColorMode,
  user,
  onLogin,
  onLogout
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showColorToggle = typeof colorMode === 'string' && typeof onToggleColorMode === 'function';
  const ModeIcon = colorMode === 'dark' ? Sun : Moon;
  const showLogin = typeof onLogin === 'function';
  const showLogout = Boolean(user) && typeof onLogout === 'function';

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold">
            <BrandLogo className="h-8 w-auto" aria-hidden />
            <span className="sr-only">Questit</span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
          {showColorToggle ? (
            <button
              type="button"
              onClick={onToggleColorMode}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground"
              aria-label={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <ModeIcon className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
          {showLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground md:inline-flex"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          ) : showLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground md:inline-flex"
              aria-label="Sign in"
            >
              <LogIn className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
          <Button asChild className="hidden md:inline-flex">
            <Link to={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="gap-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Navigate</DialogTitle>
          </DialogHeader>
          <nav className="grid gap-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-border/40 bg-background/80 px-4 py-3 text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            {showColorToggle ? (
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  onToggleColorMode();
                  setMenuOpen(false);
                }}
              >
                <ModeIcon className="h-4 w-4" aria-hidden />
                {colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </Button>
            ) : null}
            {showLogout ? (
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </Button>
            ) : showLogin ? (
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  onLogin();
                  setMenuOpen(false);
                }}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Sign in
              </Button>
            ) : null}
            {user ? (
              <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground">
                  <UserRound className="h-4 w-4" aria-hidden />
                </span>
                <span>{user.email || user.user_metadata?.full_name || 'Signed in'}</span>
              </div>
            ) : null}
          </div>
          <Button asChild className="md:hidden">
            <Link to={ctaHref} onClick={() => setMenuOpen(false)}>
              {ctaLabel}
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </header>
  );
}

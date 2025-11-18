import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/layout/BrandLogo.jsx';

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

export default function SiteHeader({ ctaLabel = 'Start Building', ctaHref = '/build' }) {
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
          <nav className="flex items-center gap-4 md:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className="text-sm text-muted-foreground">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Button asChild className="hidden md:inline-flex">
            <Link to={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

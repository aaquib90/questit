import { useEffect, useRef } from 'react';

/**
 * Lightweight React wrapper for the shared <questit-header> web component.
 * This lets the SPA opt-in to the same header markup/styles as the share shell.
 */
export default function HeaderElement({
  active = 'workbench',
  mode = 'LIGHT',
  theme = 'EMERALD',
  user = '',
  loginHref = 'https://questit.cc/?login=1',
  workspaceHref = 'https://questit.cc',
  remixHref = 'https://questit.cc',
  className = ''
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('active', active);
    el.setAttribute('mode', String(mode || '').toUpperCase());
    el.setAttribute('theme', String(theme || '').toUpperCase());
    if (user) el.setAttribute('user', user);
    else el.removeAttribute('user');
    el.setAttribute('login-href', loginHref);
    el.setAttribute('workspace-href', workspaceHref);
    el.setAttribute('remix-href', remixHref);
  }, [active, mode, theme, user, loginHref, workspaceHref, remixHref]);

  useEffect(() => {
    // Ensure the header microbundle is loaded (safe to call repeatedly)
    const base = window.location.origin.replace(/\/$/, '');
    const cssHref = `${base}/header/v1/header.css`;
    const jsHref = `${base}/header/v1/header.js`;
    if (!document.querySelector('link[data-questit-header]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = cssHref;
      l.setAttribute('data-questit-header', 'true');
      document.head.append(l);
    }
    if (!document.querySelector('script[data-questit-header]')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = jsHref;
      s.setAttribute('data-questit-header', 'true');
      document.head.append(s);
    }
  }, []);

  return <questit-header ref={ref} className={className} />;
}



import { useEffect, useMemo } from 'react';

const DEFAULT_ORIGIN = 'https://questit.cc';

const DEFAULT_META = {
  title: 'Questit · Build AI micro-tools instantly',
  description:
    'Questit turns natural language prompts into production-ready micro-tools with shareable viewers, durable memory, and analytics.',
  keywords: 'Questit, AI coding, AI apps, micro-tools, automation, no-code, tool builder, shareable tools',
  url: `${DEFAULT_ORIGIN}/`,
  canonical: `${DEFAULT_ORIGIN}/`,
  image: `${DEFAULT_ORIGIN}/og-default.svg`,
  type: 'website',
  robots: 'index,follow',
  siteName: 'Questit',
  icon: '/favicon.svg',
  appleIcon: '/favicon.svg',
  maskIconColor: '#38bdf8',
  themeColor: '#0f172a',
  twitterCard: 'summary_large_image',
  twitterHandle: null,
  structuredData: null
};

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

function getOrigin() {
  if (isBrowser) {
    try {
      return window.location.origin;
    } catch (error) {
      console.warn('Unable to resolve window.origin for SEO utilities', error);
    }
  }
  return DEFAULT_ORIGIN;
}

function resolveUrl(value) {
  if (!value) return value;
  if (/^https?:/i.test(value) || value.startsWith('data:')) {
    return value;
  }
  try {
    return new URL(value, getOrigin()).toString();
  } catch {
    return value;
  }
}

function upsertMetaTag(attribute, key, content) {
  if (!isBrowser) return;
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.head.querySelector(selector);

  if (!content && tag) {
    tag.parentNode.removeChild(tag);
    return;
  }

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  if (content) {
    tag.setAttribute('content', content);
  }
}

function upsertLinkTag(rel, href, extra = {}) {
  if (!isBrowser) return;
  const selector = `link[rel="${rel}"]`;
  let tag = document.head.querySelector(selector);

  if (!href && tag) {
    tag.parentNode.removeChild(tag);
    return;
  }

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }

  if (href) {
    tag.setAttribute('href', href);
  }

  Object.entries(extra).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      tag.removeAttribute(key);
    } else {
      tag.setAttribute(key, value);
    }
  });
}

function upsertJsonLd(structuredData) {
  if (!isBrowser) return;
  const id = 'questit-structured-data';
  let script = document.head.querySelector(`script#${id}`);

  if (!structuredData) {
    if (script) {
      script.parentNode.removeChild(script);
    }
    return;
  }

  const payload = typeof structuredData === 'string' ? structuredData : JSON.stringify(structuredData, null, 2);

  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = payload;
}

export function applySeoMetadata(meta = {}) {
  if (!isBrowser) return;
  const resolved = {
    ...DEFAULT_META,
    ...meta
  };

  const absoluteUrl = resolveUrl(resolved.url || resolved.canonical);
  const canonicalUrl = resolveUrl(resolved.canonical || resolved.url);
  const imageUrl = resolveUrl(resolved.image);
  const iconUrl = resolveUrl(resolved.icon);
  const appleIconUrl = resolveUrl(resolved.appleIcon || resolved.icon);

  if (resolved.title) {
    document.title = resolved.title;
  }

  upsertMetaTag('name', 'description', resolved.description);
  upsertMetaTag('name', 'keywords', resolved.keywords);
  upsertMetaTag('name', 'robots', resolved.robots);
  upsertMetaTag('name', 'theme-color', resolved.themeColor);

  upsertMetaTag('property', 'og:site_name', resolved.siteName);
  upsertMetaTag('property', 'og:type', resolved.type);
  upsertMetaTag('property', 'og:title', resolved.title);
  upsertMetaTag('property', 'og:description', resolved.description);
  upsertMetaTag('property', 'og:url', absoluteUrl || canonicalUrl);
  upsertMetaTag('property', 'og:image', imageUrl);

  upsertMetaTag('name', 'twitter:card', resolved.twitterCard);
  upsertMetaTag('name', 'twitter:title', resolved.title);
  upsertMetaTag('name', 'twitter:description', resolved.description);
  upsertMetaTag('name', 'twitter:image', imageUrl);
  if (resolved.twitterHandle) {
    upsertMetaTag('name', 'twitter:creator', resolved.twitterHandle);
  }

  upsertLinkTag('canonical', canonicalUrl);
  upsertLinkTag('icon', iconUrl, { type: iconUrl?.endsWith('.svg') ? 'image/svg+xml' : null });
  upsertLinkTag('apple-touch-icon', appleIconUrl);
  upsertLinkTag('mask-icon', iconUrl, { color: resolved.maskIconColor });

  upsertJsonLd(resolved.structuredData);
}

export function useSeoMetadata(meta) {
  const deps = useMemo(() => {
    const payload = meta || {};
    return [
      payload.title,
      payload.description,
      payload.keywords,
      payload.url,
      payload.canonical,
      payload.image,
      payload.type,
      payload.robots,
      payload.icon,
      payload.appleIcon,
      payload.themeColor,
      payload.twitterCard,
      payload.twitterHandle,
      payload.siteName,
      payload.maskIconColor,
      payload.structuredData ? JSON.stringify(payload.structuredData) : null
    ];
  }, [meta]);

  useEffect(() => {
    if (!isBrowser) return;
    applySeoMetadata(meta);
  }, deps);
}

export { DEFAULT_META as DEFAULT_SEO };

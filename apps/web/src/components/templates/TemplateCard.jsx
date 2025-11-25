import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/layout';
import { Link } from 'react-router-dom';
import { buildVariantTitle, resolveTemplateDescriptor } from '@/lib/templateUtils.js';

const TONES = {
  emerald: {
    border: 'hover:border-emerald-300',
    shadow: 'hover:shadow-emerald-200/60',
    chip: 'group-hover:bg-emerald-50 group-hover:text-emerald-700',
    button: 'group-hover:border-emerald-300 group-hover:text-emerald-700',
    iconGradient:
      'bg-gradient-to-br from-emerald-100 via-emerald-50 to-white dark:from-emerald-900/40 dark:to-emerald-700/20 text-emerald-900',
    iconRing: 'ring-1 ring-emerald-200/60 group-hover:ring-2 group-hover:ring-emerald-300/60',
    iconShadow: 'shadow-[0_8px_20px_-6px_rgba(16,185,129,0.35)]'
  },
  sky: {
    border: 'hover:border-sky-300',
    shadow: 'hover:shadow-sky-200/60',
    chip: 'group-hover:bg-sky-50 group-hover:text-sky-700',
    button: 'group-hover:border-sky-300 group-hover:text-sky-700',
    iconGradient:
      'bg-gradient-to-br from-sky-100 via-sky-50 to-white dark:from-sky-900/40 dark:to-sky-700/20 text-sky-900',
    iconRing: 'ring-1 ring-sky-200/60 group-hover:ring-2 group-hover:ring-sky-300/60',
    iconShadow: 'shadow-[0_8px_20px_-6px_rgba(56,189,248,0.35)]'
  },
  violet: {
    border: 'hover:border-violet-300',
    shadow: 'hover:shadow-violet-200/60',
    chip: 'group-hover:bg-violet-50 group-hover:text-violet-700',
    button: 'group-hover:border-violet-300 group-hover:text-violet-700',
    iconGradient:
      'bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-violet-900/40 dark:to-violet-700/20 text-violet-900',
    iconRing: 'ring-1 ring-violet-200/60 group-hover:ring-2 group-hover:ring-violet-300/60',
    iconShadow: 'shadow-[0_8px_20px_-6px_rgba(139,92,246,0.35)]'
  },
  amber: {
    border: 'hover:border-amber-300',
    shadow: 'hover:shadow-amber-200/60',
    chip: 'group-hover:bg-amber-50 group-hover:text-amber-700',
    button: 'group-hover:border-amber-300 group-hover:text-amber-700',
    iconGradient:
      'bg-gradient-to-br from-amber-100 via-amber-50 to-white dark:from-amber-900/30 dark:to-amber-700/20 text-amber-900',
    iconRing: 'ring-1 ring-amber-200/60 group-hover:ring-2 group-hover:ring-amber-300/60',
    iconShadow: 'shadow-[0_8px_20px_-6px_rgba(245,158,11,0.35)]'
  },
  rose: {
    border: 'hover:border-rose-300',
    shadow: 'hover:shadow-rose-200/60',
    chip: 'group-hover:bg-rose-50 group-hover:text-rose-700',
    button: 'group-hover:border-rose-300 group-hover:text-rose-700',
    iconGradient:
      'bg-gradient-to-br from-rose-100 via-rose-50 to-white dark:from-rose-900/40 dark:to-rose-700/20 text-rose-900',
    iconRing: 'ring-1 ring-rose-200/60 group-hover:ring-2 group-hover:ring-rose-300/60',
    iconShadow: 'shadow-[0_8px_20px_-6px_rgba(244,63,94,0.35)]'
  },
  indigo: {
    border: 'hover:border-indigo-300',
    shadow: 'hover:shadow-indigo-200/60',
    chip: 'group-hover:bg-indigo-50 group-hover:text-indigo-700',
    button: 'group-hover:border-indigo-300 group-hover:text-indigo-700',
    iconGradient:
      'bg-gradient-to-br from-indigo-100 via-indigo-50 to-white dark:from-indigo-900/40 dark:to-indigo-700/20 text-indigo-900',
    iconRing: 'ring-1 ring-indigo-200/60 group-hover:ring-2 group-hover:ring-indigo-300/60',
    iconShadow: 'shadow-[0_8px_20px_-6px_rgba(99,102,241,0.35)]'
  }
};

function pickToneFromId(id = '') {
  const keys = Object.keys(TONES);
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return keys[sum % keys.length];
}

function buildGlyph(template) {
  if (template?.emoji) return template.emoji;
  if (template?.heroImage) return template.heroImage;
  if (Array.isArray(template?.tags) && template.tags.length) {
    return template.tags[0].slice(0, 2).toUpperCase();
  }
  const fallback = template?.title || template?.name || 'T';
  return fallback.charAt(0).toUpperCase();
}

export default function TemplateCard({ template, onPreview, onUse, highlightBadge }) {
  const {
    summary,
    audience = [],
    tags = [],
    popularity,
    collectionTitle
  } = template;

  const variantTitle = buildVariantTitle(template);
  const descriptor = resolveTemplateDescriptor(template);

  const toneKey = pickToneFromId(template?.id || template?.title || 't');
  const tone = TONES[toneKey];
  const glyph = buildGlyph(template);
  const badgeStack = [
    highlightBadge,
    popularity > 1000 ? 'Popular' : popularity > 800 ? 'Trending' : null
  ].filter(Boolean);

  return (
    <Surface
      muted
    className={[
      'group flex h-full flex-col justify-between gap-3 rounded-3xl p-4 transition-all',
      'hover:-translate-y-0.5 hover:bg-background/90',
      'border border-border/50 shadow-sm focus-within:ring-2 focus-within:ring-primary/40',
      'items-start text-left',
      tone.border,
      tone.shadow
    ].join(' ')}
    >
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex flex-col items-start gap-2">
            <div
              className={[
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-semibold',
                'transition-transform duration-200 group-hover:-translate-y-0.5',
                'ring-offset-2 ring-offset-background',
                'shadow-sm',
                tone.iconGradient,
                tone.iconRing,
                tone.iconShadow
              ].join(' ')}
            >
              {glyph}
            </div>
            <Link
              to={`/templates/${encodeURIComponent(template.id)}`}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {variantTitle}
            </Link>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between pb-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              <span>{collectionTitle || 'Questit Template'}</span>
              <div className="flex flex-wrap gap-1">
                {badgeStack.map((badge) => (
                  <Badge key={badge} variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-left text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {summary}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {audience.slice(0, 2).map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                tone.chip
              ].join(' ')}
            >
              {label}
            </Badge>
          ))}
          {/* Tags intentionally hidden for a cleaner card layout */}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            shape="pill"
            className="w-full px-5 sm:w-auto"
            onClick={() => onUse?.(template)}
          >
            Try This Idea
          </Button>
          <Button
            variant="outline"
            shape="pill"
            className={['w-full px-5 sm:w-auto transition-colors', tone.button].join(' ')}
            onClick={() => onPreview?.(template)}
          >
            See how it looks
          </Button>
          <Button asChild variant="ghost" shape="pill" className="w-full px-5 sm:w-auto">
            <Link to={`/templates/${encodeURIComponent(template.id)}`}>Take it for a spin</Link>
          </Button>
        </div>
      </div>
    </Surface>
  );
}

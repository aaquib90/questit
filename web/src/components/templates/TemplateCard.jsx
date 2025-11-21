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
		button: 'group-hover:border-emerald-300 group-hover:text-emerald-700'
	},
	sky: {
		border: 'hover:border-sky-300',
		shadow: 'hover:shadow-sky-200/60',
		chip: 'group-hover:bg-sky-50 group-hover:text-sky-700',
		button: 'group-hover:border-sky-300 group-hover:text-sky-700'
	},
	violet: {
		border: 'hover:border-violet-300',
		shadow: 'hover:shadow-violet-200/60',
		chip: 'group-hover:bg-violet-50 group-hover:text-violet-700',
		button: 'group-hover:border-violet-300 group-hover:text-violet-700'
	},
	amber: {
		border: 'hover:border-amber-300',
		shadow: 'hover:shadow-amber-200/60',
		chip: 'group-hover:bg-amber-50 group-hover:text-amber-700',
		button: 'group-hover:border-amber-300 group-hover:text-amber-700'
	},
	rose: {
		border: 'hover:border-rose-300',
		shadow: 'hover:shadow-rose-200/60',
		chip: 'group-hover:bg-rose-50 group-hover:text-rose-700',
		button: 'group-hover:border-rose-300 group-hover:text-rose-700'
	},
	indigo: {
		border: 'hover:border-indigo-300',
		shadow: 'hover:shadow-indigo-200/60',
		chip: 'group-hover:bg-indigo-50 group-hover:text-indigo-700',
		button: 'group-hover:border-indigo-300 group-hover:text-indigo-700'
	}
};

function pickToneFromId(id = '') {
	const keys = Object.keys(TONES);
	let sum = 0;
	for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
	return keys[sum % keys.length];
}

export default function TemplateCard({ template, onPreview, onUse }) {
  const {
    summary,
    audience = [],
    tags = [],
    popularity,
    collectionTitle,
    quickTweaks = []
  } = template;

  const popularityLabel =
    popularity > 1000 ? 'Most popular' : popularity > 800 ? 'Trending' : 'New favourite';

  const variantTitle = buildVariantTitle(template);
  const descriptor = resolveTemplateDescriptor(template);

  const toneKey = pickToneFromId(template?.id || title || 't');
  const tone = TONES[toneKey];

  return (
    <Surface
      muted
      className={[
        'group flex h-full flex-col justify-between gap-4 rounded-2xl p-5 transition-all',
        'hover:-translate-y-0.5 hover:bg-background',
        'border border-border/50 shadow-sm',
        tone.border,
        tone.shadow
      ].join(' ')}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {collectionTitle}
          </span>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
            {popularityLabel}
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            <Link to={`/templates/${encodeURIComponent(template.id)}`} className="hover:underline">
              {variantTitle}
            </Link>
          </h3>
          {descriptor ? (
            <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {descriptor}
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {audience.map((label) => (
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
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {quickTweaks.length ? (
          <div className="rounded-xl border border-border/50 bg-background/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Quick tweaks
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {quickTweaks.slice(0, 3).map((tweak) => (
                <li key={tweak}>• {tweak}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            shape="pill"
            className="w-full px-5 sm:w-auto"
            onClick={() => onUse?.(template)}
          >
            Use this template
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

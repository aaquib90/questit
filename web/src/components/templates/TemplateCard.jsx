import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/layout';

export default function TemplateCard({ template, onPreview, onUse }) {
  const {
    title,
    summary,
    audience = [],
    tags = [],
    popularity,
    collectionTitle,
    quickTweaks = []
  } = template;

  const popularityLabel =
    popularity > 1000 ? 'Most popular' : popularity > 800 ? 'Trending' : 'New favourite';

  return (
    <Surface muted className="flex h-full flex-col justify-between gap-4 p-5">
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
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {audience.map((label) => (
            <Badge key={label} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button shape="pill" className="w-full px-5 sm:w-auto" onClick={() => onUse?.(template)}>
            Use this template
          </Button>
          <Button
            variant="outline"
            shape="pill"
            className="w-full px-5 sm:w-auto"
            onClick={() => onPreview?.(template)}
          >
            See how it looks
          </Button>
        </div>
      </div>
    </Surface>
  );
}

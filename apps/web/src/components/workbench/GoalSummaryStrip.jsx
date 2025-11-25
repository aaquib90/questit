import { Badge } from '@/components/ui/badge';

export default function GoalSummaryStrip({ useCases = [], complexity = 'Normal', addons = {} }) {
  const activeUseCases = useCases.length ? useCases : ['General'];
  const { auth = false, persistence = false, share = true } = addons;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {activeUseCases.map((label) => (
          <Badge key={label} variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {label}
          </Badge>
        ))}
      </div>
      <span className="mx-1 text-muted-foreground">·</span>
      <span className="text-xs text-muted-foreground">Complexity: {complexity}</span>
      <span className="mx-1 text-muted-foreground">·</span>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs text-muted-foreground">Add-ons:</span>
        <Badge variant={auth ? 'default' : 'outline'} className="rounded-full px-2 py-0.5 text-[11px]">
          Auth
        </Badge>
        <Badge
          variant={persistence ? 'default' : 'outline'}
          className="rounded-full px-2 py-0.5 text-[11px]"
        >
          Persistence
        </Badge>
        <Badge variant={share ? 'default' : 'outline'} className="rounded-full px-2 py-0.5 text-[11px]">
          Share link
        </Badge>
      </div>
    </div>
  );
}



import { Button } from '@/components/ui/button';
import { Surface } from '@/components/layout';

export default function LeftRail({ activeView, onSelectView, sessionEntries = [] }) {
  return (
    <div className="hidden lg:flex lg:flex-col lg:gap-4">
      <Surface muted className="rounded-2xl p-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Navigate
          </p>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              shape="pill"
              variant={activeView === 'workbench' ? 'default' : 'outline'}
              className="w-full justify-center"
              onClick={() => onSelectView('workbench')}
            >
              Workbench
            </Button>
            <Button
              size="sm"
              shape="pill"
              variant={activeView === 'templates' ? 'default' : 'outline'}
              className="w-full justify-center"
              onClick={() => onSelectView('templates')}
            >
              Templates
            </Button>
            <Button
              size="sm"
              shape="pill"
              variant={activeView === 'my-tools' ? 'default' : 'outline'}
              className="w-full justify-center"
              onClick={() => onSelectView('my-tools')}
            >
              My Tools
            </Button>
          </div>
        </div>
      </Surface>
      <Surface muted className="rounded-2xl p-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Recent prompts
          </p>
          <ul className="space-y-2">
            {sessionEntries.slice(-5).map((entry) => (
              <li key={entry.id} className="truncate text-xs text-muted-foreground">
                {entry.prompt}
              </li>
            ))}
            {!sessionEntries.length ? (
              <li className="text-xs text-muted-foreground">No prompts yet</li>
            ) : null}
          </ul>
        </div>
      </Surface>
    </div>
  );
}



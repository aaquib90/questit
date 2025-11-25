import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PillTray } from '@/components/layout';

const USE_CASES = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Cards, charts, quick actions' },
  { id: 'automations', label: 'Automations', hint: 'Background tasks, reminders' },
  { id: 'form', label: 'Form', hint: 'Inputs, validation, summaries' },
  { id: 'tracker', label: 'Tracker', hint: 'Lists, totals, filters' },
  { id: 'notes', label: 'Notes', hint: 'Rich text, search, tags' }
];

export default function UseCaseChips({ selected = [], onToggle }) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
        Use cases
      </p>
      <PillTray>
        {USE_CASES.map((item) => {
          const isActive = selectedSet.has(item.id);
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              shape="pill"
              variant={isActive ? 'default' : 'outline'}
              className="px-4"
              onClick={() => onToggle?.(item.id)}
              title={item.hint}
            >
              {item.label}
            </Button>
          );
        })}
      </PillTray>
    </div>
  );
}



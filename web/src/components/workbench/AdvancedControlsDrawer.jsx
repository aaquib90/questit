 
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdvancedControlsDrawer({
  modelOptions = [],
  selectedModelId,
  onSelectModel,
  memorySettings = { mode: 'none', retention: 'indefinite' },
  onChangeMemorySettings
}) {
  const handleMemoryModeChange = (value) => {
    onChangeMemorySettings?.({
      ...memorySettings,
      mode: value
    });
  };

  const handleRetentionChange = (value) => {
    onChangeMemorySettings?.({
      ...memorySettings,
      retention: value
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-background/80 p-4">
      <div className="space-y-2">
        <Label htmlFor="questit-model" className="text-xs text-muted-foreground">
          Choose a model
        </Label>
        <Select value={selectedModelId} onValueChange={onSelectModel}>
          <SelectTrigger id="questit-model" className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Faster models respond quickly for drafts; larger models produce more detailed output.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questit-memory-mode" className="text-xs text-muted-foreground">
          Tool memory <span className="uppercase text-[11px]">Beta</span>
        </Label>
        <Select value={memorySettings.mode} onValueChange={handleMemoryModeChange}>
          <SelectTrigger id="questit-memory-mode" className="w-full">
            <SelectValue placeholder="Select memory scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Off — do not remember anything</SelectItem>
            <SelectItem value="device">This device only</SelectItem>
            <SelectItem value="account" disabled>
              Signed-in users (coming soon)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          When enabled, generated tools can call <code>window.questit?.kit?.memory</code> to persist
          user inputs. Make sure the code guards the helper with optional chaining.
        </p>
        {memorySettings.mode === 'device' ? (
          <div className="space-y-2">
            <Label htmlFor="questit-memory-retention" className="text-xs text-muted-foreground">
              Retention
            </Label>
            <Select value={memorySettings.retention} onValueChange={handleRetentionChange}>
              <SelectTrigger id="questit-memory-retention" className="w-full">
                <SelectValue placeholder="Choose retention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indefinite">Keep data across visits</SelectItem>
                <SelectItem value="session">Clear when the viewer resets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    </div>
  );
}


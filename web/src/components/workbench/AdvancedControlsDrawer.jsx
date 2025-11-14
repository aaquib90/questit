 
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 

export default function AdvancedControlsDrawer({ modelOptions = [], selectedModelId, onSelectModel }) {

  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
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
    </div>
  );
}



import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SaveToolDialog({
  open,
  onOpenChange,
  initialTitle = '',
  initialSummary = '',
  memorySettings = { mode: 'none', retention: 'indefinite' },
  onChangeMemorySettings,
  memoryModeOptions = [],
  memoryRetentionOptions = [],
  onSubmit,
  status = { state: 'idle', message: '' }
}) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [localMemory, setLocalMemory] = useState(memorySettings);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle || '');
      setSummary(initialSummary || '');
      setLocalMemory(memorySettings || { mode: 'none', retention: 'indefinite' });
    }
  }, [initialSummary, initialTitle, memorySettings, open]);

  const handleMemoryModeChange = (value) => {
    const next = { ...localMemory, mode: value };
    setLocalMemory(next);
    onChangeMemorySettings?.(next);
  };

  const handleRetentionChange = (value) => {
    const next = { ...localMemory, retention: value };
    setLocalMemory(next);
    onChangeMemorySettings?.(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit?.({ title: title.trim(), summary: summary.trim(), memory: localMemory });
  };

  const isLoading = status.state === 'loading';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg gap-6 p-6 sm:p-8">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>Save to Supabase</DialogTitle>
          <DialogDescription>
            Add a friendly title and optional summary before saving this tool to your Supabase
            project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool-title">Tool title</Label>
              <Input
                id="tool-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="For example: Quick Note Taker"
                maxLength={120}
                required
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/120 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-summary">Public summary</Label>
              <Textarea
                id="tool-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Short description shown on shared pages (prompt stays private)"
                maxLength={240}
              />
              <p className="text-xs text-muted-foreground">
                {summary.length}/240 characters
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="space-y-2">
                <Label htmlFor="save-memory-mode" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Tool memory <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">Beta</span>
                </Label>
                <Select value={localMemory.mode} onValueChange={handleMemoryModeChange}>
                  <SelectTrigger id="save-memory-mode" className="w-full">
                    <SelectValue placeholder="Select memory scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {memoryModeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  When enabled, generated tools can call <code>window.questit?.kit?.memory</code> to
                  persist user inputs. Always guard calls with optional chaining.
                </p>
              </div>

              {localMemory.mode !== 'none' ? (
                <div className="space-y-2">
                  <Label htmlFor="save-memory-retention" className="text-xs text-muted-foreground">
                    Retention
                  </Label>
                  <Select value={localMemory.retention} onValueChange={handleRetentionChange}>
                    <SelectTrigger id="save-memory-retention" className="w-full">
                      <SelectValue placeholder="Choose retention" />
                    </SelectTrigger>
                    <SelectContent>
                      {memoryRetentionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          </div>

          {status.message ? (
            <p
              className={`text-sm ${
                status.state === 'error'
                  ? 'text-destructive'
                  : status.state === 'success'
                    ? 'text-emerald-500'
                    : 'text-muted-foreground'
              }`}
            >
              {status.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save tool'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SaveToolDialog;

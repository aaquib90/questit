import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function SaveToolDialog({
  open,
  onOpenChange,
  initialTitle = '',
  initialSummary = '',
  onSubmit,
  status = { state: 'idle', message: '' }
}) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle || '');
      setSummary(initialSummary || '');
    }
  }, [initialSummary, initialTitle, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit?.({ title: title.trim(), summary: summary.trim() });
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

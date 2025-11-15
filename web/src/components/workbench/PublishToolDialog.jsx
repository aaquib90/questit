import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone with the link can view this tool.'
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you (while signed in) can open the tool.'
  },
  {
    value: 'passphrase',
    label: 'Passphrase',
    description: 'Viewers must enter a passphrase you set before the tool loads.'
  }
];

function PublishToolDialog({
  open,
  onOpenChange,
  initialVisibility = 'public',
  onSubmit,
  status = { state: 'idle', message: '' },
  toolTitle
}) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [passphrase, setPassphrase] = useState('');

  useEffect(() => {
    if (open) {
      setVisibility(initialVisibility || 'public');
      setPassphrase('');
    }
  }, [initialVisibility, open]);

  const isLoading = status.state === 'loading';
  const isPassphrase = visibility === 'passphrase';
  const trimmedPassphrase = passphrase.trim();
  const passphraseInvalid = isPassphrase && trimmedPassphrase.length < 4;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPassphrase && passphraseInvalid) {
      return;
    }
    onSubmit?.({
      visibility,
      passphrase: isPassphrase ? trimmedPassphrase : ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg gap-6 p-6 sm:p-7">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>Publish tool</DialogTitle>
          <DialogDescription>
            Choose who can open this share link before publishing
            {toolTitle ? ` “${toolTitle}”` : ''}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publish-visibility">Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger id="publish-visibility" className="w-full">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isPassphrase ? (
              <div className="space-y-2">
                <Label htmlFor="publish-passphrase">Passphrase</Label>
                <Input
                  id="publish-passphrase"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter a passphrase (min. 4 characters)"
                  value={passphrase}
                  onChange={(event) => setPassphrase(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Share this passphrase with anyone who should access the tool.
                </p>
                {passphraseInvalid ? (
                  <p className="text-xs text-destructive">
                    Passphrase must be at least 4 characters long.
                  </p>
                ) : null}
              </div>
            ) : null}
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (isPassphrase && passphraseInvalid)}>
              {isLoading ? 'Publishing…' : 'Publish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PublishToolDialog;

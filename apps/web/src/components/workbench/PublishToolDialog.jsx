import { useEffect, useMemo, useState } from 'react';

import { Globe2, Lock, KeySquare } from 'lucide-react';

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
    description: 'Anyone with the link can view this tool.',
    icon: Globe2
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you (while signed in) can open the tool.',
    icon: Lock
  },
  {
    value: 'passphrase',
    label: 'Passphrase',
    description: 'Viewers must enter a passphrase you set before the tool loads.',
    icon: KeySquare
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

  const selectedOption = useMemo(
    () => VISIBILITY_OPTIONS.find((option) => option.value === visibility) || VISIBILITY_OPTIONS[0],
    [visibility]
  );

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
                  <SelectValue placeholder="Select visibility">
                    <div className="flex items-center gap-2">
                      {selectedOption.icon ? (
                        <selectedOption.icon className="h-4 w-4 text-primary" aria-hidden />
                      ) : null}
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">{selectedOption.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedOption.description}
                        </span>
                      </div>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-start gap-3">
                        {option.icon ? (
                          <option.icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                        ) : null}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
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

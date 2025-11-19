import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export default function ToolPreviewDialog({ open, onOpenChange, slug, title, summary }) {
  const viewerUrl = useMemo(() => {
    if (!slug) return '';
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '';
      return `${origin}/tools/${encodeURIComponent(slug)}`;
    } catch {
      return `/tools/${encodeURIComponent(slug)}`;
    }
  }, [slug]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="space-y-2 p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {title || 'Questit Tool'}
          </DialogTitle>
          {summary ? (
            <DialogDescription className="text-sm text-muted-foreground">{summary}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="p-6">
          <div className="overflow-hidden rounded-2xl border border-border/70 shadow-xl">
            {viewerUrl ? (
              <iframe
                title={`${title || slug} viewer preview`}
                className="h-[520px] w-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms"
                src={viewerUrl}
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
                Preview unavailable
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            {slug ? (
              <Button asChild>
                <a href={`/?remix=${encodeURIComponent(slug)}`}>Remix in Workbench</a>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



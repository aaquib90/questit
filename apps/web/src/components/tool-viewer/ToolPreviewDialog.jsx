import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import PreviewStage from '@/components/preview/PreviewStage.jsx';

function escapeAttribute(value = '') {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
          <PreviewStage
            html={
              viewerUrl
                ? `<iframe src="${escapeAttribute(viewerUrl)}" title="${escapeAttribute(title || slug || 'Questit tool')}" style="width:100%;height:520px;border:none;border-radius:24px;" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>`
                : '<div class="preview-placeholder">Preview unavailable.</div>'
            }
            height={520}
            title={title || slug || 'Questit tool'}
            subtitle={summary || 'Tool preview'}
            statusLabel="Live"
          />
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



import { useMemo } from 'react';
import { buildPreviewShell } from '@questit/toolkit/previewShell';
import { cn } from '@/lib/utils.js';

export default function PreviewStage({
  doc,
  html = '',
  css = '',
  js = '',
  title = 'Questit preview',
  subtitle,
  statusLabel = 'Draft',
  footerNote,
  accentHex,
  mode = 'light',
  height = 520,
  className,
  iframeTitle = 'Questit preview',
  bodyScripts,
  iframeRef,
  iframeId,
  sandbox = 'allow-scripts allow-same-origin allow-forms'
}) {
  const srcDoc = useMemo(
    () => {
      if (doc) return doc;
      return buildPreviewShell(
        { html, css, js },
        {
          title,
          subtitle,
          statusLabel,
          footerNote,
          accentHex,
          mode,
          bodyScripts
        }
      );
    },
    [doc, html, css, js, title, subtitle, statusLabel, footerNote, accentHex, mode, bodyScripts]
  );

  return (
    <div className={cn('overflow-hidden rounded-3xl border border-border/60 bg-muted/30 shadow-xl', className)}>
      <iframe
        id={iframeId}
        ref={iframeRef}
        title={iframeTitle}
        className="w-full border-0"
        style={{ minHeight: height }}
        sandbox={sandbox}
        srcDoc={srcDoc}
      />
    </div>
  );
}


import type { ToolkitTemplate } from '@questit/toolkit/templates';
import { buildPreviewShell } from '@questit/toolkit/previewShell';

interface BuildPreviewOptions {
  accentHex?: string;
  mode?: 'light' | 'dark';
}

export function buildTemplatePreviewHtml(
  template: ToolkitTemplate,
  options: BuildPreviewOptions = {}
): string {
  const html = template?.preview?.html || template?.html || '';
  const css = template?.preview?.css || template?.css || '';
  const js = template?.preview?.js || template?.js || '';
  return buildPreviewShell(
    { html, css, js },
    {
      accentHex: options.accentHex,
      mode: options.mode,
      title: template?.title || 'Questit preview',
      subtitle: template?.summary || 'Template sample',
      statusLabel: 'Draft'
    }
  );
}

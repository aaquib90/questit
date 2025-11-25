export interface PreviewBundle {
  html?: string;
  css?: string;
  js?: string;
}

export interface PreviewShellOptions {
  accentHex?: string;
  mode?: 'light' | 'dark';
  title?: string;
  subtitle?: string;
  statusLabel?: string;
  footerNote?: string;
  bodyScripts?: string;
}

const FONT_STACK =
  "'Inter', 'Zalando Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function escapeHtml(value?: string) {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildPreviewShell(bundle: PreviewBundle = {}, options: PreviewShellOptions = {}) {
  const accent = options.accentHex || '#34d399';
  const mode = options.mode === 'dark' ? 'dark' : 'light';
  const background = mode === 'dark' ? '#020617' : '#f8fafc';
  const foreground = mode === 'dark' ? '#e2e8f0' : '#0f172a';
  const card = mode === 'dark' ? '#0b1120' : '#ffffff';
  const toolbar = mode === 'dark' ? '#0f172a' : '#e2e8f0';
  const border = mode === 'dark' ? 'rgba(148, 163, 184, 0.35)' : 'rgba(15, 23, 42, 0.08)';
  const placeholder =
    '<p class="preview-placeholder">Add content to see the Questit preview.</p>';

  const title = escapeHtml(options.title) || 'Questit preview';
  const subtitle = escapeHtml(options.subtitle || '');
  const statusLabel = escapeHtml(options.statusLabel || 'Draft');
  const footerNote = escapeHtml(options.footerNote || '');
  const bodyScripts = options.bodyScripts || '';

  const safeHtml = (bundle.html && bundle.html.trim()) || placeholder;
  const safeCss = bundle.css || '';
  const safeJs = bundle.js || '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=swap');
      :root {
        color-scheme: ${mode};
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        padding: 32px;
        background: ${background};
        color: ${foreground};
        font-family: ${FONT_STACK};
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .preview-stage {
        width: min(960px, 100%);
        background: rgba(15, 23, 42, ${mode === 'dark' ? '0.45' : '0.04'});
        border-radius: 32px;
        border: 1px solid ${border};
        box-shadow:
          0 40px 120px rgba(15, 23, 42, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, ${mode === 'dark' ? '0.06' : '0.8'});
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .preview-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${toolbar};
        border-radius: 20px;
        padding: 16px 20px;
        border: 1px solid ${border};
        gap: 16px;
      }
      .preview-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .preview-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: ${foreground};
      }
      .preview-subtitle {
        font-size: 13px;
        margin: 0;
        color: rgba(71, 85, 105, ${mode === 'dark' ? '0.9' : '1'});
      }
      .preview-status {
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        background: ${accent}1a;
        color: ${accent};
        border: 1px solid ${accent}33;
      }
      .preview-canvas {
        background: ${card};
        border-radius: 24px;
        min-height: 420px;
        border: 1px solid ${border};
        padding: 24px;
        overflow: hidden;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, ${mode === 'dark' ? '0.02' : '0.4'});
      }
      .preview-canvas * {
        font-family: ${FONT_STACK};
      }
      .preview-placeholder {
        margin: 0;
        font-size: 14px;
        color: rgba(71, 85, 105, 0.85);
      }
      .preview-footer {
        font-size: 12px;
        color: rgba(71, 85, 105, 0.9);
        text-align: center;
      }
    </style>
    <style data-questit-user-css>
${safeCss}
    </style>
  </head>
  <body>
    <div class="preview-stage">
      <div class="preview-toolbar">
        <div class="preview-meta">
          <p class="preview-title">${title}</p>
          ${subtitle ? `<p class="preview-subtitle">${subtitle}</p>` : ''}
        </div>
        <span class="preview-status">${statusLabel}</span>
      </div>
      <div class="preview-canvas">
${safeHtml}
      </div>
      ${footerNote ? `<p class="preview-footer">${footerNote}</p>` : ''}
    </div>
    <script type="module">
      try {
${safeJs}
      } catch (error) {
        console.error('Questit preview runtime error', error);
      }
    </script>
${bodyScripts}
  </body>
</html>`;
}


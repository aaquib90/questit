import { isBrowser } from '../utils/helper-functions.js';

export function createEmbedCode(tool) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${tool.css || ''}</style></head><body>${tool.html || ''}<script type="module">${tool.js || ''}\nwindow.addEventListener('questit:tool-error', (e)=>{ parent?.postMessage({ type: 'questit-tool-error', detail: e.detail }, '*');});</script></body></html>`;
  const srcdoc = html.replace(/`/g, '\\`');
  const iframe = `<iframe sandbox="allow-scripts" style="width:100%;height:420px;border:0;" srcdoc="${srcdoc}"></iframe>`;
  return { iframe, srcdoc: html };
}

export default { createEmbedCode };



export function prepareDownload(tool) {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${tool.title || 'Questit Tool'}</title><style>${tool.css || ''}</style></head><body>${tool.html || ''}<script type="module">${tool.js || ''}</script></body></html>`;
  const filename = `${(tool.title || 'questit-tool').toLowerCase().replace(/[^a-z0-9-]+/g,'-')}.html`;
  return { filename, content: doc };
}

export default { prepareDownload };



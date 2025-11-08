export default {
  async fetch(request) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const tool = await request.json();
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${tool.title || 'Questit Tool'}</title><style>${tool.css || ''}</style></head><body>${tool.html || ''}<script type="module">${tool.js || ''}</script></body></html>`;
    return new Response(doc, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${(tool.title || 'questit-tool').toLowerCase().replace(/[^a-z0-9-]+/g,'-')}.html"`
      }
    });
  }
};



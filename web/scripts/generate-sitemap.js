// ESM script to augment sitemap.xml with template detail URLs
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');
const publicDir = path.join(webRoot, 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const ogTemplatesDir = path.join(publicDir, 'og', 'templates');

async function loadTemplates() {
  const supabaseUrl =
    process.env.SITEMAP_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';
  const supabaseAnonKey =
    process.env.SITEMAP_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const restEndpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/template_library?select=slug,name,summary&status=eq.published`;
      const response = await fetch(restEndpoint, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      });
      if (!response.ok) {
        throw new Error(`Supabase fetch failed (${response.status})`);
      }
      const rows = await response.json();
      if (Array.isArray(rows) && rows.length) {
        return rows.map((row) => ({
          id: row.slug || row.id || row.template_key,
          title: row.name || 'Questit Template',
          summary: row.summary || ''
        }));
      }
    } catch (error) {
      console.warn('[generate-sitemap] Supabase template fetch failed, falling back to static data.', error);
    }
  }

  const templatesModulePath = path.join(webRoot, 'src', 'data', 'templates.js');
  const mod = await import(pathToFileUrl(templatesModulePath));
  const collections = mod.TEMPLATE_COLLECTIONS || [];
  const all = [];
  for (const collection of collections) {
    const collId = collection.id;
    for (const t of collection.templates || []) {
      all.push({
        id: t.id,
        title: t.title,
        summary: t.summary || '',
        collectionId: collId
      });
    }
  }
  return all;
}

function pathToFileUrl(p) {
  const absolute = path.resolve(p);
  const url = new URL('file://');
  // On Windows, need leading slash removed; node handles this in URL constructor with pathToFileURL,
  // but to avoid extra import, we construct manually:
  return new URL(`file://${absolute}`).toString();
}

function buildUrlEntry(origin, templateId) {
  const loc = `${origin}/templates/${encodeURIComponent(templateId)}`;
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}

function ogSvgTemplate({ title }) {
  const safeTitle = (title || 'Questit Template').toString().slice(0, 68);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="48" />
  <g opacity="0.16" stroke="#ecfeff" stroke-width="18" fill="none">
    <path d="M120 160h320" stroke-linecap="round" />
    <path d="M920 470h160" stroke-linecap="round" />
    <circle cx="980" cy="210" r="72" />
    <circle cx="240" cy="450" r="54" />
  </g>
  <g fill="#ecfeff">
    <text x="120" y="300" font-family="'Inter', 'Segoe UI', system-ui" font-size="82" font-weight="700" letter-spacing="0.01em">
      ${escapeXml(safeTitle)}
    </text>
    <text x="120" y="380" font-family="'Inter', 'Segoe UI', system-ui" font-size="36" font-weight="400" opacity="0.92" letter-spacing="0.01em">
      Questit Template
    </text>
  </g>
</svg>
`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  // Resolve canonical origin for sitemap entries
  const origin = process.env.PUBLIC_APP_ORIGIN?.replace(/\/$/, '') || 'https://questit.cc';
  const templates = await loadTemplates();

  // Generate static OG SVGs for templates
  await ensureDir(ogTemplatesDir);
  await Promise.all(
    templates.map(async (t) => {
      const svg = ogSvgTemplate({ title: t.title });
      const outPath = path.join(ogTemplatesDir, `${t.id}.svg`);
      await fs.writeFile(outPath, svg, 'utf8');
    })
  );

  // Read existing sitemap.xml (if missing, create a minimal skeleton)
  let sitemap = '';
  try {
    sitemap = await fs.readFile(sitemapPath, 'utf8');
  } catch {
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;
  }

  const closingTag = '</urlset>';
  const lower = sitemap.toLowerCase();
  if (!lower.includes('<urlset')) {
    // Recreate a minimal valid structure
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;
  }

  // Avoid duplicate <loc> entries
  const existingLocs = new Set(
    Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => (m[1] || '').trim())
  );

  const entries = templates
    .map((t) => buildUrlEntry(origin, t.id))
    .filter((entry) => {
      const locMatch = entry.match(/<loc>([^<]+)<\/loc>/);
      const loc = (locMatch && locMatch[1]) || '';
      return loc && !existingLocs.has(loc);
    })
    .join('\n');

  if (entries) {
    const idx = sitemap.lastIndexOf(closingTag);
    if (idx >= 0) {
      sitemap = `${sitemap.slice(0, idx)}${entries}\n${closingTag}${sitemap.slice(idx + closingTag.length)}`;
    } else {
      // Fallback: append entries and closing tag
      sitemap = `${sitemap}\n${entries}\n${closingTag}\n`;
    }
  }

  await fs.writeFile(sitemapPath, sitemap, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Sitemap updated with ${templates.length} template URLs. Static OG images generated.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[generate-sitemap] Failed:', err);
  process.exit(1);
});


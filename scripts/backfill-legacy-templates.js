#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable ${name}`);
    process.exit(1);
  }
  return value;
}

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

async function loadLegacyTemplates() {
  const modulePath = path.join(__dirname, '..', 'web', 'src', 'data', 'templates.js');
  const mod = await import(pathToFileURL(modulePath));
  const collections = mod.TEMPLATE_COLLECTIONS || [];
  const rows = [];
  collections.forEach((collection) => {
    (collection.templates || []).forEach((template) => {
      rows.push({
        ...template,
        collectionId: collection.id,
        collectionTitle: collection.title
      });
    });
  });
  return rows;
}

function normaliseTemplate(template) {
  const slug = template.id || template.slug || template.title;
  const preview = template.preview || {};
  const html = preview.html || template.html || '';
  const css = preview.css || template.css || '';
  const js = preview.js || template.js || '';
  return {
    template_key: `legacy:${slug}`,
    slug,
    name: template.title || slug,
    descriptor: template.descriptor || null,
    summary: template.summary || '',
    category: template.collectionTitle || 'Legacy',
    category_description: null,
    tags: Array.isArray(template.tags) ? template.tags : [],
    audience: Array.isArray(template.audience) ? template.audience : [],
    prompt: template.prompt || '',
    html,
    css,
    js,
    preview_html: html,
    preview_css: css,
    preview_js: js,
    hero_image: template.heroImage || null,
    popularity: template.popularity || 0,
    quick_tweaks: Array.isArray(template.quickTweaks) ? template.quickTweaks : [],
    status: 'published'
  };
}

async function main() {
  const supabaseUrl = ensureEnv('SUPABASE_URL');
  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY_ID;
  if (!serviceRole) {
    console.error('Set SUPABASE_SERVICE_ROLE (service role key) before running this script.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  const legacyTemplates = await loadLegacyTemplates();
  const payload = legacyTemplates.map(normaliseTemplate);
  const batches = chunk(payload, 50);
  console.log(`Uploading ${payload.length} legacy templates in ${batches.length} batches…`);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const { error } = await supabase.from('template_library').upsert(batch, {
      onConflict: 'slug',
      ignoreDuplicates: false
    });
    if (error) {
      console.error(`Batch ${i + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(` • Batch ${i + 1}/${batches.length} uploaded (${batch.length} records)`);
  }

  console.log('Legacy templates uploaded successfully.');
}

main().catch((error) => {
  console.error('Fatal error importing legacy templates:', error);
  process.exit(1);
});

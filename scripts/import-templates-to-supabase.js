#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArg(name, fallback) {
  const flag = `--${name}`;
  const direct = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (direct) {
    return direct.split('=').slice(1).join('=');
  }
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) {
    return process.argv[index + 1];
  }
  return fallback;
}

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'template';

const hashFragment = (value = '') =>
  createHash('sha1').update(value || Math.random().toString(36)).digest('hex').slice(0, 6);

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function ensureEnv(name, fallbackMessage) {
  const value = process.env[name];
  if (!value) {
    console.error(fallbackMessage || `Missing required environment variable ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const inputArg = getArg('input');
  if (!inputArg) {
    console.error('Usage: npm run import:templates -- --input path/to/templates.json [--batch 50]');
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const batchSize = Number(getArg('batch', 50)) || 50;
  const status = getArg('status', 'published');
  const dryRun = getArg('dry-run', 'false') === 'true';

  const supabaseUrl = ensureEnv('SUPABASE_URL');
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY_ID;
  if (!serviceKey) {
    console.error('Set SUPABASE_SERVICE_ROLE (service role key) in your environment.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  const raw = await fs.readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw);
  const source = Array.isArray(parsed) ? parsed : parsed?.templates || [];
  const rows = source.filter((entry) => entry && entry.status === 'success');

  if (!rows.length) {
    console.error('No successful templates found in the input file.');
    process.exit(1);
  }

  const slugCounts = new Map();

  const payload = rows.map((entry) => {
    const safeName = entry.name?.trim() || 'Untitled Template';
    const baseSlug = slugify(entry.slug || safeName);
    const seed = entry.sourceKey || `${safeName}:::${entry.description || ''}`;
    const uniqueSlug = `${baseSlug}-${hashFragment(seed)}`;
    const slugIndex = slugCounts.get(uniqueSlug) || 0;
    slugCounts.set(uniqueSlug, slugIndex + 1);
    const slug = slugIndex === 0 ? uniqueSlug : `${uniqueSlug}-${slugIndex}`;
    return {
      template_key: entry.sourceKey || `${safeName}:::${entry.description || ''}`,
      slug,
      name: safeName,
      summary: entry.description?.trim() || entry.summary || '',
      category: entry.category || 'General',
      tags: entry.tags || [],
      audience: entry.audience || [],
      prompt: entry.prompt || '',
      html: entry.html || '',
      css: entry.css || '',
      js: entry.js || '',
      preview_html: entry.preview?.html || entry.html || '',
      preview_css: entry.preview?.css || entry.css || '',
      preview_js: entry.preview?.js || entry.js || '',
      hero_image: entry.hero_image || null,
      popularity: entry.popularity || 0,
      model_provider: entry.model_provider || null,
      model_name: entry.model_name || null,
      status
    };
  });

  if (dryRun) {
    console.log(`[dry-run] Prepared ${payload.length} templates for upload (batch size ${batchSize}).`);
    return;
  }

  const batches = chunk(payload, batchSize);
  console.log(`Uploading ${payload.length} templates in ${batches.length} batches…`);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const { error } = await supabase.from('template_library').upsert(batch, {
      onConflict: 'template_key',
      ignoreDuplicates: false
    });
    if (error) {
      console.error(`Batch ${i + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`  • Batch ${i + 1}/${batches.length} uploaded (${batch.length} records).`);
  }

  console.log('All templates uploaded successfully.');
}

main().catch((error) => {
  console.error('Fatal error while importing templates:', error);
  process.exit(1);
});

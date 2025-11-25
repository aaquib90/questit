#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import { fileURLToPath } from 'node:url';

import { generateTool } from '../packages/toolkit/src/generateTool.js';
import { staticScan } from '../src/core/static-scan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArg(name, defaultValue = undefined) {
  const flag = `--${name}`;
  const value = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (value) {
    return value.split('=').slice(1).join('=');
  }
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) {
    return process.argv[index + 1];
  }
  return defaultValue;
}

function parseInteger(value, defaultValue) {
  if (value === undefined || value === null) return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MIN_HTML_LENGTH = 80;
const MIN_CSS_LENGTH = 40;
const MIN_JS_LENGTH = 80;

const DEFAULT_MODEL_BY_PROVIDER = {
  gemini: 'gemini-2.5-flash',
  anthropic: 'claude-3-5-haiku-20241022',
  openai: 'gpt-4o-mini'
};

function normaliseName(row) {
  return row?.Name?.trim() || row?.name?.trim() || 'unknown';
}

function normaliseDescription(row) {
  return row?.Description?.trim() || row?.description?.trim() || '';
}

function makeSourceKey(row) {
  const name = normaliseName(row);
  const description = normaliseDescription(row);
  return `${name}:::${description}`;
}

function buildPrompt(row) {
  const name = normaliseName(row) || 'Untitled Tool';
  const description = normaliseDescription(row) || 'No description provided.';
  const category = row.Category?.trim() || 'General';
  return `You are building a Questit micro-tool.
Tool name: ${name}
Category: ${category}
Description: ${description}

Create a polished, self-contained browser experience that matches the description. The UI should:
- Include a hero/header that clearly states "${name}" and a short subheading that mirrors the description.
- Provide interactive controls that make sense for this type of tool (forms, sliders, tabs, tables, etc.).
- Display results in-line with friendly empty states and helpful copy.
- Use accessible HTML semantics, keyboard-friendly controls, and inline validation.
- Avoid external APIs or premium services; rely entirely on client-side logic.

The tool should feel production-ready, responsive, and visually aligned with modern shadcn/Tailwind patterns (cards, grids, subtle gradients).

After generating the tool, provide a JSON object called meta with:
- descriptor: a short phrase (≤6 words) that highlights what makes this variant unique (e.g., "Wi-Fi & vCards", "Shopify checkout links").
- marketing_name: a headline-length title that combines the base tool name with the descriptor (e.g., "QR Code Generator · Wi-Fi & vCards"). Use the descriptor only if it adds clarity; otherwise reuse the original name.
`;
}

function hasSufficientContent(text, minChars, pattern) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < minChars) return false;
  if (pattern && !pattern.test(trimmed)) return false;
  return true;
}

function validateBundleOrThrow(code) {
  const htmlOk = hasSufficientContent(code.html, MIN_HTML_LENGTH, /<[^>]+>/);
  const cssOk = hasSufficientContent(code.css, MIN_CSS_LENGTH, /[{;]/);
  const jsOk = hasSufficientContent(code.js, MIN_JS_LENGTH, /(const|let|function|class)\s+/);
  if (!htmlOk || !cssOk || !jsOk) {
    const missing = [
      htmlOk ? null : 'HTML',
      cssOk ? null : 'CSS',
      jsOk ? null : 'JS'
    ]
      .filter(Boolean)
      .join(', ');
    throw new Error(`Incomplete bundle (missing/too short: ${missing || 'unknown'})`);
  }

  const scan = staticScan({ html: code.html, css: code.css, js: code.js });
  if (scan.critical) {
    const criticalIssues = scan.issues.filter((issue) => issue.severity === 'critical');
    const summary = criticalIssues.map((issue) => `${issue.file}:${issue.id}`).join(', ');
    throw new Error(`Security scan failed (${summary || 'critical issue detected'})`);
  }
  if (scan.issues.length > 0) {
    console.warn(
      '  ⚠ Static scan warnings:\n',
      scan.issues.map((issue) => `   - [${issue.severity}] ${issue.file}: ${issue.message}`).join('\n')
    );
  }
}

async function loadCsvRecords(csvPath) {
  const raw = await fs.readFile(csvPath, 'utf8');
  const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) {
    console.warn('CSV parse warnings:', parsed.errors.map((err) => err.message));
  }
  return parsed.data.filter((row) => row && row.Name && row.Description);
}

async function loadExisting(outputPath) {
  try {
    const raw = await fs.readFile(outputPath, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    console.warn('Existing output file was not an array. Ignoring.');
    return [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function persist(outputPath, records) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(records, null, 2));
}

async function main() {
  const csvArg = getArg('csv');
  if (!csvArg) {
    console.error('Missing required --csv path to the source CSV file.');
    process.exit(1);
  }
  const csvPath = path.resolve(process.cwd(), csvArg);
  const outputPath = path.resolve(process.cwd(), getArg('out', 'scripts/output/generated-templates.json'));
  const start = parseInteger(getArg('start'), 0);
  const limit = parseInteger(getArg('limit'), 0);
  const delayMs = Math.max(0, parseInteger(getArg('delay'), 1500));
  const provider = (getArg('provider') || 'openai').toLowerCase();
  const model = getArg('model') || undefined;
  const endpoint = getArg('endpoint', process.env.TEMPLATE_GENERATOR_ENDPOINT || 'https://questit.cc/api/ai/proxy');

  console.log('Template generation config:');
  console.log(' CSV:', csvPath);
  console.log(' Output:', outputPath);
  console.log(' Range:', start, limit > 0 ? `→ ${start + limit - 1}` : '(through end)');
  console.log(' Provider:', provider);
  console.log(' Model:', model || '(default)');
  console.log(' Endpoint:', endpoint);
  console.log(' Delay between requests (ms):', delayMs);

  const [records, existing] = await Promise.all([loadCsvRecords(csvPath), loadExisting(outputPath)]);
  const existingMap = new Map();
  existing.forEach((entry) => {
    if (!entry) return;
    const key = entry.sourceKey || makeSourceKey(entry);
    if (entry.status && entry.status !== 'success') {
      return;
    }
    existingMap.set(key, entry);
  });

  const slice = limit > 0 ? records.slice(start, start + limit) : records.slice(start);
  console.log(`Total source rows: ${records.length}. Processing ${slice.length} items in this run.`);

  const results = existing.slice();
  for (let idx = 0; idx < slice.length; idx += 1) {
    const row = slice[idx];
    const key = makeSourceKey(row);
    const absoluteIndex = start + idx;

    if (existingMap.has(key)) {
      console.log(`[${absoluteIndex}] ${row.Name} — already processed, skipping.`);
      continue;
    }

    console.log(`[${absoluteIndex}] Generating: ${row.Name}`);
    const prompt = buildPrompt(row);
    try {
      const code = await generateTool(prompt, endpoint, undefined, {
        modelConfig: { provider, model },
        requestMetadata: { templateKey: key, category: row.Category || null }
      });
      validateBundleOrThrow(code);

      const meta = typeof code.meta === 'string' ? JSON.parse(code.meta) : code.meta;
      const descriptor = meta?.descriptor?.trim() || '';
      const marketingName = meta?.marketing_name?.trim();
      const entryName = marketingName || (descriptor ? `${normaliseName(row)} · ${descriptor}` : normaliseName(row));

      const fallbackModel = DEFAULT_MODEL_BY_PROVIDER[provider] || DEFAULT_MODEL_BY_PROVIDER.openai;
      const entry = {
        sourceKey: key,
        name: entryName || 'Untitled Tool',
        description: normaliseDescription(row) || '',
        category: row.Category?.trim() || 'General',
        descriptor,
        prompt,
        html: code.html || '',
        css: code.css || '',
        js: code.js || '',
        model_provider: provider,
        model_name: model || fallbackModel,
        generated_at: new Date().toISOString(),
        status: 'success'
      };

      results.push(entry);
      existingMap.set(key, entry);
      await persist(outputPath, results);
      console.log(`  ✔ Saved bundle for "${entry.name}"`);
    } catch (error) {
      console.error(`  ✖ Failed to generate "${row.Name}":`, error?.message || error);
      results.push({
        sourceKey: key,
        name: normaliseName(row) || 'Untitled Tool',
        description: normaliseDescription(row) || '',
        category: row.Category?.trim() || 'General',
        prompt,
        error: error?.message || 'Unknown error',
        failed_at: new Date().toISOString(),
        status: 'failed'
      });
      await persist(outputPath, results);
    }

    if (delayMs > 0 && idx < slice.length - 1) {
      await delay(delayMs);
    }
  }

  console.log(`Finished. Generated ${results.length - existing.length} new entries. Output saved to ${outputPath}`);
}

main().catch((error) => {
  console.error('Fatal error while generating templates:', error);
  process.exit(1);
});

import { queryAIModel } from './ai-model.js';
import { createToolError } from '../utils/helper-functions.js';
import { getArchetypePreset } from './prompts/presets.js';
import { staticScan } from '../core/static-scan.js';

const SAFE_EVALUATION_GUIDANCE = `Math / expression handling guidance:
- When you need to evaluate arithmetic expressions, parse and compute them explicitly without using eval(), new Function(), or any dynamic code execution.
- Sanitize the input to allow only digits, decimal points, parentheses, and arithmetic operators (+, -, *, /, %).
- Use a deterministic algorithm (e.g. shunting-yard with two stacks) to respect operator precedence and parentheses.
- Surface helpful errors for invalid characters, mismatched parentheses, or division by zero instead of attempting to execute the raw string.`;

const RUNTIME_KIT_GUIDANCE = `Questit runtime helpers:
- Access shared utilities via window.questit?.kit (events, safeFetch with retry/timeout, local/session storage helpers).
- Use window.questit?.runtime to trigger resets or self-tests (e.g. window.questit.runtime.resetTool(toolId)).
- Publish cross-component events with window.questit?.kit.publish('event-name', payload) so other listeners can react.
- Guard all usages with optional chaining so the tool still works if embedded outside the Questit frame.`;

function buildRepairPrompt(userPrompt, issues, current) {
  const issuesList = (issues || []).map(i => `- [${i.severity}] ${i.file}: ${i.message} (${i.id})`).join('\n');
  return `You previously produced code for a Questit micro-tool that FAILED a static security scan.

STRICT requirements (must follow exactly):
- SECURITY: NEVER use eval(), new Function(), Function constructor, or any dynamic code execution.
- Do not use external build tools; use plain HTML/CSS/JS.
- Expose a self-test via window.runSelfCheck (see below).
- Return ONLY JSON with keys: html, css, js, description, instructions.

${SAFE_EVALUATION_GUIDANCE}

${RUNTIME_KIT_GUIDANCE}

Self-test requirement:
- REQUIRED: window.runSelfCheck = async () => { /* return { pass: true } or { pass: false, details } */ }
- The self-test must validate the core functionality described by the user's prompt.

Original user prompt:\n${userPrompt}

Security issues to fix:
${issuesList || '- (none listed)'}

Current code (for reference):
/* html */\n${current?.html || ''}\n\n/* css */\n${current?.css || ''}\n\n/* js */\n${current?.js || ''}
`;
}

function buildSystemPrompt(userPrompt, codeAnalysis, intent) {
  const preset = intent?.preset ? getArchetypePreset(intent.preset?.id || intent.archetype || intent.preset) || intent.preset : getArchetypePreset(intent?.archetype);
  const presetText = preset?.systemAddendum ? `\nArchetype guidance: ${preset.systemAddendum}\n` : '';
  return `You are an expert front-end engineer adapting an existing open-source snippet into a standalone Questit micro-tool.\n\nKey requirements:\n1. Wrap all asynchronous operations in try/catch and surface errors via window.dispatchEvent(new CustomEvent('questit:tool-error', { detail: { message, stack }})).\n2. Validate user input and provide user-friendly error messages inline.\n3. Guard against missing DOM nodes before manipulating them.\n4. Never rely on external build tooling — produce plain HTML, CSS, and JavaScript.\n5. SECURITY: NEVER use eval(), new Function(), or any dynamic code execution. These are strictly forbidden and will cause the code to be rejected.\n6. REQUIRED: Include a function called runSelfCheck that is assigned to window.runSelfCheck. This function must:\n   - Return a Promise or object with { pass: true } or { success: true } if validation succeeds\n   - Return { pass: false, details: {...} } if validation fails\n   - Test that the core functionality works (e.g., for a calculator, test that 2+2=4)\n   - Example: window.runSelfCheck = async () => { try { /* test logic */; return { pass: true }; } catch(e) { return { pass: false, details: { message: e.message } }; } };\n7. Return your response as valid JSON with keys: html, css, js, description, instructions.${presetText}\n\n${SAFE_EVALUATION_GUIDANCE}\n\n${RUNTIME_KIT_GUIDANCE}\n\nContext:\n- User prompt: ${userPrompt}\n- Primary language: ${codeAnalysis.language}\n- Complexity: ${codeAnalysis.complexity}\n- Entry points: ${codeAnalysis.entryPoints.join(', ') || 'not detected'}\n`;
}

function injectSafeEvaluationHelper(js) {
  if (!js || !/\beval\s*\(/i.test(js)) {
    return js || '';
  }

  const helper = `function questitSafeEvaluate(expression) {
  if (typeof expression === 'number') {
    return expression;
  }
  if (typeof expression !== 'string') {
    throw new Error('Expression must be a string');
  }
  const trimmed = expression.trim();
  if (!trimmed) {
    return 0;
  }
  const sanitized = trimmed.replace(/\\s+/g, '');
  if (!/^[0-9+\\-*/().%]*$/.test(sanitized)) {
    throw new Error('Unsupported characters in expression');
  }
  const tokens = sanitized.match(/\\d*\\.\\d+|\\d+|[+\\-*/()%]/g);
  if (!tokens) {
    throw new Error('Unable to parse expression');
  }
  const output = [];
  const operators = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const isOperator = (token) => Object.prototype.hasOwnProperty.call(precedence, token);

  const applyOperator = () => {
    if (output.length < 2) {
      throw new Error('Incomplete expression');
    }
    const b = output.pop();
    const a = output.pop();
    const op = operators.pop();
    let result;
    switch (op) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        if (b === 0) {
          throw new Error('Division by zero');
        }
        result = a / b;
        break;
      case '%':
        if (b === 0) {
          throw new Error('Division by zero');
        }
        result = a % b;
        break;
      default:
        throw new Error('Unsupported operator');
    }
    if (!Number.isFinite(result)) {
      throw new Error('Result is not a finite number');
    }
    output.push(result);
  };

  for (const token of tokens) {
    if (isOperator(token)) {
      while (
        operators.length &&
        isOperator(operators[operators.length - 1]) &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        applyOperator();
      }
      operators.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        applyOperator();
      }
      if (!operators.length) {
        throw new Error('Mismatched parentheses');
      }
      operators.pop();
    } else {
      const value = Number(token);
      if (!Number.isFinite(value)) {
        throw new Error('Invalid numeric token in expression');
      }
      output.push(value);
    }
  }

  while (operators.length) {
    if (operators[operators.length - 1] === '(') {
      throw new Error('Mismatched parentheses');
    }
    applyOperator();
  }

  if (output.length !== 1) {
    throw new Error('Malformed expression');
  }

  return output[0];
}\n\n`;

  let updated = js.replace(/\beval\s*\(/gi, 'questitSafeEvaluate(');

  const insertAtTop = (snippet) => {
    const strictMatch = updated.match(/^\s*['"]use strict['"];\s*/);
    if (strictMatch) {
      const prefix = strictMatch[0];
      const rest = updated.slice(prefix.length);
      updated = `${prefix}${snippet}${rest}`;
    } else {
      updated = `${snippet}${updated}`;
    }
  };

  if (!/function\s+questitSafeEvaluate/.test(updated)) {
    const strictMatch = updated.match(/^\s*['"]use strict['"];\s*/);
    if (strictMatch) {
      const prefix = strictMatch[0];
      const rest = updated.slice(prefix.length);
      updated = `${prefix}${helper}${rest}`;
    } else {
      updated = `${helper}${updated}`;
    }
  }

  if (/\bevaluateExpression\s*\(/.test(updated)) {
    const hasEvalDefinition = /(function\s+evaluateExpression\s*\()|((const|let|var)\s+evaluateExpression\s*=)/.test(updated);
    if (!hasEvalDefinition) {
      insertAtTop(`function evaluateExpression(expression) {\n  return questitSafeEvaluate(expression);\n}\n\n`);
    }
  }

  if (!/window\.questitSafeEvaluate/.test(updated)) {
    updated += `\n\nif (typeof window !== 'undefined' && typeof window.questitSafeEvaluate !== 'function') {\n  window.questitSafeEvaluate = questitSafeEvaluate;\n}\n`;
  }

  if (/\bevaluateExpression\s*\(/.test(updated) && !/window\.evaluateExpression/.test(updated)) {
    updated += `\n\nif (typeof window !== 'undefined' && typeof window.evaluateExpression !== 'function') {\n  window.evaluateExpression = questitSafeEvaluate;\n}\n`;
  }

  return updated;
}

function ensureDomTargets(base) {
  const html = base.html || '';
  const js = base.js || '';
  const placeholders = [];

  const ensureId = (identifier) => {
    if (!identifier) return;
    const idPattern = new RegExp(`id=["']${identifier}["']`, 'i');
    if (!idPattern.test(html) && !placeholders.includes(identifier)) {
      placeholders.push(identifier);
    }
  };

  const idCall = /document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)/gi;
  let match = idCall.exec(js);
  while (match) {
    ensureId(match[1]);
    match = idCall.exec(js);
  }

  const queryId = /document\.(?:querySelector|querySelectorAll)\(\s*['"]#([^'"]+)['"]\s*\)/gi;
  match = queryId.exec(js);
  while (match) {
    ensureId(match[1]);
    match = queryId.exec(js);
  }

  if (placeholders.length > 0) {
    const markup = placeholders.map((id) => `<div id="${id}" data-questit-placeholder="true"></div>`).join('\n');
    base.html = `${html}\n${markup}`;
  }
}

function buildResponseEnvelope(intent, repoCode) {
  return {
    html: '',
    css: '',
    js: '',
    title: intent?.title || null,
    description: '',
    instructions: '',
    sourceRepo: repoCode?.repoUrl || null,
    intent
  };
}

function selectContextFiles(files, codeAnalysis) {
  const selected = {};
  const reserveFile = (path) => {
    if (files[path] && !selected[path]) {
      selected[path] = files[path];
    }
  };

  (codeAnalysis.entryPoints || []).forEach(reserveFile);
  (codeAnalysis.components || []).slice(0, 3).forEach(reserveFile);

  Object.keys(files)
    .filter((path) => path.endsWith('.css'))
    .slice(0, 2)
    .forEach(reserveFile);

  Object.keys(files)
    .filter((path) => path.endsWith('.json') || path.endsWith('.md'))
    .slice(0, 1)
    .forEach(reserveFile);

  return selected;
}

async function adaptCodeInternal(userPrompt, intent, repoCode, codeAnalysis, context = {}, apiConfig = {}) {
  const base = buildResponseEnvelope(intent, repoCode);

  const systemPrompt = buildSystemPrompt(userPrompt, codeAnalysis || {}, intent || {});
  const relevantFiles = selectContextFiles(repoCode?.files || {}, codeAnalysis || {});

  let codeContext = '';
  Object.entries(relevantFiles).forEach(([path, content]) => {
    codeContext += `\n\n/* File: ${path} */\n${content}`;
  });

  if (context?.text) {
    codeContext += `\n\n/* User Context */\n${context.text}`;
  }

  const completion = await queryAIModel(systemPrompt, codeContext, {
    response_format: { type: 'json_object' }
  }, apiConfig);
  // Log the raw completion for debugging
  console.log('AI completion received:', typeof completion, completion?.substring?.(0, 200));

  if (typeof completion === 'string' && (completion.trim().startsWith('<') || completion.length < 10)) {
    throw new Error(`AI returned invalid response (might be HTML or error): ${completion.substring(0, 200)}`);
  }

  let parsed;
  try {
    parsed = typeof completion === 'string' ? JSON.parse(completion) : completion;
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Completion:', completion?.substring?.(0, 500));
    throw new Error(`Failed to parse AI response as JSON: ${parseError.message}. Response preview: ${String(completion).substring(0, 200)}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`AI returned invalid JSON structure: ${JSON.stringify(parsed).substring(0, 200)}`);
  }

  if (!parsed.html && !parsed.css && !parsed.js) {
    throw new Error(`AI response missing required fields. Got: ${Object.keys(parsed).join(', ')}`);
  }

  base.html = parsed.html || '';
  base.css = parsed.css || '';
  base.js = parsed.js || '';
  base.description = parsed.description || '';
  base.instructions = parsed.instructions || '';
  base.js = injectSafeEvaluationHelper(base.js);
  ensureDomTargets(base);

  // Static security scan with auto-repair attempts
  let scan = staticScan(base);
  base.scanIssues = scan.issues;
  if (scan.critical) {
    console.warn('Security scan failed. Attempting auto-repair...', scan.issues);
    const maxAttempts = 2;
    let attempt = 0;
    let lastIssues = scan.issues;
    while (attempt < maxAttempts) {
      attempt += 1;
      const repairSystemPrompt = buildRepairPrompt(userPrompt, lastIssues, {
        html: base.html, css: base.css, js: base.js
      });
      const repairInput = 'Please return corrected code as JSON (html, css, js, description, instructions).';
      const repaired = await queryAIModel(repairSystemPrompt, repairInput, {
        response_format: { type: 'json_object' }
      }, apiConfig);
      let repairedParsed;
      try {
        repairedParsed = typeof repaired === 'string' ? JSON.parse(repaired) : repaired;
      } catch (parseErr) {
        console.warn('Repair parse error', parseErr);
        continue;
      }
      base.html = repairedParsed.html || '';
      base.css = repairedParsed.css || '';
      base.js = repairedParsed.js || '';
      base.description = repairedParsed.description || base.description || '';
      base.instructions = repairedParsed.instructions || base.instructions || '';
      base.js = injectSafeEvaluationHelper(base.js);
      ensureDomTargets(base);
      scan = staticScan(base);
      base.scanIssues = scan.issues;
      if (!scan.critical) {
        console.info(`Auto-repair succeeded on attempt ${attempt}.`);
        break;
      }
      lastIssues = scan.issues;
      console.warn(`Auto-repair attempt ${attempt} failed. Issues remain.`, lastIssues);
    }
    if (scan.critical) {
      const criticalIssues = scan.issues.filter(i => i.severity === 'critical');
      const issueDetails = criticalIssues.map(i => `${i.file}: ${i.message} (${i.id})`).join('; ');
      throw createToolError(`Generated code failed security scan after ${maxAttempts} repair attempts: ${issueDetails}`, { context: { issues: scan.issues, attempts: maxAttempts } });
    }
  }

  if (!base.js.includes('questit:tool-error')) {
    base.js += `\n\n// Ensure errors are surfaced\nconst questitNotifyError = (message, stack = null) => {\n  window.dispatchEvent(new CustomEvent('questit:tool-error', { detail: { message, stack } }));\n};`;
  }

  if (!base.js.includes('window.runSelfCheck') && !base.js.includes('runSelfCheck')) {
    base.js += `\n\n// Fallback self-check function\nif (typeof window.runSelfCheck !== 'function') {\n  window.runSelfCheck = async () => {\n    try {\n      // Basic validation: check if main elements exist\n      const hasContent = document.body && document.body.children.length > 0;\n      return { pass: hasContent, details: { message: hasContent ? 'Basic structure validated' : 'No content found' } };\n    } catch (e) {\n      return { pass: false, details: { message: e?.message || 'Self-check failed', stack: e?.stack } };\n    }\n  };\n}`;
  }

  return base;
}

export async function adaptCode(userPrompt, intent, repoCode, codeAnalysis, context = {}, apiConfig = {}) {
  try {
    return await adaptCodeInternal(userPrompt, intent, repoCode, codeAnalysis, context, apiConfig);
  } catch (error) {
    const errorMessage = error?.message || 'Unknown error';
    const errorDetails = error?.cause ? ` (${error.cause?.message || error.cause})` : '';
    console.error('Code adaptation error:', error);
    throw createToolError(`Failed to adapt code to your request: ${errorMessage}${errorDetails}`, { cause: error });
  }
}

export default {
  adaptCode
};

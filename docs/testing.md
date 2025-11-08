# Testing Guide

## Quick Test

Run the E2E test suite:

```bash
npm test
# or
node test/e2e-test.js
```

This tests:
- ✅ Scope gate (allows simple, rejects complex)
- ✅ API endpoints (AI, GitHub, Package)
- ✅ Supabase connection

## Browser Testing

### Option 1: Use Test HTML

1. **Serve from project root** (required for ES module imports to work):
   ```bash
   # Using Python (from project root)
   python3 -m http.server 8000
   
   # Or using Node
   npx serve .
   ```

2. **Open** http://localhost:8000/public/test.html

   **Note:** The test file imports modules from `../src/`, so you must serve from the project root, not just the `public/` folder. If you see import errors, make sure you're accessing `/public/test.html` (not `/test.html`) when serving from the root.

3. **Test flow:**
   - Enter a prompt (e.g., "Create a simple calculator")
   - Click "Generate Tool"
   - Wait for tool to render (30-60 seconds)
   - Click "Publish Tool"
   - Visit the returned subdomain URL
   - Local harness defaults to staging endpoints; override with `?apiBase=https://questit.cc/api` to test production publishing.

### Auto-Repair on Security Failures

If generation fails with a message like “Generated code failed security scan”, the system will automatically:
- Re-prompt the model with the exact issues (e.g., eval/new Function usage)
- Ask for corrected JSON output
- Retry up to 2 times before surfacing the error

Notes:
- The security policy is strict; `eval()` and `new Function()` are never allowed.
- Error messages will include the specific issue(s) and number of attempts.

### Option 2: Integrate in Your App

```javascript
import Questit from './src/index.js';
import { publishTool } from './src/core/publish.js';

const questit = new Questit({
  endpoint: 'https://questit.cc/api/ai/proxy'
});

// Generate tool
const container = await questit.process(
  "Create a simple calculator",
  {},
  'render'
);
document.body.appendChild(container);

// Publish tool
const result = await publishTool(questit.currentTool);
console.log('Published at:', `https://${result.name}.questit.cc/`);
```

## Testing Publish Flow

1. **Generate a tool** (see above)

2. **Publish it:**
   ```javascript
   const result = await publishTool(questit.currentTool);
   // Returns: { name: 'tool-xyz', namespace: '...' }
   ```

3. **Access via subdomain:**
   - Visit: `https://{result.name}.questit.cc/`
   - Should show your tool's HTML

4. **Verify in Cloudflare:**
   - Dashboard → Workers & Pages → Dispatch Namespaces
   - Check `questit-dispatch-prod` namespace
   - Should see your user worker listed

## Testing Self-Test Reporting

1. **Generate a tool** with `runSelfCheck()` function

2. **Self-test runs automatically** after render

3. **Check Supabase:**
   ```sql
   SELECT * FROM tool_selftest_results 
   ORDER BY run_at DESC 
   LIMIT 10;
   ```

## Testing Rate Limiting

1. **Make rapid requests** to dispatch worker:
   ```bash
   for i in {1..150}; do
     curl -I https://demo.questit.cc/
   done
   ```

2. **Should get 429** after ~120 requests (rate limit)

## Testing Error Handling

1. **Trigger an error:**
   ```javascript
   // In browser console after tool renders
   window.dispatchEvent(new CustomEvent('questit:tool-error', {
     detail: { message: 'Test error', stack: 'test stack' }
   }));
   ```

2. **Verify error banner** appears in tool container

3. **Check Sentry** (if configured) for error event

## Testing Scope Gate

```javascript
import { scopeGateRequest } from './src/ai/scope-gate.js';

// Should allow
const simple = scopeGateRequest('Create a calculator');
console.log(simple.decision); // 'allow'

// Should reject/refine
const complex = scopeGateRequest('Build a full-stack app with database, auth, payments, video transcoding, PDF processing');
console.log(complex.decision); // 'reject' or 'refine'
```

## Testing Static Security Scan

The scan runs automatically during code adaptation. To test:

1. **Generate a tool** that would trigger a scan failure
2. **Check** that `eval()` or `new Function()` usage is blocked
3. **Verify** error message mentions security scan

## Manual API Testing

```bash
# AI Proxy
curl -X POST https://questit.cc/api/ai/proxy \
  -H "Content-Type: application/json" \
  -d '{"system":"test","input":"hello","options":{}}'

# GitHub Proxy
curl https://questit.cc/api/github/cloudflare/workers-sdk/main/README.md

# Package
curl -X POST https://questit.cc/api/package \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","html":"<p>test</p>","css":"","js":""}'

# Publish (requires valid tool JSON)
curl -X POST https://questit.cc/api/tools/publish \
  -H "Content-Type: application/json" \
  -d @tool.json

# Self-test Report
curl -X POST https://questit.cc/api/selftest/report \
  -H "Content-Type: application/json" \
  -d '{"instance_id":"00000000-0000-0000-0000-000000000000","pass":true,"details":{}}'
```

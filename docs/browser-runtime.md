# Browser Runtime Helpers

Questit now provides a lightweight runtime inside every rendered tool so generated code can adopt richer, stateful behaviour without extra build tooling. This page outlines the available APIs and recommended usage patterns.

## window.questit.kit

The helper kit is injected automatically before a tool executes and exposes:

- `events` – publish/subscribe bus for intra-tool communication.
  ```js
  const kit = window.questit?.kit;
  const stop = kit?.events.on('refresh', () => loadData());
  kit?.events.emit('refresh');
  ```
- `safeFetch(url, options?, { timeoutMs?, retries?, retryDelayMs?, retryOn? })` – wrapper around `fetch` with timeout + retry safeguards.
- `storage.local` / `storage.session` – JSON-safe read/write helpers backed by localStorage/sessionStorage.
- `publish(event, payload)` – broadcast custom events and capture them in the kit history.
- `history()` – read the most recent published event payloads (capped to 64 entries).
- `ui` – shadcn-aligned helpers for markup generation.
  - `ui.classes` / `ui.snippets` expose ready-made class names and HTML fragments (`questit-ui-button`, `questit-ui-card`, `questit-ui-input`, etc.).
  - `ui.templates.button(label, options)` and friends return styled HTML strings you can inject directly when building dynamic interfaces.

Always guard access with optional chaining (`window.questit?.kit`) so the tool still works when embedded outside the Questit shell.

## window.questit.runtime

The runtime tracks every mounted tool and offers integration points:

- `listTools()` – array of tool IDs currently rendered.
- `getToolState(toolId)` – snapshot of metadata, container element, and error state.
- `runSelfTest(toolId)` – trigger the tool’s `runSelfCheck` handler.
- `resetTool(toolId)` – re-executes the tool bundle, dispatching a `questit:tool-reset` event.
- `disposeTool(toolId)` – unmounts and cleans up listeners for the tool.
- `kitHistory()` – convenience alias of `window.questit.kit.history()`.

Example:

```js
const runtime = window.questit?.runtime;
const [toolId] = runtime?.listTools() ?? [];
runtime?.resetTool(toolId);
```

The runtime also automatically assigns a non-enumerable `questitUnmount()` method to each container element, enabling manual cleanup when embedding via custom mount points.

## Best Practices

- Assume pure browser execution; avoid Node-only APIs or server-based helpers unless explicitly provided.
- Prefer the provided `questit-ui-*` classes or `kit.ui.templates` helpers so the tool matches the workbench’s shadcn design.
- Wrap asynchronous work in `try/catch` and forward errors with `window.dispatchEvent(new CustomEvent('questit:tool-error', { detail }))`.
- Keep DOM queries defensive (`document.querySelector(...) ||` fallback) so reruns after `resetTool()` do not crash.
- Reuse the event bus for polling, cross-component coordination, or bridging to external widgets instead of global variables.
- Use `safeFetch` when hitting external APIs to inherit timeouts and retries automatically.

Refer to `src/delivery/browser-kit.js` and `src/delivery/render-handler.js` for the authoritative implementation details.

## Verifying Styling

- In `public/test.html`, call `window.questit.kit.ui.templates.button('Test')` to inspect the rendered button inside a generated tool.
- Ensure custom HTML uses the `questit-ui-*` classes; mismatches will stand out immediately against the shadcn base theme.
- When debugging, toggle the questit debug panel and confirm the tool inherits the current color theme (light/dark/base hue).

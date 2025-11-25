# Preview Shell Spec

Questit previews should look and feel identical everywhere (web workbench, template dialogs, saved tool players, mobile WebViews, etc.). The preview shell wraps arbitrary HTML/CSS/JS bundles with a consistent canvas, toolbar, and typography so users always see the same chrome regardless of where the tool was generated.

## Visual Principles

- **Document canvas:** neutral background with a soft gradient halo and rounded 32px outer corners.
- **Toolbar:** pill-shaped glass surface containing the tool title/subtitle on the left and a status chip (e.g., “Draft”, “Synced”) on the right.
- **Canvas:** white/dark card with 24px padding, 24px radius, subtle inner border, and the bundle content inside. Width caps at 960px but shrinks responsively.
- **Typography:** Inter / Zalando Sans stack for all shell elements; bundle content inherits the same stack unless overridden.
- **Status chip:** accent colored border + translucent fill that adapts to the current accent color.
- **Footer note (optional):** 12px muted text for hints (“Simulated data”, “Memory cleared”, etc.).

## Implementation Notes

- The helper lives in `packages/toolkit/src/previewShell.ts` and exports `buildPreviewShell(bundle, options)`.
- `bundle` accepts `{ html, css, js }` strings from the generator or saved templates.
- `options` support:
  - `accentHex` – hex color used for chip + focus states (defaults to emerald).
  - `mode` – `'light' | 'dark'`; switches background, card, and text colors.
  - `title`, `subtitle`, `statusLabel`, `footerNote` – simple strings escaped for safety.
- The HTML document injects base CSS (fonts, layout, toolbar, canvas) followed by the user CSS and JS inside guarded blocks (try/catch) so runtime errors don’t crash the shell.
- All tool previews on web + mobile should consume this helper (via `@questit/toolkit/previewShell`) to ensure parity.


# Questit Mobile App Status (November 2025)

This note captures the current functionality of the Expo client in `apps/mobile`, the shared modules it depends on, and the near-term roadmap for feature completeness.

---

## 1. Overview

- Built with Expo SDK 54 (React Native 0.81). Navigation uses `@react-navigation/native` with a tabs + stack combo.
- Core tabs:
  - **Create** – Prompt-based tool generator backed by the shared `generateTool` helper. Shows quick prompts, native controls, and an inline preview powered by WebView.
  - **Tools** – Lists the user’s saved tools from Supabase (`user_tools` table) with share-link shortcuts. Handles unauthenticated/disabled states cleanly.
  - **Templates** – Mirrors the web catalog with Supabase-backed collections/fallback data, filters, and search.
- **Profile** – Email/password auth (Supabase) reused from the web app (sign-in/out, theme selection coming next).
- Shared packages:
  - `@questit/toolkit/templates` now exports data, normalisers, and TS definitions for both web + mobile.
  - `@questit/toolkit/generateTool` holds the AI prompt orchestration so all clients call the same API.
  - `packages/config` supplies eslint/tailwind/tsconfig presets for consistent tooling.

---

## 2. Current Capabilities

### Create Tab
- Accepts free-form prompts or chips.
- Calls `generateTool` (AI proxy) via `useGenerateTool` hook. Handles loading/error states and iteration (sends previous bundle back for refinements).
- Renders returned HTML/CSS/JS inside a themed card so it fits the native interaction window. “Open full builder” deep-links to questit.cc for advanced editing.
- Adds light motion cues (button pulse during generation, preview fade-in) and emoji-colored quick prompts mirroring the web inspiration chips.

### Tools Tab
- Fetches `user_tools` entries for the signed-in user (Supabase row-based).
- Shows empty-state messaging when Supabase isn’t configured or user isn’t authenticated.
- Provides share-link buttons (opens `https://questit.cc/tools/<slug>`).

### Templates Tab
- Uses React Query + Supabase to pull live template collections; falls back to the static dataset if absent.
- Supports category filters + search, reusing toolkit helpers (`flattenTemplates`, `templateCategorySlug`).
- Tapping any template pushes the detail screen; preview screen loads the bundle in a WebView so the experience aligns with the web viewer.

-### Profile Tab
- Email + password auth flow (Supabase) with informative states when env vars are missing.
- Surfaces current session email and allows sign-out.
- Includes a theme selector (accent + color mode) persisted via AsyncStorage so mobile can match the user’s web palette, plus a dev-only “Clear onboarding cache” tool for debugging.

### Onboarding
- First-launch experience mirrors the landing hero (value props, CTA chips) and can deep-link into Create or Templates. Implemented with shared RN primitives from `@questit/ui/native`.

### Shared Utilities
- `apps/mobile/src/lib/env.ts` reads `.env` + Expo extra fields for Supabase, AI proxy, template CDN.
- `apps/mobile/src/lib/supabase.ts` lazy-initialises the client and exposes `hasSupabaseConfig`.
- React Query powers all remote interactions (`QueryClient` lives in `src/App.tsx`).

---

## 3. Known Gaps & Behaviour Notes

- **Persistence:** Newly generated bundles aren’t saved back to Supabase yet; Tools tab is read-only.
- **Publishing:** No mobile flow for publishing/remixing tools; CTA still deep-links to the web workbench.
- **Auth:** Profile tab covers email/password, but Create/Tools tabs don’t surface login prompts inline (only empty-state hints).
- **Rendering:** Tool output is still HTML in a WebView despite themed wrapper; native schema renderer still todo.
- **Component parity:** Shared RN primitives (Surface, PillButton, SectionTitle, Chip) exist, but most web components (dialogs, sliders, goal strips) still need native equivalents for full parity.
- **Testing:** No automated tests (unit or Detox) exist yet; manual QA via Expo Go.
- **Device features:** Memory adapters, local storage bridges, and offline caching aren’t wired into the mobile runtime yet.
- **Standalone run vs publish:** On web, `/my-tools/:id/play` lets a signed-in creator run any saved tool privately. Publishing requires the Cloudflare worker endpoint (`VITE_PUBLISH_API_BASE`) before a `/tools/<slug>` public link is issued.

---

## 4. Next Steps (Prioritised)

1. **Save flow for generated bundles**
   - Add “Save to Questit” action after generation.
   - Call Supabase `user_tools` insert, update Tools tab cache, allow deletion.
2. **Publish & share from mobile**
   - Hook into the existing publish worker so users can push a tool live without leaving the app.
   - Show passphrase/private settings consistent with the web.
3. **Template schema / native renderer**
   - Extend generator to emit structured JSON.
   - Build a renderer in `packages/ui` to display key widgets natively (cards, lists, forms) for better performance/accessibility.
4. **Memory + runtime helpers**
   - Port the Questit memory API to mobile (using `AsyncStorage`).
   - Inject adapters into the WebView so templates behave the same across platforms.
5. **Auth polish**
   - Inline prompts when actions require login (e.g., Save, Publish).
   - Add profile preferences (theme, default model) synced with Supabase.
6. **Testing & release tooling**
   - Add Jest/Vitest coverage for hooks + shared utilities.
   - Introduce Detox or Maestro smoke tests for Create → Save → Publish.
   - Document EAS build instructions (profiles, credentials).

Use this as the working status sheet; update as we ship each milestone.

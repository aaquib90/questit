# Questit Design Refresh Blueprint

Future-facing notes that capture the agreed visual direction and interaction updates for the landing experience, prompt generation flow, and workbench. Treat this as the source of truth when planning UI work or briefing designers.

## 1. Core Principles

- **Calm productivity aesthetic** – wide negative space, light neutral surfaces, soft shadows, and rounded geometry; rely on a single accent hue drawn from the shadcn palette (emerald or sky).
- **Minimal but confident type system** – Zalando Sans for all UI copy (logo keeps Rubik 80s Fade); large left-aligned headlines paired with muted supportive copy and tight letter-spacing inspired by the references without duplicating them.
- **Iconography and illustration** – monochrome, line-based icons with occasional accent fills; use illustrations sparingly as focal points in hero or onboarding contexts.
- **Action hierarchy** – primary CTAs in the accent color, secondary buttons in neutral outlines. Keep tertiary controls tucked into contextual menus to preserve a clean layout.
- **CTA geometry** – all touch-first actions adopt the pill button shape; primary/toggled states rely on the full accent (`variant="default"`) while neutral options use `variant="outline"` to guarantee accessible contrast across light and dark shells.
- **Light-first experience** – load the interface in light mode by default, with header controls for switching to dark mode or swapping colour palettes (no system-based theme switching).
- **Soft glass header** – use an off-white (or deep navy in dark mode) frosted shell so the pixel logo and navigation remain legible regardless of the underlying gradient.
- **State clarity** – slim banners, chips, and subtle badges to communicate sync, status, or complexity without modal interruptions.

## 2. Landing Page Objectives

### Layout and Messaging
- Hero: headline + subhead, dual CTAs (“Start creating” primary, “See templates” secondary), and a floating workbench mock to demonstrate output.
- Introduce a credibility strip under the hero (trusted-by logos or a single stat such as “10k tools shipped this month”) to reinforce momentum.
- Present value propositions in two tiers:
  - Tier 1 cards: “Create”, “Publish”, “Iterate” – lightly tinted backgrounds, rounded corners, line icons, concise copy.
  - Tier 2 ticker: horizontal carousel or pill list highlighting recent template drops or feature releases.

### Conversion Catalysts
- Curated “Try a template” section – chips styled like Notion suggestion pills; clicking pre-fills the prompt workflow.
- Contextual testimonials or metrics embedded within cards instead of a standalone wall of text.
- Closing block: gradient halo container with a single CTA and concise reassurance copy; footer trimmed to essentials (Docs, GitHub, Pricing, Status).

## 3. Prompt Generation Flow

### Guided Intake
- Restructure into a two-step panel:
  1. Use-case selection chips (Dashboard, Automations, Form, etc.) with icons and helper text; multiple selections allowed.
  2. Dynamic prompt text area that adapts placeholder examples based on selections and shows token/complexity hints beneath.
- Add a “goal summary” strip above the editor summarizing detected use case, predicted complexity, and toggle buttons for add-ons (auth, persistence, share link).

### Controls and Feedback
- Introduce a collapsible “Advanced controls” drawer for model selection, scope limits, and output format preferences. Each control should have plain-language microcopy explaining impact.
- Inline validation and guidance: display real-time scope gate feedback (e.g., “Within limits” / “May exceed size limits”) using subtle colored chips instead of pop-ups.
- The generate CTA becomes a full-width accent button anchored to the bottom edge of the panel, with supportive text for best practices.

## 4. Workbench Experience

### Information Architecture
- Adopt a three-column layout:
  - **Left rail** – session history, saved prompts, navigation (icons + labels).
  - **Center canvas** – prompt timeline (stacked cards with timestamps and status badges) above the editable prompt composer.
  - **Right inspector** – live preview tabs (Render / Code / Self-test) and contextual settings.
- Transform the prompt timeline into interactive cards; selecting one opens a side drawer with AI response diffs and iteration notes.

### Interaction Enhancements
- Preview pane: bordered “document canvas” with top tabs; embed the debug panel as a slide-up bottom sheet triggered by a persistent “⚙ Debug” chip.
- Standardize action buttons (Generate, Retry, Share, Publish) with shadcn primary/secondary tokens; move lesser-used actions into a kebab menu.
- Supabase sync indicator: slim banner below the header showing sync status (green check for synced, amber outline for pending).
- Keep the inspector focused on tool context (preview, history, settings) while global palette + light/dark toggles live in the header so the preference applies across every view instantly.

## 5. Implementation Notes

- Reuse shadcn primitives wherever possible; extend via theme tokens instead of bespoke CSS to keep light/dark parity.
- Define shared tokens for accent colors, card shadows, and chip styles to guarantee consistency across landing, prompt flow, and workbench.
- Document component responsibilities in Storybook (or equivalent) before coding complex interactions, especially the prompt timeline cards and inspector tabs.
- Validate accessibility: maintain 4.5:1 contrast for critical copy, ensure keyboard focus rings on chips/buttons, and verify that new banners or drawers announce via ARIA live regions.

## 6. Next Steps Checklist

1. Produce quick wireframes for landing hero, prompt flow panels, and workbench layout to confirm composition.
2. Update design tokens (Tailwind/shadcn configs) with the chosen accent palette and spacing adjustments.
3. Prototype prompt timeline cards + inspector tabs to test interaction flow before full implementation.
4. Align marketing copy and product messaging with the new structure prior to development handoff.
5. Schedule a review loop after initial implementation to ensure the calm productivity principle remains intact across breakpoints.

Keep this document updated as design decisions evolve; append dated changelog entries if significant adjustments are made.

## 7. Templates Section Roadmap

### Purpose & Positioning
- Act as the “shortcut shelf” for non-technical users who prefer ready-made starting points over writing prompts.
- Lives as a top-level navigation tab (`Templates`) alongside Workbench, My Tools, and Creator Portal; logo tap also returns to Workbench.
- Language focus: plain, benefit-led descriptions (“Weekly budget tracker”) instead of feature jargon; reinforce that every template is editable in the workbench.

### Experience Pillars
- **Warm welcome strip** – hero container with a single sentence (“Pick a starting point and make it yours”) and a primary CTA that opens the Template of the Day.
- **Curated collections** – group templates into 4–6 themed rows (Everyday Organisers, Family & Home, Small Business, Personal Wellbeing, Teams & Projects, Community Ideas). Each row shows 3 cards on desktop, 1.2 cards on mobile with horizontal scroll.
- **Template cards** – large touch-friendly cards featuring:
  - friendly icon/illustration + title + 1-line explanation.
  - “Works best for” chip (e.g., “On the go”, “Shared with family”).
  - Primary action: `Use this template` ⇒ navigates to Workbench with prefilled prompt + metadata.
  - Secondary link: `Preview` opens a lightweight modal/side panel with a read-only iframe.
- **Confidence cues** – badges like “Most popular”, “New”, “Recently updated”, plus average remix count; keep numbers simple (“1.2k people saved this”).
- **Assistive search** – sticky filter bar with keyword search, dropdown category picker, and toggle for “Phone-friendly only”.
- **Learning moments** – inline tips surfaced after a user previews or applies a template; e.g., toast “Want to add reminders? Ask Questit in one sentence.”

### Cross-Surface Integration
- Selecting a template launches the Workbench with:
  - composer prefilled with the template prompt.
  - timeline seeded with a “Template applied” card including summary and preview screenshot.
  - inspector auto-switching to a “Quick tweaks” tab listing common follow-up prompts.
- Workbench header displays the active template name until the user edits the prompt; offer a `Save as new template` button for creators.
- My Tools list gains a `Template source` pill when a saved tool originated from Templates; clicking navigates back to that template’s detail modal.

### Implementation Steps
1. **Information architecture** – extend `VIEW_TABS` with `templates`, add route skeleton, and ensure deep links `/templates/:slug` open detail view.
2. **Data model** – define a `templates.json` (or Supabase table) with fields: `id`, `title`, `summary`, `prompt`, `category`, `audience`, `tags`, `popularityScore`, `previewHtml`, `previewCss`, `previewJs`, `updatedAt`.
3. **UI scaffolding** – build shadcn-based primitives:
   - `TemplateCard` (handles badges and responsive layout).
   - `TemplateCarousel` (row-level scroll + pagination dots).
   - `TemplateDetailDialog` (modal with tabs: Overview, Sample interactions, Quick tweaks).
4. **Workbench handoff** – add a `loadTemplate` helper that accepts a template payload, seeds composer/timeline, and scrolls to the preview.
5. **Search & filters** – integrate client-side fuzzy search (Fuse.js) for now; expose filter state via URL query (`?category=family&phone-first=true`) for shareable views.
6. **Accessibility & performance** – lazy-load previews (use LQIP thumbnails), ensure keyboard navigation for carousel (arrow keys, focus outlines), and provide aria-live updates when filters change.
7. **Success metrics** – log events: template viewed, preview opened, applied to workbench, saved, and published; feed into analytics dashboard for iteration.

### Copy & Tone Cheatsheet
- Replace “Generate” with “Make it mine”.
- Use conversational helper text: “Great for planning weekly meals” instead of “Meal planner template”.
- Buttons: `Use this template`, `See how it looks`, `Start fresh`.

### Launch Checklist
1. Populate at least 12 templates with varied complexity and audiences.
2. Record GIF/hero visuals for template rows (optional but helpful).
3. QA on mobile breakpoints (iPhone SE, iPhone 14 Pro Max) and desktop (1024px, 1440px).
4. Update docs and marketing with the new tab + onboarding copy.
5. Circulate an internal walkthrough video showing the template -> workbench flow for support and marketing teams.

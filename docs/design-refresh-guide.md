# Questit Design Refresh Blueprint

Future-facing notes that capture the agreed visual direction and interaction updates for the landing experience, prompt generation flow, and workbench. Treat this as the source of truth when planning UI work or briefing designers.

## 1. Core Principles

- **Calm productivity aesthetic** – wide negative space, light neutral surfaces, soft shadows, and rounded geometry; rely on a single accent hue drawn from the shadcn palette (emerald or sky).
- **Minimal but confident type system** – large left-aligned headlines paired with muted supportive copy; consistent line-height and letter-spacing to echo the Notion-inspired references without duplicating them.
- **Iconography and illustration** – monochrome, line-based icons with occasional accent fills; use illustrations sparingly as focal points in hero or onboarding contexts.
- **Action hierarchy** – primary CTAs in the accent color, secondary buttons in neutral outlines. Keep tertiary controls tucked into contextual menus to preserve a clean layout.
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
- Provide inline theming controls (palette selector, light/dark toggle) within the inspector, surfacing immediate visual feedback in the preview pane.

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


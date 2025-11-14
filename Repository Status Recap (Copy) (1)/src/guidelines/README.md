# Questit Design Import Notes

This folder contains reference assets for the Repository Status design refresh. These files are a source for implementation in `web/`.

Contents:
- `../styles/tokens.css` — canonical token set (CSS variables, surfaces, chips).
- `../components/ui/` — lightweight reference components (Chip, PillTray, Surface, Section).

Guidelines:
- Prefer shadcn primitives and Tailwind classes; extend via CSS variables.
- Light-first experience; add dark parity via the same tokens.
- Header uses a frosted glass look; primary actions use pill geometry.



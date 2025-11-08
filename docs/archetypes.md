# Archetypes and Self-Test Specs

## Converter
- Acceptance:
  - Converts a small sample input deterministically.
  - Shows progress and final output (download or preview).
- Self-test (runSelfCheck):
  - Use a tiny inline sample (no network).
  - Validate output presence and basic format.

## Calculator
- Acceptance: Correct math, locale-safe formatting, unit labels.
- Self-test: 2–3 fixed cases; verify rounding and precision.

## Summarizer (client-only)
- Acceptance: Handles empty input gracefully; provides length controls.
- Self-test: Short text returns non-empty summary; empty input shows guidance.

## Formatter/Validator
- Acceptance: Shows diff/preview; copy/download actions.
- Self-test: Valid sample passes; invalid sample lists errors clearly.

## Data Viewer
- Acceptance: Renders CSV/array safely; pagination if needed.
- Self-test: Renders sample rows; column inference reasonable.


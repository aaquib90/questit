export const archetypePresets = {
  converter: {
    title: 'Converter Tool',
    systemAddendum: 'Prefer simple file or text conversion flows. Ensure clear input/output UI and progress indications. No external network fetches.',
    selfTest: ['Run a small sample conversion', 'Validate output format and size']
  },
  calculator: {
    title: 'Calculator Tool',
    systemAddendum: 'Ensure numeric validation, locale-safe formatting, and unit labels. Provide clear error messages for invalid inputs.',
    selfTest: ['Check 2-3 deterministic cases', 'Verify rounding and precision']
  },
  summarizer: {
    title: 'Summarizer Tool',
    systemAddendum: 'Operate client-side on provided text. Avoid network calls. Provide token/length controls and safety around empty inputs.',
    selfTest: ['Short text input returns non-empty summary', 'Empty input yields friendly guidance']
  },
  formatter: {
    title: 'Formatter/Validator Tool',
    systemAddendum: 'Validate structure and present diff/preview. Provide copy/download buttons. Avoid network calls.',
    selfTest: ['Valid sample passes', 'Invalid sample shows errors clearly']
  },
  viewer: {
    title: 'Data Viewer',
    systemAddendum: 'Render small tables safely with pagination if needed. No network calls. Provide CSV copy/download.',
    selfTest: ['Render sample rows', 'Column inference looks reasonable']
  }
};

export function getArchetypePreset(archetype) {
  return archetypePresets[archetype] || null;
}

export default {
  archetypePresets,
  getArchetypePreset
};



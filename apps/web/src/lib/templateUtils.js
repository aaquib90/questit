export function resolveTemplateDescriptor(template) {
  if (!template) return '';
  const direct = (template.descriptor || template.tagline || '').trim();
  if (direct) return trimDescriptor(direct);
  const sources = [template.summary, template.description, template.prompt];
  const text = sources.map((value) => (value || '').trim()).find(Boolean);
  if (!text) return '';
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  const match = firstSentence.match(/(?:features|with|includes)\s(.+)/i);
  const candidate = match ? match[1] : firstSentence;
  return trimDescriptor(candidate);
}

function trimDescriptor(value) {
  if (!value) return '';
  let descriptor = value.replace(/^[,:;\-\s]+/, '').replace(/\.{3,}$/g, '');
  descriptor = descriptor.replace(/^(?:a|an|the)\s+/i, '').trim();
  if (descriptor.length > 60) {
    descriptor = `${descriptor.slice(0, 57).trim()}…`;
  }
  return descriptor;
}

export function buildVariantTitle(template) {
  if (!template) return 'Untitled Template';
  const baseTitle = (template.title || template.name || 'Untitled Template').trim();
  const descriptor = resolveTemplateDescriptor(template);
  if (!descriptor) return baseTitle;
  const normalizedTitle = baseTitle.toLowerCase();
  if (normalizedTitle.includes(descriptor.toLowerCase())) {
    return baseTitle;
  }
  return `${baseTitle} · ${descriptor}`;
}

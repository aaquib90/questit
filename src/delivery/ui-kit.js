const QUESTIT_UI_STYLES = `
.questit-ui-card {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 8px 24px -12px hsl(var(--foreground) / 0.35);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.questit-ui-card:hover {
  border-color: hsl(var(--ring));
  box-shadow: 0 12px 32px -16px hsl(var(--ring) / 0.45);
}

.questit-ui-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.questit-ui-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: hsl(var(--foreground));
}

.questit-ui-card-description {
  font-size: 0.95rem;
  color: hsl(var(--muted-foreground));
}

.questit-ui-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.questit-ui-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid hsl(var(--border) / 0.6);
}

.questit-ui-button {
  appearance: none;
  background-color: hsl(var(--primary));
  border: 1px solid transparent;
  border-radius: calc(var(--radius) - 2px);
  color: hsl(var(--primary-foreground));
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  gap: 0.5rem;
  line-height: 1.2;
  min-height: 2.25rem;
  padding: 0.6rem 1.1rem;
  transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.questit-ui-button:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.questit-ui-button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.questit-ui-button--secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.questit-ui-button--outline {
  background-color: transparent;
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
}

.questit-ui-button--ghost {
  background-color: transparent;
  color: hsl(var(--foreground));
}

.questit-ui-button--danger {
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.questit-ui-button--sm {
  min-height: 2rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
}

.questit-ui-button--lg {
  min-height: 2.6rem;
  padding: 0.75rem 1.35rem;
  font-size: 1.05rem;
}

.questit-ui-label {
  display: inline-block;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
  color: hsl(var(--foreground));
}

.questit-ui-input,
.questit-ui-textarea,
.questit-ui-select {
  width: 100%;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) - 4px);
  padding: 0.55rem 0.75rem;
  font-size: 0.95rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.questit-ui-input:focus,
.questit-ui-textarea:focus,
.questit-ui-select:focus {
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.25);
  outline: none;
}

.questit-ui-textarea {
  min-height: 6rem;
  resize: vertical;
}

.questit-ui-helper-text {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
}

.questit-ui-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius) - 4px);
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.questit-ui-badge--neutral {
  background-color: hsl(var(--muted) / 0.5);
  color: hsl(var(--foreground));
  border-color: hsl(var(--border) / 0.85);
}

.questit-ui-badge--info {
  background-color: hsl(var(--accent) / 0.9);
  color: hsl(var(--accent-foreground));
  border-color: transparent;
}

.questit-ui-badge--success {
  background-color: hsl(var(--primary) / 0.92);
  color: hsl(var(--primary-foreground));
  border-color: transparent;
}

.questit-ui-badge--danger {
  background-color: hsl(var(--destructive) / 0.9);
  color: hsl(var(--destructive-foreground));
  border-color: transparent;
}

.questit-ui-grid {
  display: grid;
  gap: 1rem;
}

.questit-ui-form-control {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.questit-ui-divider {
  width: 100%;
  border: none;
  border-top: 1px solid hsla(var(--border), 0.75);
  margin: 1.25rem 0;
}

.questit-ui-state-soft {
  background-color: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border) / 0.9);
  color: hsl(var(--muted-foreground));
  border-radius: calc(var(--radius) - 4px);
  padding: 0.75rem;
}
`;

function buildClassList(base, variants = []) {
  const list = [base, ...variants.filter(Boolean)];
  return list.join(' ').trim();
}

function buttonTemplate(label = 'Action', { variant = 'primary', size = 'md', type = 'button' } = {}) {
  const variantClass = variant === 'primary'
    ? null
    : `questit-ui-button--${variant}`;
  const sizeClass = size === 'md' ? null : `questit-ui-button--${size}`;
  const classes = buildClassList('questit-ui-button', [variantClass, sizeClass]);
  const safeLabel = label || 'Action';
  const safeType = ['button', 'submit', 'reset'].includes(type) ? type : 'button';
  return `<button type="${safeType}" class="${classes}">${safeLabel}</button>`;
}

function inputTemplate({
  id,
  label,
  type = 'text',
  placeholder = '',
  helper = ''
} = {}) {
  const inputId = id || `questit-input-${Math.random().toString(36).slice(2, 8)}`;
  const safeType = type || 'text';
  const safePlaceholder = placeholder || '';
  const labelHtml = label ? `<label class="questit-ui-label" for="${inputId}">${label}</label>` : '';
  const helperHtml = helper ? `<p class="questit-ui-helper-text">${helper}</p>` : '';
  return `<div class="questit-ui-form-control">
  ${labelHtml}
  <input id="${inputId}" type="${safeType}" class="questit-ui-input" placeholder="${safePlaceholder}" />
  ${helperHtml}
</div>`;
}

function textareaTemplate({
  id,
  label,
  placeholder = '',
  helper = '',
  rows = 4
} = {}) {
  const textareaId = id || `questit-textarea-${Math.random().toString(36).slice(2, 8)}`;
  const safeRows = Number.isFinite(rows) && rows > 0 ? rows : 4;
  const labelHtml = label ? `<label class="questit-ui-label" for="${textareaId}">${label}</label>` : '';
  const helperHtml = helper ? `<p class="questit-ui-helper-text">${helper}</p>` : '';
  return `<div class="questit-ui-form-control">
  ${labelHtml}
  <textarea id="${textareaId}" class="questit-ui-textarea" placeholder="${placeholder || ''}" rows="${safeRows}"></textarea>
  ${helperHtml}
</div>`;
}

function selectTemplate({
  id,
  label,
  options = [],
  helper = ''
} = {}) {
  const selectId = id || `questit-select-${Math.random().toString(36).slice(2, 8)}`;
  const labelHtml = label ? `<label class="questit-ui-label" for="${selectId}">${label}</label>` : '';
  const helperHtml = helper ? `<p class="questit-ui-helper-text">${helper}</p>` : '';
  const optionHtml = options.length
    ? options.map(({ value, text }) => `<option value="${value}">${text}</option>`).join('\n')
    : '<option value="">Select an option</option>';
  return `<div class="questit-ui-form-control">
  ${labelHtml}
  <select id="${selectId}" class="questit-ui-select">
    ${optionHtml}
  </select>
  ${helperHtml}
</div>`;
}

function badgeTemplate(text = 'Badge', { tone = 'secondary' } = {}) {
  const className = tone === 'secondary' ? 'questit-ui-badge' : `questit-ui-badge questit-ui-badge--${tone}`;
  return `<span class="${className}">${text}</span>`;
}

function cardTemplate({
  title,
  description,
  content = '',
  footer = ''
} = {}) {
  const headerHtml = title || description
    ? `<div class="questit-ui-card-header">
  ${title ? `<h2 class="questit-ui-card-title">${title}</h2>` : ''}
  ${description ? `<p class="questit-ui-card-description">${description}</p>` : ''}
</div>` : '';

  const footerHtml = footer
    ? `<div class="questit-ui-card-footer">${footer}</div>`
    : '';

  return `<section class="questit-ui-card">
  ${headerHtml}
  <div class="questit-ui-card-content">
    ${content}
  </div>
  ${footerHtml}
</section>`;
}

function createUiTemplates() {
  const classes = {
    button: 'questit-ui-button',
    card: 'questit-ui-card',
    cardTitle: 'questit-ui-card-title',
    cardDescription: 'questit-ui-card-description',
    cardContent: 'questit-ui-card-content',
    cardFooter: 'questit-ui-card-footer',
    label: 'questit-ui-label',
    input: 'questit-ui-input',
    textarea: 'questit-ui-textarea',
    select: 'questit-ui-select',
    helperText: 'questit-ui-helper-text',
    badge: 'questit-ui-badge',
    formControl: 'questit-ui-form-control',
    grid: 'questit-ui-grid',
    divider: 'questit-ui-divider',
    stateSoft: 'questit-ui-state-soft'
  };

  const snippets = {
    button: '<button class="questit-ui-button">Submit</button>',
    outlineButton: '<button class="questit-ui-button questit-ui-button--outline">Cancel</button>',
    inputGroup: `<div class="questit-ui-form-control">
  <label class="questit-ui-label" for="field">Field label</label>
  <input id="field" class="questit-ui-input" placeholder="Type here" />
</div>`,
    card: `<section class="questit-ui-card">
  <div class="questit-ui-card-header">
    <h2 class="questit-ui-card-title">Card title</h2>
    <p class="questit-ui-card-description">Card description</p>
  </div>
  <div class="questit-ui-card-content">
    <p>Your content here.</p>
  </div>
</section>`
  };

  return {
    styles: QUESTIT_UI_STYLES,
    classes,
    snippets,
    templates: {
      button: buttonTemplate,
      input: inputTemplate,
      textarea: textareaTemplate,
      select: selectTemplate,
      badge: badgeTemplate,
      card: cardTemplate
    }
  };
}

export {
  QUESTIT_UI_STYLES,
  createUiTemplates
};

export default {
  QUESTIT_UI_STYLES,
  createUiTemplates
};

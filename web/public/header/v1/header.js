// Questit shared header web component (no framework)
// Renders a header that mirrors the main site using CSS variables.

const QH_NS = 'qh';

const BRAND_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 281.25 93.749996" role="img" aria-label="Questit" preserveAspectRatio="xMidYMid meet">
  <defs>
    <clipPath id="qh_a"><rect x="0" y="0" width="185" height="77"/></clipPath>
    <clipPath id="qh_b"><path d="M21 29h67v64.5H21Z"/></clipPath>
    <clipPath id="qh_c"><path d="M.543 56H66v8H.543Z"/></clipPath>
    <clipPath id="qh_d"><path d="M4 1h8v63.5H4Z"/></clipPath>
    <clipPath id="qh_e"><rect x="0" y="0" width="67" height="65"/></clipPath>
    <clipPath id="qh_f"><path d="M1 1h65.539v8H1Z"/></clipPath>
    <clipPath id="qh_g"><path d="M56 0h8v63.672h-8Z"/></clipPath>
    <clipPath id="qh_h"><rect x="0" y="0" width="67" height="64"/></clipPath>
  </defs>
  <g transform="matrix(1 0 0 1 45 9)" clip-path="url(#qh_a)" fill="currentColor">
    <g transform="translate(.960893 55.048829)"><path d="M5.766-3.875c-2.918-3.196-4.375-7.102-4.375-11.719 0-4.613 1.457-8.508 4.375-11.688 2.914-3.176 6.617-4.766 11.11-4.766 4.125 0 7.52 1.48 10.187 4.437h.125v-3.516h10.625v46.906H27.062V-2.97C24.395-.383 21 .906 16.875.906c-4.492 0-8.195-1.594-11.11-4.781Zm9.047-16.969c-1.336 1.356-2 3.106-2 5.25 0 2.149.695 3.907 2.094 5.282 1.395 1.375 3.125 2.062 5.188 2.062 2.02 0 3.727-.688 5.125-2.063 1.394-1.375 2.094-3.133 2.094-5.281 0-2.102-.68-3.844-2.031-5.219-1.355-1.375-3.086-2.063-5.188-2.063-2.187 0-3.949.68-5.281 2.032Z"/></g>
    <g transform="translate(37.242538 55.048829)"><path d="M13.781-31.125v14.797c0 3.074.461 5.262 1.39 6.563.926 1.293 2.504 1.938 4.734 1.938 2.227 0 3.805-.645 4.734-1.938.926-1.3 1.39-3.488 1.39-6.563v-14.797h10.75v17.406c0 5.18-1.352 8.914-4.047 11.203-2.688 2.281-6.965 3.422-12.828 3.422s-10.148-1.14-12.844-3.422c-2.688-2.29-4.032-6.024-4.032-11.203v-17.406Z"/></g>
    <g transform="translate(71.885983 55.048829)"><path d="M35.141-14.078H12.563c0 2.187.707 3.809 2.125 4.86 1.414 1.054 2.953 1.578 4.61 1.578 1.738 0 3.113-.234 4.125-.703 1.008-.469 2.165-1.39 3.47-2.765l7.765 3.89C31.414-1.8 26.035.906 18.516.906c-4.7 0-8.73-1.602-12.094-4.812C3.066-7.125 1.39-11 1.39-15.531c0-4.531 1.676-8.414 5.032-11.656 3.363-3.239 7.395-4.86 12.093-4.86 4.926 0 8.938 1.43 12.032 4.282 3.101 2.856 4.656 6.934 4.656 12.235 0 .73-.023 1.214-.062 1.453ZM12.86-20.031h11.844c-.25-1.614-.891-2.852-1.922-3.719-1.031-.875-2.355-1.313-3.969-1.313-1.782 0-3.2.469-4.25 1.406-1.055.93-1.621 2.137-1.703 3.625Z"/></g>
    <g transform="translate(103.313692 55.048829)"><path d="M17.172-32.047c1.781 0 3.54.203 5.281.61 1.739.406 3.035.812 3.89 1.218l1.266.61-3.516 7.031c-2.43-1.29-4.734-1.937-6.922-1.937-1.211 0-2.07.133-2.578.39-.5.262-.75.758-.75 1.484 0 .168.016.336.047.5.039.156.124.309.25.453.125.137.234.258.328.36.101.094.273.204.515.328.25.125.441.219.578.281.145.055.379.141.703.266.32.125.563.219.719.282.164.054.441.14.828.265.383.125.676.211.875.25 1.258.367 2.352.773 3.281 1.218.926.438 1.906 1.043 2.938 1.813 1.031.773 1.828 1.746 2.39 2.922.57 1.168.859 2.5.859 4 0 7.074-4.918 10.61-14.75 10.61-2.219 0-4.336-.344-6.344-1.031-2-.688-3.445-1.375-4.328-2.063l-1.343-1.094 4.375-7.344c.321.281.742.617 1.266 1 .532.387 1.484.914 2.86 1.578 1.375.668 2.566 1 3.578 1 2.227 0 3.344-.742 3.344-2.234 0-.688-.289-1.223-.859-1.61-.563-.383-1.523-.816-2.875-1.297-1.355-.488-2.418-.937-3.187-1.344-1.938-1.008-3.477-2.149-4.61-3.422C4.145-18.234 3.578-19.926 3.578-22.031c0-3.156 1.223-5.614 3.672-7.375 2.446-1.758 5.754-2.64 9.922-2.64Z"/></g>
    <g transform="translate(128.006573 55.048829)"><path d="M5.469-31.125v-11.594h10.734v11.594h6.563v8.188h-6.563v9.89c0 2.875.805 4.312 2.422 4.312.406 0 .832-.078 1.281-.234.445-.164.789-.332 1.031-.5l.36-.234 2.672 8.672c-2.305 1.289-4.934 1.937-7.89 1.937-2.023 0-3.762-.355-5.219-1.062-1.46-.707-2.562-1.656-3.312-2.844-.742-1.195-1.273-2.453-1.594-3.766-.324-1.312-.484-2.718-.484-4.218v-11.953h-4.5v-8.188Z"/></g>
    <g transform="translate(146.814053 55.048829)"><path d="M4.672-48.484c1.25-1.258 2.742-1.89 4.484-1.89 1.739 0 3.235.633 4.485 1.89 1.258 1.25 1.89 2.746 1.89 4.484 0 1.742-.633 3.242-1.89 4.5-1.25 1.25-2.746 1.875-4.485 1.875-1.742 0-3.234-.625-4.484-1.875-1.25-1.258-1.875-2.758-1.875-4.5 0-1.742.625-3.238 1.875-4.484Zm-.03 17.36V0h10.75v-31.125Z"/></g>
    <g transform="translate(159.978848 55.048829)"><path d="M5.469-31.125v-11.594h10.734v11.594h6.563v8.188h-6.563v9.89c0 2.875.805 4.312 2.422 4.312.406 0 .832-.078 1.281-.234.445-.164.789-.332 1.031-.5l.36-.234 2.672 8.672c-2.305 1.289-4.934 1.937-7.89 1.937-2.023 0-3.762-.355-5.219-1.062-1.46-.707-2.562-1.656-3.312-2.844-.742-1.195-1.273-2.453-1.594-3.766-.324-1.312-.484-2.718-.484-4.218v-11.953h-4.5v-8.188Z"/></g>
  </g>
  <g clip-path="url(#qh_b)"><g transform="matrix(1 0 0 1 21 29)" clip-path="url(#qh_e)">
    <g clip-path="url(#qh_c)"><path stroke-linecap="butt" stroke-linejoin="miter" transform="matrix(.688167 0 0 .688167 4.181404 56.372848)" fill="none" d="M-.002 4.998h84.435" stroke="currentColor" stroke-width="10"/></g>
    <g clip-path="url(#qh_d)"><path stroke-linecap="butt" stroke-linejoin="miter" transform="matrix(0 .688167 -.688167 0 11.059551 4.444936)" fill="none" d="M.001 5.002h82.465" stroke="currentColor" stroke-width="10"/></g>
  </g></g>
  <g transform="matrix(1 0 0 1 197 0)" clip-path="url(#qh_h)">
    <g clip-path="url(#qh_f)"><path stroke-linecap="butt" stroke-linejoin="miter" transform="matrix(-.688167 0 0 -.688167 63.064223 8.233879)" fill="none" d="M.003 5h84.43" stroke="currentColor" stroke-width="10"/></g>
    <g clip-path="url(#qh_g)"><path stroke-linecap="butt" stroke-linejoin="miter" transform="matrix(0 -.688167 .688167 0 56.186082 60.161791)" fill="none" d="M.002 4.997h82.462" stroke="currentColor" stroke-width="10"/></g>
  </g>
</svg>
`;

const CHEVRON = `<svg aria-hidden="true" class="qh-icon" viewBox="0 0 16 16"><path d="M4.5 6l3.5 4 3.5-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const USER = `<svg aria-hidden="true" class="qh-icon" viewBox="0 0 20 20"><path d="M10 2.5a4 4 0 110 8 4 4 0 010-8zM4.5 16.25a5.5 5.5 0 0111 0V18H4.5v-1.75z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW = `<svg aria-hidden="true" class="qh-icon" viewBox="0 0 20 20"><path d="M11 5.5l4.5 4.5-4.5 4.5M4.5 10h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function html(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ''), '');
}

class QuestitHeader extends HTMLElement {
  static get observedAttributes() {
    return ['active', 'mode', 'theme', 'user', 'login-href', 'workspace-href', 'remix-href'];
  }
  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const active = (this.getAttribute('active') || 'workbench').toLowerCase();
    const mode = (this.getAttribute('mode') || 'LIGHT').toUpperCase();
    const theme = (this.getAttribute('theme') || 'EMERALD').toUpperCase();
    const user = this.getAttribute('user') || '';
    const remixHref = this.getAttribute('remix-href') || 'https://questit.cc';
    const workspaceHref = this.getAttribute('workspace-href') || 'https://questit.cc';
    const loginHref = this.getAttribute('login-href') || 'https://questit.cc/?login=1';
    const mkLink = (id, label) =>
      html`<a class="qh-link${active === id ? ' qh-link--active' : ''}" href="https://questit.cc/#${id}">${label}</a>`;

    this.innerHTML = html`
      <div class="qh-header">
        <div class="qh-brand">
          <div class="qh-logo" aria-label="Questit">${BRAND_LOGO_SVG}</div>
          <p class="qh-subtitle">Shared tool</p>
        </div>
        <nav class="qh-nav" aria-label="Questit site navigation">
          ${mkLink('workbench', 'Workbench')}
          ${mkLink('templates', 'Templates')}
          ${mkLink('my-tools', 'My tools')}
          ${mkLink('docs', 'Docs')}
        </nav>
        <div class="qh-controls">
          <div class="qh-select" aria-label="Color mode"><span>${mode}</span>${CHEVRON}</div>
          <div class="qh-select" aria-label="Theme"><span>${theme}</span>${CHEVRON}</div>
          <div class="qh-auth" data-auth>
            <button class="qh-icon-btn" type="button" aria-label="Questit account">${USER}</button>
            <a class="qh-icon-btn qh-icon-btn--outline" href="${loginHref}" aria-label="Log in to Questit">${ARROW}</a>
          </div>
        </div>
      </div>
    `;

    // If signed-in label is provided, reflect via title on account icon
    const authRoot = this.querySelector('[data-auth]');
    if (authRoot && user) {
      authRoot.title = user;
    }
  }
}

if (!customElements.get('questit-header')) {
  customElements.define('questit-header', QuestitHeader);
}



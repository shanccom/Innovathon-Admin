import { DEMO_USER } from '../data/demoState.js';

export function renderHeader({ title, breadcrumbs = [] }) {
  const breadcrumbHtml = breadcrumbs.map((b, idx) => {
    const isLast = idx === breadcrumbs.length - 1;
    if (isLast) {
      return `<span class="breadcrumb-current">${b.label}</span>`;
    }
    return `
      <a href="${b.path}">${b.label}</a>
      <span class="breadcrumb-separator">/</span>
    `;
  }).join('');

  return `
    <header class="app-header">
      <div class="header-left">
        <div class="header-breadcrumbs">
          ${breadcrumbHtml}
        </div>
      </div>

      <div class="header-right">
        <div class="event-live-pill" title="Evento activo: Innovathon Mollendo 2026">
          <span class="event-live-indicator"></span>
          <span>${DEMO_USER.event}</span>
        </div>

        <div class="demo-account-chip" title="Sesión de demostración">
          <span class="account-dot"></span>
          <span>Comité Organizador</span>
        </div>
      </div>
    </header>
  `;
}

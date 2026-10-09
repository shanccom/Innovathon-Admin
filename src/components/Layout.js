import { icons } from './icons.js';
import { renderSidebar } from './Sidebar.js';
import { renderHeader } from './Header.js';

export function renderLayout({ currentPath, pageTitle, breadcrumbs, contentHtml }) {
  return `
    <!-- Bloqueo y aviso exclusivo para dispositivos móviles/pantallas pequeñas -->
    <div class="desktop-only-gate">
      <div class="desktop-gate-card">
        <div class="desktop-gate-logo">
          <img src="./logo-principal.png" alt="Innovathon Mollendo Logo" onerror="this.src='./logo-light.png'" />
        </div>
        <div class="desktop-gate-icon">
          ${icons.laptop}
        </div>
        <h2 class="desktop-gate-title">Experiencia optimizada para ordenador</h2>
        <p class="desktop-gate-text">
          <strong>Innovathon Manager</strong> está diseñado exclusivamente para su uso en laptop o computadora de escritorio, garantizando la gestión fluida de tablas masivas, asistencias y emisión de certificados.
        </p>
        <div class="desktop-gate-badge">
          <span>Resolución mínima recomendada: 1024px</span>
        </div>
      </div>
    </div>

    <!-- Estructura del panel administrativo -->
    <div class="desktop-app-shell">
      ${renderSidebar(currentPath)}
      <div class="app-main-wrapper">
        ${renderHeader({ title: pageTitle, breadcrumbs })}
        <main class="app-content">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

import { icons } from '../components/icons.js';

export function renderSettings() {
  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Configuración del sistema</h1>
        <p class="page-subtitle">Parámetros del evento, conexiones con Google Workspace y variables operativas.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${icons.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <div class="content-box">
      <div class="empty-state">
        <div class="empty-icon-box">
          ${icons.settings}
        </div>
        <h3 class="empty-title">Módulo de configuración pendiente</h3>
        <p class="empty-desc">
          Esta sección permitirá administrar los IDs de las hojas de cálculo de Google Sheets, IDs de plantillas de certificados en Drive y credenciales de correo electrónico para la organización de Innovathon Mollendo 2026.
        </p>
        <div class="integration-preview-badge">
          ${icons.info}
          <span>Módulo informativo - En preparación para la fase de integración</span>
        </div>
      </div>
    </div>
  `;
}

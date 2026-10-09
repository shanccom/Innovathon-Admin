import { icons } from '../components/icons.js';

export function renderAnnouncements() {
  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Gestión de comunicados</h1>
        <p class="page-subtitle">Prepara comunicados masivos o personalizados para los participantes y supervisa los envíos.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${icons.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Espacios para futuros apartados: Redactar, Destinatarios e Historial -->
    <div class="status-cards-row">
      <div class="status-step-card" style="border-left: 3px solid var(--color-primary-600);">
        <div>
          <div class="status-step-title">Apartado 1</div>
          <div class="status-step-count" style="font-size: 1rem; font-weight: 600;">Redactar comunicado</div>
          <small style="color: var(--text-muted); font-size: 0.75rem;">Plantillas y variables dinámicas</small>
        </div>
      </div>

      <div class="status-step-card" style="border-left: 3px solid var(--color-primary-600);">
        <div>
          <div class="status-step-title">Apartado 2</div>
          <div class="status-step-count" style="font-size: 1rem; font-weight: 600;">Filtro de destinatarios</div>
          <small style="color: var(--text-muted); font-size: 0.75rem;">Por equipo, rol o asistencia</small>
        </div>
      </div>

      <div class="status-step-card" style="border-left: 3px solid var(--color-primary-600);">
        <div>
          <div class="status-step-title">Apartado 3</div>
          <div class="status-step-count" style="font-size: 1rem; font-weight: 600;">Historial de entregas</div>
          <small style="color: var(--text-muted); font-size: 0.75rem;">Logs de envío vía Gmail API</small>
        </div>
      </div>
    </div>

    <!-- Filtros de búsqueda / acciones -->
    <div class="filter-strip">
      <div class="filter-input">
        ${icons.search}
        <input type="text" placeholder="Buscar por asunto o remitente..." disabled />
      </div>
      <button class="btn btn-primary btn-disabled" style="opacity: 0.65;">
        ${icons.send}
        <span>Nuevo comunicado (Pendiente)</span>
      </button>
    </div>

    <!-- Área de tabla y Estado vacío -->
    <div class="content-box">
      <div class="table-container" style="margin-bottom: 1.5rem; opacity: 0.65;">
        <table class="table-mock">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Asunto del Comunicado</th>
              <th>Destinatarios</th>
              <th>Canal</th>
              <th>Estado de Envío</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>Estructura de registro de comunicados</td>
              <td>Todos los participantes</td>
              <td>Gmail API / MailApp</td>
              <td><span class="badge-demo">Pendiente</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state">
        <div class="empty-icon-box">
          ${icons.announcements}
        </div>
        <h3 class="empty-title">Sin comunicados registrados</h3>
        <p class="empty-desc">
          En la siguiente fase se conectará el servicio de mensajería con <strong>Gmail / MailApp</strong> para programar recordatorios, confirmaciones de asistencia y avisos de premiación.
        </p>
        <div class="integration-preview-badge">
          ${icons.info}
          <span>Estado: Módulo listo para configuración de plantillas y backend</span>
        </div>
      </div>
    </div>
  `;
}

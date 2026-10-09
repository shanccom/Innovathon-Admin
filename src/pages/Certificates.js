import { icons } from '../components/icons.js';

export function renderCertificates() {
  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Gestión de certificados</h1>
        <p class="page-subtitle">Supervisa la generación automática, firma digital, recepción y entrega de acreditaciones.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${icons.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Espacios visuales para los futuros estados -->
    <div class="status-cards-row">
      <div class="status-step-card">
        <div class="status-step-icon pending">
          ${icons.clock}
        </div>
        <div>
          <div class="status-step-title">Pendiente de generación</div>
          <div class="status-step-count">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon signing">
          ${icons.penTool}
        </div>
        <div>
          <div class="status-step-title">Pendiente de firma</div>
          <div class="status-step-count">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon signed">
          ${icons.award}
        </div>
        <div>
          <div class="status-step-title">Firmado</div>
          <div class="status-step-count">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon delivered">
          ${icons.mailCheck}
        </div>
        <div>
          <div class="status-step-title">Entregado al participante</div>
          <div class="status-step-count">—</div>
        </div>
      </div>
    </div>

    <!-- Filtros de certificados -->
    <div class="filter-strip">
      <div class="filter-input">
        ${icons.search}
        <input type="text" placeholder="Buscar certificado por nombre o código..." disabled />
      </div>
      <select class="filter-select" disabled>
        <option>Todos los estados</option>
        <option>Pendiente de firma</option>
        <option>Firmados</option>
        <option>Entregados</option>
      </select>
      <button class="btn btn-secondary btn-sm btn-disabled">
        Generar lote (Fase posterior)
      </button>
    </div>

    <!-- Área de tabla y Estado vacío -->
    <div class="content-box">
      <div class="table-container" style="margin-bottom: 1.5rem; opacity: 0.65;">
        <table class="table-mock">
          <thead>
            <tr>
              <th>Código</th>
              <th>Destinatario</th>
              <th>Rol / Categoría</th>
              <th>Estado Documental</th>
              <th>Enlace Drive</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>Estructura de certificados</td>
              <td>Participante / Ponente / Mentor</td>
              <td><span class="badge-demo">Pendiente</span></td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state">
        <div class="empty-icon-box">
          ${icons.fileText}
        </div>
        <h3 class="empty-title">Sin certificados procesados</h3>
        <p class="empty-desc">
          En la siguiente fase se conectará con plantillas en <strong>Google Docs</strong> y carpetas organizadas en <strong>Google Drive</strong> para emitir y firmar certificados en PDF.
        </p>
        <div class="integration-preview-badge">
          ${icons.info}
          <span>Estado: Arquitectura de estados y diseño de módulo preparados</span>
        </div>
      </div>
    </div>
  `;
}

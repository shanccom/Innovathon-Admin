import { icons } from '../components/icons.js';

export function renderAttendance() {
  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Control de asistencia</h1>
        <p class="page-subtitle">Registra la asistencia de los participantes y consulta su historial por sesión.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${icons.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Barra de filtros y búsqueda (Preparada para Fase 2) -->
    <div class="filter-strip">
      <div class="filter-input">
        ${icons.search}
        <input type="text" placeholder="Buscar por DNI o apellidos..." disabled />
      </div>
      <select class="filter-select" disabled>
        <option>Sesión: Jornada 1 - Apertura (Pendiente)</option>
        <option>Sesión: Jornada 2 - Hackathon</option>
        <option>Sesión: Jornada 3 - Clausura</option>
      </select>
      <button class="btn btn-secondary btn-sm btn-disabled" title="Disponible al conectar Google Sheets">
        Filtrar
      </button>
    </div>

    <!-- Área de tabla y Estado vacío -->
    <div class="content-box">
      <div class="table-container" style="margin-bottom: 1.5rem; opacity: 0.65;">
        <table class="table-mock">
          <thead>
            <tr>
              <th>DNI / Identificación</th>
              <th>Participante</th>
              <th>Equipo / Proyecto</th>
              <th>Hora de Entrada</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>Estructura de tabla reservada</td>
              <td>Hoja «Registros»</td>
              <td>—</td>
              <td><span class="badge-demo">Pendiente</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state">
        <div class="empty-icon-box">
          ${icons.database}
        </div>
        <h3 class="empty-title">Hoja de participantes no conectada</h3>
        <p class="empty-desc">
          En la siguiente fase se conectará la hoja <strong>«Registros»</strong> para cargar los participantes y la hoja <strong>«Asistencias»</strong> para guardar los registros de cada sesión vía Google Apps Script.
        </p>
        <div class="integration-preview-badge">
          ${icons.info}
          <span>Estado: Módulo listo para enlace con Apps Script HTML Service</span>
        </div>
      </div>
    </div>
  `;
}

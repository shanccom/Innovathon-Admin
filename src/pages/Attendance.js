import { icons } from '../components/icons.js';
import { participantsService } from '../services/participantsService.js';

const ATTENDANCE_STORAGE_KEY = 'innovathon_attendance_records';

function getAttendanceRecords() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveAttendanceRecord(sessionId, participantId, status) {
  try {
    const all = getAttendanceRecords();
    if (!all[sessionId]) all[sessionId] = {};
    all[sessionId][participantId] = {
      status, // 'present' | 'absent'
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Error saving attendance:', e);
  }
}

export function renderAttendance() {
  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Control de asistencia</h1>
        <p class="page-subtitle">Registra la asistencia de los participantes y consulta su historial por sesión.</p>
      </div>
      <div class="page-actions" style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary btn-sm" id="btn-refresh-attendance">
          ${icons.refresh}
          <span>Actualizar registros</span>
        </button>
        <a href="#/" class="btn btn-secondary btn-sm">
          ${icons.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Barra de filtros y búsqueda -->
    <div class="filter-strip">
      <div class="filter-input" style="flex: 1;">
        ${icons.search}
        <input type="text" id="attendance-search" placeholder="Buscar por DNI, nombres o equipo..." />
      </div>
      <select class="filter-select" id="attendance-session-select">
        <option value="s1">Sesión: Jornada 1 - Apertura</option>
        <option value="s2">Sesión: Jornada 2 - Hackathon</option>
        <option value="s3">Sesión: Jornada 3 - Clausura</option>
      </select>
    </div>

    <!-- Indicadores de asistencia rápida -->
    <div class="status-cards-row" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.5rem;" id="attendance-counters">
      <div class="status-step-card">
        <div class="status-step-icon pending">
          ${icons.users}
        </div>
        <div>
          <div class="status-step-title">Inscritos en «Registros»</div>
          <div class="status-step-count" id="count-total">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon" style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
          ${icons.checkCircle}
        </div>
        <div>
          <div class="status-step-title">Presentes en sesión</div>
          <div class="status-step-count" id="count-present">0</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon pending">
          ${icons.clock}
        </div>
        <div>
          <div class="status-step-title">Pendientes de ingreso</div>
          <div class="status-step-count" id="count-pending">—</div>
        </div>
      </div>
    </div>

    <!-- Área de tabla y Estado -->
    <div class="content-box">
      <div id="attendance-table-container">
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          Cargando participantes desde Google Sheets...
        </div>
      </div>
    </div>
  `;
}

export async function afterAttendanceRender() {
  const searchInput = document.querySelector('#attendance-search');
  const sessionSelect = document.querySelector('#attendance-session-select');
  const refreshBtn = document.querySelector('#btn-refresh-attendance');
  const tableContainer = document.querySelector('#attendance-table-container');
  const countTotal = document.querySelector('#count-total');
  const countPresent = document.querySelector('#count-present');
  const countPending = document.querySelector('#count-pending');

  let participants = [];
  let currentSession = sessionSelect ? sessionSelect.value : 's1';

  async function loadData(force = false) {
    if (refreshBtn) refreshBtn.classList.add('spinning');
    const res = await participantsService.fetchParticipants(force);
    if (refreshBtn) refreshBtn.classList.remove('spinning');

    if (res.success) {
      participants = res.data;
      renderTable();
    } else {
      // Estado de error o permisos requeridos
      if (countTotal) countTotal.textContent = '—';
      if (countPending) countPending.textContent = '—';
      if (tableContainer) {
        tableContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon-box" style="color: #b45309;">
              ${icons.alertCircle}
            </div>
            <h3 class="empty-title">Hoja de cálculo requiere autorización</h3>
            <p class="empty-desc">
              No se pudo leer la lista de participantes porque la hoja de cálculo de Google Drive no está en modo público o requiere un conector Apps Script.
            </p>
            <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; justify-content: center;">
              <a href="#/configuracion" class="btn btn-primary btn-sm">
                ${icons.settings}
                <span>Ver instrucciones de conexión</span>
              </a>
              <a href="${participantsService.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                ${icons.externalLink}
                <span>Abrir Google Sheets</span>
              </a>
            </div>
          </div>
        `;
      }
    }
  }

  function renderTable() {
    if (!tableContainer) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const records = getAttendanceRecords()[currentSession] || {};

    const filtered = participants.filter(p => {
      if (!query) return true;
      return (
        p.dni.toLowerCase().includes(query) ||
        p.nombre.toLowerCase().includes(query) ||
        p.equipo.toLowerCase().includes(query) ||
        p.correo.toLowerCase().includes(query)
      );
    });

    const presentCount = participants.filter(p => records[p.id]?.status === 'present').length;
    const pendingCount = Math.max(0, participants.length - presentCount);

    if (countTotal) countTotal.textContent = String(participants.length);
    if (countPresent) countPresent.textContent = String(presentCount);
    if (countPending) countPending.textContent = String(pendingCount);

    if (filtered.length === 0) {
      tableContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-box">${icons.search}</div>
          <h3 class="empty-title">Sin resultados</h3>
          <p class="empty-desc">No se encontraron participantes que coincidan con "${query}".</p>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = `
      <div class="table-container">
        <table class="table-mock">
          <thead>
            <tr>
              <th>DNI / Identificación</th>
              <th>Participante</th>
              <th>Equipo / Proyecto</th>
              <th>Hora de Entrada</th>
              <th>Estado</th>
              <th style="text-align: right;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => {
              const att = records[p.id];
              const isPresent = att && att.status === 'present';
              return `
                <tr>
                  <td><code>${p.dni}</code></td>
                  <td>
                    <div style="font-weight: 700;">${p.nombre}</div>
                    <small style="color: var(--text-muted);">${p.correo !== '—' ? p.correo : p.rol}</small>
                  </td>
                  <td>${p.equipo}</td>
                  <td>${isPresent ? att.timestamp : '—'}</td>
                  <td>
                    ${isPresent 
                      ? '<span class="badge-live">Presente</span>' 
                      : '<span class="badge-demo">Pendiente</span>'
                    }
                  </td>
                  <td style="text-align: right;">
                    <button 
                      class="btn btn-sm ${isPresent ? 'btn-secondary' : 'btn-primary'}"
                      data-action="toggle-attendance"
                      data-id="${p.id}"
                      data-present="${isPresent ? 'true' : 'false'}"
                    >
                      ${isPresent ? 'Desmarcar' : 'Registrar entrada'}
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Listeners para los botones de asistencia
    tableContainer.querySelectorAll('[data-action="toggle-attendance"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const isCurrentlyPresent = btn.getAttribute('data-present') === 'true';
        const newStatus = isCurrentlyPresent ? 'absent' : 'present';
        saveAttendanceRecord(currentSession, id, newStatus);
        renderTable();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderTable);
  }

  if (sessionSelect) {
    sessionSelect.addEventListener('change', (e) => {
      currentSession = e.target.value;
      renderTable();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadData(true));
  }

  loadData(false);
}

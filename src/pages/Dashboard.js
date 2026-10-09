import { icons } from '../components/icons.js';
import { DEMO_STATS, MODULES_INFO } from '../data/demoState.js';
import { participantsService } from '../services/participantsService.js';

export function renderDashboard() {
  const statsHtml = DEMO_STATS.map(stat => {
    const iconSvg = icons[stat.icon] || icons.info;
    const isParticipants = stat.id === 'participants';

    return `
      <div class="stat-card" id="card-${stat.id}">
        <div class="stat-card-header">
          <span class="stat-card-title">${stat.title}</span>
          <div style="display:flex; align-items:center; gap: 0.35rem;">
            ${isParticipants ? `
              <button class="sync-btn" id="btn-sync-participants" title="Sincronizar con hoja de Google Sheets" type="button">
                ${icons.refresh}
              </button>
            ` : ''}
            <div class="stat-card-icon">${iconSvg}</div>
          </div>
        </div>
        <div class="stat-card-value" id="val-${stat.id}">${stat.value}</div>
        <div class="stat-card-meta" id="meta-${stat.id}">
          <span class="badge-demo">Demo</span>
          <span>${stat.note}</span>
        </div>
      </div>
    `;
  }).join('');

  const modulesHtml = MODULES_INFO.map(mod => {
    const iconSvg = icons[mod.icon] || icons.home;
    return `
      <a href="${mod.path}" class="module-card">
        <div class="module-icon-bubble">
          ${iconSvg}
        </div>
        <h3 class="module-card-title">${mod.title}</h3>
        <p class="module-card-desc">${mod.description}</p>
        <div class="module-card-footer">
          <span class="module-action-link">
            <span>${mod.actionText}</span>
            ${icons.arrowRight}
          </span>
        </div>
      </a>
    `;
  }).join('');

  return `
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Panel principal</h1>
        <p class="page-subtitle">Gestiona las operaciones de Innovathon Mollendo desde un solo lugar</p>
      </div>
      <div class="page-actions">
        <a href="#/configuracion" class="btn btn-secondary btn-sm" title="Configurar conexión con Google Sheets">
          ${icons.settings}
          <span>Conexión Google Sheets</span>
        </a>
      </div>
    </div>

    <!-- Resumen Operativo -->
    <section class="stats-grid" aria-label="Tarjetas de resumen">
      ${statsHtml}
    </section>

    <!-- Módulos de Gestión -->
    <section>
      <div class="section-heading-row">
        <h2 class="section-title">Módulos de gestión</h2>
        <span class="section-desc">Selecciona un área para comenzar</span>
      </div>
      <div class="modules-grid">
        ${modulesHtml}
      </div>
    </section>

    <!-- Actividad Reciente / Estado de Conexión -->
    <section>
      <div class="section-heading-row">
        <h2 class="section-title">Actividad y sincronización</h2>
      </div>
      <div class="content-box" id="dashboard-activity-container">
        <div class="empty-state">
          <div class="empty-icon-box">
            ${icons.inbox}
          </div>
          <h3 class="empty-title">Sin actividad reciente</h3>
          <p class="empty-desc">
            Sincronizando los datos del sistema con la hoja de cálculo de Google Sheets...
          </p>
        </div>
      </div>
    </section>
  `;
}

export async function afterDashboardRender() {
  const syncBtn = document.querySelector('#btn-sync-participants');
  const valElem = document.querySelector('#val-participants');
  const metaElem = document.querySelector('#meta-participants');
  const activityContainer = document.querySelector('#dashboard-activity-container');

  async function updateParticipantsUI(forceRefresh = false) {
    if (syncBtn) syncBtn.classList.add('spinning');
    if (valElem && !participantsService.getCachedData()) {
      valElem.innerHTML = '<span style="font-size: 1.25rem; opacity: 0.6;">Cargando...</span>';
    }

    const res = await participantsService.fetchParticipants(forceRefresh);

    if (syncBtn) syncBtn.classList.remove('spinning');

    if (res.success && valElem && metaElem) {
      valElem.textContent = String(res.count);
      metaElem.innerHTML = `
        <span class="badge-live">En vivo</span>
        <span>Sincronizado con «${participantsService.config.sheetName}» (${res.count} participantes)</span>
      `;

      if (activityContainer) {
        if (res.count > 0) {
          const sample = res.data.slice(0, 5);
          activityContainer.innerHTML = `
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-midnight);">
                Últimos participantes registrados (${res.count} en total)
              </h3>
              <a href="#/asistencias" class="btn btn-secondary btn-sm">Ver todos en Asistencias</a>
            </div>
            <div class="table-container">
              <table class="table-mock">
                <thead>
                  <tr>
                    <th>DNI / Doc</th>
                    <th>Participante</th>
                    <th>Equipo / Proyecto</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${sample.map(p => `
                    <tr>
                      <td><code>${p.dni}</code></td>
                      <td><strong>${p.nombre}</strong></td>
                      <td>${p.equipo}</td>
                      <td>${p.rol}</td>
                      <td><span class="badge-live">Registrado</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        } else {
          activityContainer.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon-box">${icons.database}</div>
              <h3 class="empty-title">Hoja «${participantsService.config.sheetName}» conectada</h3>
              <p class="empty-desc">La hoja fue leída con éxito pero aún no contiene registros de participantes.</p>
            </div>
          `;
        }
      }
    } else if (valElem && metaElem) {
      // Si la hoja requiere permisos o no es accesible aún
      valElem.textContent = '—';
      metaElem.innerHTML = `
        <a href="#/configuracion" style="text-decoration:none;">
          <span class="badge-warning">Configurar</span>
        </a>
        <span>${res.error === 'PERMISSION_DENIED' ? 'Hoja privada en Drive' : 'Error de conexión'}</span>
      `;

      if (activityContainer) {
        activityContainer.innerHTML = `
          <div class="alert-box alert-warning">
            ${icons.alertCircle}
            <div>
              <strong>Conexión con Google Sheets pendiente de autorización:</strong>
              <div style="margin-top: 0.35rem; font-size: 0.85rem; color: #78350f;">
                La hoja de cálculo está protegida por los permisos de Google Drive de la organización.
                Para que el panel la lea de forma automática, puedes 
                <strong>compartirla como "Cualquier persona con el enlace (Lector)"</strong> o 
                <strong>configurar el conector de Google Apps Script</strong>.
              </div>
              <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem;">
                <a href="#/configuracion" class="btn btn-primary btn-sm">
                  ${icons.settings}
                  <span>Ver pasos de conexión</span>
                </a>
                <a href="${participantsService.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                  ${icons.externalLink}
                  <span>Abrir hoja en Google Sheets</span>
                </a>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  if (syncBtn) {
    syncBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateParticipantsUI(true);
    });
  }

  // Carga inicial
  updateParticipantsUI(false);
}

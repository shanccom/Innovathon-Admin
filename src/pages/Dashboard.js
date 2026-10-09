import { icons } from '../components/icons.js';
import { DEMO_STATS, MODULES_INFO } from '../data/demoState.js';

export function renderDashboard() {
  const statsHtml = DEMO_STATS.map(stat => {
    const iconSvg = icons[stat.icon] || icons.info;
    return `
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">${stat.title}</span>
          <div class="stat-card-icon">${iconSvg}</div>
        </div>
        <div class="stat-card-value">${stat.value}</div>
        <div class="stat-card-meta">
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

    <!-- Actividad Reciente (Estado vacío) -->
    <section>
      <div class="section-heading-row">
        <h2 class="section-title">Actividad reciente</h2>
      </div>
      <div class="content-box">
        <div class="empty-state">
          <div class="empty-icon-box">
            ${icons.inbox}
          </div>
          <h3 class="empty-title">Sin actividad registrada</h3>
          <p class="empty-desc">
            La actividad aparecerá aquí cuando conectemos los datos del sistema con Google Sheets y los servicios de automatización.
          </p>
          <div class="integration-preview-badge">
            ${icons.info}
            <span>Fase 1: Estructura visual y navegación lista para integración</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

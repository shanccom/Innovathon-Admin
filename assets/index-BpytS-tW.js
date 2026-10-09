(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={logo:`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  `,home:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,attendance:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="m9 16 2 2 4-4"></path>
    </svg>
  `,certificates:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M9 15l2 2 4-4"></path>
      <circle cx="12" cy="14" r="7" stroke-dasharray="2 2" stroke-width="1.2"></circle>
    </svg>
  `,announcements:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `,settings:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  `,arrowRight:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  `,arrowLeft:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  `,bell:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  `,menu:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `,users:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `,checkCircle:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `,fileText:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `,send:`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  `,inbox:`
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    </svg>
  `,search:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,database:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  `,info:`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `,clock:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  `,penTool:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
      <path d="M2 2l7.586 7.586"></path>
      <circle cx="11" cy="11" r="2"></circle>
    </svg>
  `,award:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  `,mailCheck:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
      <polyline points="16 19 18 21 22 17"></polyline>
    </svg>
  `,laptop:`
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2"></rect>
      <line x1="2" y1="20" x2="22" y2="20"></line>
    </svg>
  `};function t(t){let n=[{id:`inicio`,path:`#/`,label:`Inicio`,icon:e.home},{id:`asistencias`,path:`#/asistencias`,label:`Asistencias`,icon:e.attendance},{id:`certificados`,path:`#/certificados`,label:`Certificados`,icon:e.certificates},{id:`comunicados`,path:`#/comunicados`,label:`Comunicados`,icon:e.announcements}],r={id:`configuracion`,path:`#/configuracion`,label:`Configuración`,icon:e.settings},i=e=>e===`#/`&&(t===`#/`||t===``||t===`#`)||t===e;return`
    <aside class="app-sidebar" id="appSidebar">
      <!-- Decoración orbital estilo Innovathon Landing -->
      <div class="sidebar-glow-orb sidebar-glow-purple"></div>
      <div class="sidebar-glow-orb sidebar-glow-lime"></div>

      <!-- Cabecera de marca con logo oficial de la navbar -->
      <div class="sidebar-brand-container">
        <a href="#/" class="sidebar-brand-link" title="Innovathon Manager 2026">
          <img 
            src="./brand-logo-transparent.png" 
            alt="Innovathon Mollendo" 
            class="brand-logo-img" 
            onerror="this.src='./logo-principal.png'"
          />
        </a>
      </div>

      <!-- Menú de navegación estilo Landing oficial -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">Plataforma</div>
        <div class="sidebar-links-stack">
          ${n.map(e=>`
            <a href="${e.path}" class="nav-item ${i(e.path)?`active`:``}">
              <span class="nav-item-icon">${e.icon}</span>
              <span class="nav-item-label">${e.label}</span>
            </a>
          `).join(``)}
        </div>

        <div class="nav-divider"></div>

        <div class="nav-section-label">Ajustes</div>
        <div class="sidebar-links-stack">
          <a href="${r.path}" class="nav-item ${i(r.path)?`active`:``}">
            <span class="nav-item-icon">${r.icon}</span>
            <span class="nav-item-label">${r.label}</span>
          </a>
        </div>
      </nav>

      <!-- Pie minimalista con acento cyber -->
      <div class="sidebar-footer">
        <div class="sidebar-user-minimal" title="Sesión activa en modo demostración">
          <div class="user-status-dot"></div>
          <div class="user-info-minimal">
            <span class="user-name-minimal">Comité Organizador</span>
            <span class="user-meta-minimal">laptop</span>
          </div>
        </div>
      </div>
    </aside>
  `}var n={name:`Comité Organizador`,role:`Administrador (Demo)`,avatarInitial:`IM`,event:`Innovathon Mollendo 2026`},r=[{id:`participants`,title:`Participantes registrados`,value:`—`,note:`Pendiente conexión hoja «Registros»`,isDemo:!0,icon:`users`},{id:`attendance`,title:`Asistencias registradas`,value:`—`,note:`Pendiente conexión hoja «Asistencias»`,isDemo:!0,icon:`checkCircle`},{id:`certificates`,title:`Certificados gestionados`,value:`—`,note:`Integración Google Drive / Docs`,isDemo:!0,icon:`fileText`},{id:`announcements`,title:`Comunicados enviados`,value:`—`,note:`Integración Gmail API`,isDemo:!0,icon:`send`}],i=[{id:`asistencias`,path:`#/asistencias`,title:`Control de asistencia`,icon:`attendance`,description:`Registra la asistencia de los participantes y consulta su historial por sesión.`,actionText:`Ir a asistencias`},{id:`certificados`,path:`#/certificados`,title:`Gestión de certificados`,icon:`certificates`,description:`Gestiona la generación, firma, recepción y entrega de certificados.`,actionText:`Ir a certificados`},{id:`comunicados`,path:`#/comunicados`,title:`Gestión de comunicados`,icon:`announcements`,description:`Prepara comunicados para los participantes y consulta el historial de envíos.`,actionText:`Ir a comunicados`}];function a({title:e,breadcrumbs:t=[]}){return`
    <header class="app-header">
      <div class="header-left">
        <div class="header-breadcrumbs">
          ${t.map((e,n)=>n===t.length-1?`<span class="breadcrumb-current">${e.label}</span>`:`
      <a href="${e.path}">${e.label}</a>
      <span class="breadcrumb-separator">/</span>
    `).join(``)}
        </div>
      </div>

      <div class="header-right">
        <div class="event-live-pill" title="Evento activo: Innovathon Mollendo 2026">
          <span class="event-live-indicator"></span>
          <span>${n.event}</span>
        </div>

        <div class="demo-account-chip" title="Sesión de demostración">
          <span class="account-dot"></span>
          <span>Comité Organizador</span>
        </div>
      </div>
    </header>
  `}function o({currentPath:n,pageTitle:r,breadcrumbs:i,contentHtml:o}){return`
    <!-- Bloqueo y aviso exclusivo para dispositivos móviles/pantallas pequeñas -->
    <div class="desktop-only-gate">
      <div class="desktop-gate-card">
        <div class="desktop-gate-logo">
          <img src="./logo-principal.png" alt="Innovathon Mollendo Logo" onerror="this.src='./logo-light.png'" />
        </div>
        <div class="desktop-gate-icon">
          ${e.laptop}
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
      ${t(n)}
      <div class="app-main-wrapper">
        ${a({title:r,breadcrumbs:i})}
        <main class="app-content">
          ${o}
        </main>
      </div>
    </div>
  `}function s(){return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Panel principal</h1>
        <p class="page-subtitle">Gestiona las operaciones de Innovathon Mollendo desde un solo lugar</p>
      </div>
    </div>

    <!-- Resumen Operativo -->
    <section class="stats-grid" aria-label="Tarjetas de resumen">
      ${r.map(t=>{let n=e[t.icon]||e.info;return`
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-card-title">${t.title}</span>
          <div class="stat-card-icon">${n}</div>
        </div>
        <div class="stat-card-value">${t.value}</div>
        <div class="stat-card-meta">
          <span class="badge-demo">Demo</span>
          <span>${t.note}</span>
        </div>
      </div>
    `}).join(``)}
    </section>

    <!-- Módulos de Gestión -->
    <section>
      <div class="section-heading-row">
        <h2 class="section-title">Módulos de gestión</h2>
        <span class="section-desc">Selecciona un área para comenzar</span>
      </div>
      <div class="modules-grid">
        ${i.map(t=>{let n=e[t.icon]||e.home;return`
      <a href="${t.path}" class="module-card">
        <div class="module-icon-bubble">
          ${n}
        </div>
        <h3 class="module-card-title">${t.title}</h3>
        <p class="module-card-desc">${t.description}</p>
        <div class="module-card-footer">
          <span class="module-action-link">
            <span>${t.actionText}</span>
            ${e.arrowRight}
          </span>
        </div>
      </a>
    `}).join(``)}
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
            ${e.inbox}
          </div>
          <h3 class="empty-title">Sin actividad registrada</h3>
          <p class="empty-desc">
            La actividad aparecerá aquí cuando conectemos los datos del sistema con Google Sheets y los servicios de automatización.
          </p>
          <div class="integration-preview-badge">
            ${e.info}
            <span>Fase 1: Estructura visual y navegación lista para integración</span>
          </div>
        </div>
      </div>
    </section>
  `}function c(){return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Control de asistencia</h1>
        <p class="page-subtitle">Registra la asistencia de los participantes y consulta su historial por sesión.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${e.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Barra de filtros y búsqueda (Preparada para Fase 2) -->
    <div class="filter-strip">
      <div class="filter-input">
        ${e.search}
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
          ${e.database}
        </div>
        <h3 class="empty-title">Hoja de participantes no conectada</h3>
        <p class="empty-desc">
          En la siguiente fase se conectará la hoja <strong>«Registros»</strong> para cargar los participantes y la hoja <strong>«Asistencias»</strong> para guardar los registros de cada sesión vía Google Apps Script.
        </p>
        <div class="integration-preview-badge">
          ${e.info}
          <span>Estado: Módulo listo para enlace con Apps Script HTML Service</span>
        </div>
      </div>
    </div>
  `}function l(){return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Gestión de certificados</h1>
        <p class="page-subtitle">Supervisa la generación automática, firma digital, recepción y entrega de acreditaciones.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${e.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Espacios visuales para los futuros estados -->
    <div class="status-cards-row">
      <div class="status-step-card">
        <div class="status-step-icon pending">
          ${e.clock}
        </div>
        <div>
          <div class="status-step-title">Pendiente de generación</div>
          <div class="status-step-count">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon signing">
          ${e.penTool}
        </div>
        <div>
          <div class="status-step-title">Pendiente de firma</div>
          <div class="status-step-count">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon signed">
          ${e.award}
        </div>
        <div>
          <div class="status-step-title">Firmado</div>
          <div class="status-step-count">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon delivered">
          ${e.mailCheck}
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
        ${e.search}
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
          ${e.fileText}
        </div>
        <h3 class="empty-title">Sin certificados procesados</h3>
        <p class="empty-desc">
          En la siguiente fase se conectará con plantillas en <strong>Google Docs</strong> y carpetas organizadas en <strong>Google Drive</strong> para emitir y firmar certificados en PDF.
        </p>
        <div class="integration-preview-badge">
          ${e.info}
          <span>Estado: Arquitectura de estados y diseño de módulo preparados</span>
        </div>
      </div>
    </div>
  `}function u(){return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Gestión de comunicados</h1>
        <p class="page-subtitle">Prepara comunicados masivos o personalizados para los participantes y supervisa los envíos.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${e.arrowLeft}
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
        ${e.search}
        <input type="text" placeholder="Buscar por asunto o remitente..." disabled />
      </div>
      <button class="btn btn-primary btn-disabled" style="opacity: 0.65;">
        ${e.send}
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
          ${e.announcements}
        </div>
        <h3 class="empty-title">Sin comunicados registrados</h3>
        <p class="empty-desc">
          En la siguiente fase se conectará el servicio de mensajería con <strong>Gmail / MailApp</strong> para programar recordatorios, confirmaciones de asistencia y avisos de premiación.
        </p>
        <div class="integration-preview-badge">
          ${e.info}
          <span>Estado: Módulo listo para configuración de plantillas y backend</span>
        </div>
      </div>
    </div>
  `}function d(){return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Configuración del sistema</h1>
        <p class="page-subtitle">Parámetros del evento, conexiones con Google Workspace y variables operativas.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${e.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <div class="content-box">
      <div class="empty-state">
        <div class="empty-icon-box">
          ${e.settings}
        </div>
        <h3 class="empty-title">Módulo de configuración pendiente</h3>
        <p class="empty-desc">
          Esta sección permitirá administrar los IDs de las hojas de cálculo de Google Sheets, IDs de plantillas de certificados en Drive y credenciales de correo electrónico para la organización de Innovathon Mollendo 2026.
        </p>
        <div class="integration-preview-badge">
          ${e.info}
          <span>Módulo informativo - En preparación para la fase de integración</span>
        </div>
      </div>
    </div>
  `}var f={"#/":{title:`Panel principal - Innovathon Manager`,pageTitle:`Panel principal`,breadcrumbs:[{label:`Inicio`,path:`#/`}],render:s},"#/asistencias":{title:`Control de Asistencias - Innovathon Manager`,pageTitle:`Control de asistencia`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Asistencias`,path:`#/asistencias`}],render:c},"#/certificados":{title:`Gestión de Certificados - Innovathon Manager`,pageTitle:`Gestión de certificados`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Certificados`,path:`#/certificados`}],render:l},"#/comunicados":{title:`Gestión de Comunicados - Innovathon Manager`,pageTitle:`Gestión de comunicados`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Comunicados`,path:`#/comunicados`}],render:u},"#/configuracion":{title:`Configuración - Innovathon Manager`,pageTitle:`Configuración`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Configuración`,path:`#/configuracion`}],render:d}};function p(e){function t(){let t=window.location.hash||`#/`;t.startsWith(`#/`)||(t=`#/`);let n=f[t]||f[`#/`];document.title=n.title;let r=n.render();e.innerHTML=o({currentPath:t,pageTitle:n.pageTitle,breadcrumbs:n.breadcrumbs,contentHtml:r})}window.addEventListener(`hashchange`,t),t()}var m=document.querySelector(`#app`);m&&p(m);
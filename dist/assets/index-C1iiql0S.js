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
  `,refresh:`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  `,externalLink:`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `,check:`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `,alertCircle:`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  `,copy:`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
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
  `}var s=`innovathon_sheets_config`,c=`innovathon_participants_cache`,l={spreadsheetId:`1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8`,sheetName:`Registros`,appsScriptUrl:``},u=new class{constructor(){this.config=this.loadConfig(),this.cachedData=null,this.lastStatus={state:`idle`,message:``,count:0,timestamp:null}}loadConfig(){try{if(typeof localStorage<`u`){let e=localStorage.getItem(s);if(e)return{...l,...JSON.parse(e)}}}catch(e){console.warn(`Error reading sheets config from localStorage:`,e)}return{...l}}saveConfig(e){this.config={...this.config,...e};try{typeof localStorage<`u`&&localStorage.setItem(s,JSON.stringify(this.config))}catch(e){console.error(`Error saving sheets config:`,e)}}getSpreadsheetUrl(){return`https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/edit?usp=sharing`}async fetchParticipants(e=!1){if(!e&&this.cachedData)return{success:!0,data:this.cachedData,count:this.cachedData.length,fromCache:!0,status:this.lastStatus};if(this.lastStatus={state:`loading`,message:`Sincronizando con Google Sheets...`,count:0,timestamp:Date.now()},this.config.appsScriptUrl&&this.config.appsScriptUrl.trim())try{let e=await fetch(this.config.appsScriptUrl.trim(),{method:`GET`,mode:`cors`});if(e.ok){let t=await e.json(),n=Array.isArray(t)?t:t.data||t.rows||[],r=this.normalizeRows(n);return this.cachedData=r,this.lastStatus={state:`connected`,message:`Sincronizado vía Apps Script Web App`,count:r.length,timestamp:Date.now()},this.saveCache(r),{success:!0,data:r,count:r.length,status:this.lastStatus}}}catch(e){console.warn(`Fallo al conectar con Apps Script Web App:`,e)}let t=`https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(this.config.sheetName)}`;try{let e=await(await fetch(t,{method:`GET`,headers:{Accept:`application/json, text/plain, */*`}})).text();if(e.includes(`ServiceLogin`)||e.includes(`accounts.google.com`)||e.includes(`<html`))return this.lastStatus={state:`error`,errorType:`PERMISSION_DENIED`,message:`La hoja de cálculo es privada. Requiere acceso público o Apps Script.`,count:0,timestamp:Date.now()},{success:!1,error:`PERMISSION_DENIED`,message:this.lastStatus.message,spreadsheetUrl:this.getSpreadsheetUrl(),status:this.lastStatus};let n=e.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);if(!n||!n[1])throw Error(`Formato de respuesta de Google Sheets no reconocido.`);let r=JSON.parse(n[1]);if(r.status===`error`)throw Error(r.errors?.[0]?.message||`Error en consulta de Google Sheets`);let i=r.table;if(!i||!i.cols||!i.rows)throw Error(`Estructura de tabla vacía o no válida en la hoja.`);let a=i.cols.map((e,t)=>e&&e.label?e.label.trim():`Columna ${t+1}`),o=i.rows.map(e=>{if(!e||!e.c)return null;let t={},n=!1;return e.c.forEach((e,r)=>{let i=a[r]||`col_${r}`,o=e?e.f!==void 0&&e.f!==null?e.f:e.v??``:``;t[i]=typeof o==`string`?o.trim():o,o!==``&&o!=null&&(n=!0)}),n?t:null}).filter(Boolean),s=this.normalizeRows(o);return this.cachedData=s,this.lastStatus={state:`connected`,message:`Sincronizado con hoja «${this.config.sheetName}»`,count:s.length,timestamp:Date.now()},this.saveCache(s),{success:!0,data:s,count:s.length,status:this.lastStatus}}catch(e){return this.lastStatus={state:`error`,errorType:`FETCH_ERROR`,message:e.message||`Error al conectar con la hoja de Google Sheets`,count:0,timestamp:Date.now()},{success:!1,error:`FETCH_ERROR`,message:this.lastStatus.message,status:this.lastStatus}}}normalizeRows(e){return e.map((e,t)=>{let n=Object.keys(e),r=(...e)=>n.find(t=>{let n=t.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``);return e.some(e=>n.includes(e))}),i=r(`dni`,`documento`,`identificacion`,`cedula`),a=r(`nombres y apellidos`,`nombre y apellido`,`apellidos y nombres`,`nombre completo`,`participante`),o=r(`nombres`,`nombre`),s=r(`apellidos`,`apellido`),c=r(`equipo`,`proyecto`,`team`,`grupo`),l=r(`correo`,`email`,`mail`),u=r(`celular`,`telefono`,`whatsapp`,`movil`),d=r(`rol`,`categoria`,`tipo`,`modalidad`),f=``;return f=a&&e[a]?String(e[a]):o&&s&&o!==s?`${e[o]||``} ${e[s]||``}`.trim():o&&e[o]?String(e[o]):s&&e[s]?String(e[s]):`Participante #${t+1}`,{id:`p-${t+1}`,raw:e,dni:i&&e[i]?String(e[i]).trim():`—`,nombre:f.trim(),equipo:c&&e[c]?String(e[c]).trim():`Sin equipo asignado`,correo:l&&e[l]?String(e[l]).trim():`—`,celular:u&&e[u]?String(e[u]).trim():`—`,rol:d&&e[d]?String(e[d]).trim():`Participante`,estado:`Registrado`}})}saveCache(e){try{sessionStorage.setItem(c,JSON.stringify({data:e,timestamp:Date.now(),count:e.length}))}catch{}}getCachedData(){if(this.cachedData)return this.cachedData;try{let e=sessionStorage.getItem(c);if(e){let t=JSON.parse(e);return this.cachedData=t.data,t.data}}catch{}return null}getLastStatus(){return this.lastStatus}};function d(){let t=r.map(t=>{let n=e[t.icon]||e.info,r=t.id===`participants`;return`
      <div class="stat-card" id="card-${t.id}">
        <div class="stat-card-header">
          <span class="stat-card-title">${t.title}</span>
          <div style="display:flex; align-items:center; gap: 0.35rem;">
            ${r?`
              <button class="sync-btn" id="btn-sync-participants" title="Sincronizar con hoja de Google Sheets" type="button">
                ${e.refresh}
              </button>
            `:``}
            <div class="stat-card-icon">${n}</div>
          </div>
        </div>
        <div class="stat-card-value" id="val-${t.id}">${t.value}</div>
        <div class="stat-card-meta" id="meta-${t.id}">
          <span class="badge-demo">Demo</span>
          <span>${t.note}</span>
        </div>
      </div>
    `}).join(``),n=i.map(t=>{let n=e[t.icon]||e.home;return`
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
    `}).join(``);return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Panel principal</h1>
        <p class="page-subtitle">Gestiona las operaciones de Innovathon Mollendo desde un solo lugar</p>
      </div>
      <div class="page-actions">
        <a href="#/configuracion" class="btn btn-secondary btn-sm" title="Configurar conexión con Google Sheets">
          ${e.settings}
          <span>Conexión Google Sheets</span>
        </a>
      </div>
    </div>

    <!-- Resumen Operativo -->
    <section class="stats-grid" aria-label="Tarjetas de resumen">
      ${t}
    </section>

    <!-- Módulos de Gestión -->
    <section>
      <div class="section-heading-row">
        <h2 class="section-title">Módulos de gestión</h2>
        <span class="section-desc">Selecciona un área para comenzar</span>
      </div>
      <div class="modules-grid">
        ${n}
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
            ${e.inbox}
          </div>
          <h3 class="empty-title">Sin actividad reciente</h3>
          <p class="empty-desc">
            Sincronizando los datos del sistema con la hoja de cálculo de Google Sheets...
          </p>
        </div>
      </div>
    </section>
  `}async function f(){let t=document.querySelector(`#btn-sync-participants`),n=document.querySelector(`#val-participants`),r=document.querySelector(`#meta-participants`),i=document.querySelector(`#dashboard-activity-container`);async function a(a=!1){t&&t.classList.add(`spinning`),n&&!u.getCachedData()&&(n.innerHTML=`<span style="font-size: 1.25rem; opacity: 0.6;">Cargando...</span>`);let o=await u.fetchParticipants(a);if(t&&t.classList.remove(`spinning`),o.success&&n&&r){if(n.textContent=String(o.count),r.innerHTML=`
        <span class="badge-live">En vivo</span>
        <span>Sincronizado con «${u.config.sheetName}» (${o.count} participantes)</span>
      `,i){if(o.count>0){let e=o.data.slice(0,5);i.innerHTML=`
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-midnight);">
                Últimos participantes registrados (${o.count} en total)
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
                  ${e.map(e=>`
                    <tr>
                      <td><code>${e.dni}</code></td>
                      <td><strong>${e.nombre}</strong></td>
                      <td>${e.equipo}</td>
                      <td>${e.rol}</td>
                      <td><span class="badge-live">Registrado</span></td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          `}else i.innerHTML=`
            <div class="empty-state">
              <div class="empty-icon-box">${e.database}</div>
              <h3 class="empty-title">Hoja «${u.config.sheetName}» conectada</h3>
              <p class="empty-desc">La hoja fue leída con éxito pero aún no contiene registros de participantes.</p>
            </div>
          `}}else n&&r&&(n.textContent=`—`,r.innerHTML=`
        <a href="#/configuracion" style="text-decoration:none;">
          <span class="badge-warning">Configurar</span>
        </a>
        <span>${o.error===`PERMISSION_DENIED`?`Hoja privada en Drive`:`Error de conexión`}</span>
      `,i&&(i.innerHTML=`
          <div class="alert-box alert-warning">
            ${e.alertCircle}
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
                  ${e.settings}
                  <span>Ver pasos de conexión</span>
                </a>
                <a href="${u.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                  ${e.externalLink}
                  <span>Abrir hoja en Google Sheets</span>
                </a>
              </div>
            </div>
          </div>
        `))}t&&t.addEventListener(`click`,e=>{e.preventDefault(),a(!0)}),a(!1)}var p=`innovathon_attendance_records`;function m(){try{let e=localStorage.getItem(p);return e?JSON.parse(e):{}}catch{return{}}}function h(e,t,n){try{let r=m();r[e]||(r[e]={}),r[e][t]={status:n,timestamp:new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})},localStorage.setItem(p,JSON.stringify(r))}catch(e){console.error(`Error saving attendance:`,e)}}function g(){return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Control de asistencia</h1>
        <p class="page-subtitle">Registra la asistencia de los participantes y consulta su historial por sesión.</p>
      </div>
      <div class="page-actions" style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary btn-sm" id="btn-refresh-attendance">
          ${e.refresh}
          <span>Actualizar registros</span>
        </button>
        <a href="#/" class="btn btn-secondary btn-sm">
          ${e.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Barra de filtros y búsqueda -->
    <div class="filter-strip">
      <div class="filter-input" style="flex: 1;">
        ${e.search}
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
          ${e.users}
        </div>
        <div>
          <div class="status-step-title">Inscritos en «Registros»</div>
          <div class="status-step-count" id="count-total">—</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon" style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
          ${e.checkCircle}
        </div>
        <div>
          <div class="status-step-title">Presentes en sesión</div>
          <div class="status-step-count" id="count-present">0</div>
        </div>
      </div>

      <div class="status-step-card">
        <div class="status-step-icon pending">
          ${e.clock}
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
  `}async function _(){let t=document.querySelector(`#attendance-search`),n=document.querySelector(`#attendance-session-select`),r=document.querySelector(`#btn-refresh-attendance`),i=document.querySelector(`#attendance-table-container`),a=document.querySelector(`#count-total`),o=document.querySelector(`#count-present`),s=document.querySelector(`#count-pending`),c=[],l=n?n.value:`s1`;async function d(t=!1){r&&r.classList.add(`spinning`);let n=await u.fetchParticipants(t);r&&r.classList.remove(`spinning`),n.success?(c=n.data,f()):(a&&(a.textContent=`—`),s&&(s.textContent=`—`),i&&(i.innerHTML=`
          <div class="empty-state">
            <div class="empty-icon-box" style="color: #b45309;">
              ${e.alertCircle}
            </div>
            <h3 class="empty-title">Hoja de cálculo requiere autorización</h3>
            <p class="empty-desc">
              No se pudo leer la lista de participantes porque la hoja de cálculo de Google Drive no está en modo público o requiere un conector Apps Script.
            </p>
            <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; justify-content: center;">
              <a href="#/configuracion" class="btn btn-primary btn-sm">
                ${e.settings}
                <span>Ver instrucciones de conexión</span>
              </a>
              <a href="${u.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                ${e.externalLink}
                <span>Abrir Google Sheets</span>
              </a>
            </div>
          </div>
        `))}function f(){if(!i)return;let n=t?t.value.toLowerCase().trim():``,r=m()[l]||{},u=c.filter(e=>!n||e.dni.toLowerCase().includes(n)||e.nombre.toLowerCase().includes(n)||e.equipo.toLowerCase().includes(n)||e.correo.toLowerCase().includes(n)),d=c.filter(e=>r[e.id]?.status===`present`).length,p=Math.max(0,c.length-d);a&&(a.textContent=String(c.length)),o&&(o.textContent=String(d)),s&&(s.textContent=String(p)),u.length===0?i.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon-box">${e.search}</div>
          <h3 class="empty-title">Sin resultados</h3>
          <p class="empty-desc">No se encontraron participantes que coincidan con "${n}".</p>
        </div>
      `:(i.innerHTML=`
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
            ${u.map(e=>{let t=r[e.id],n=t&&t.status===`present`;return`
                <tr>
                  <td><code>${e.dni}</code></td>
                  <td>
                    <div style="font-weight: 700;">${e.nombre}</div>
                    <small style="color: var(--text-muted);">${e.correo===`—`?e.rol:e.correo}</small>
                  </td>
                  <td>${e.equipo}</td>
                  <td>${n?t.timestamp:`—`}</td>
                  <td>
                    ${n?`<span class="badge-live">Presente</span>`:`<span class="badge-demo">Pendiente</span>`}
                  </td>
                  <td style="text-align: right;">
                    <button 
                      class="btn btn-sm ${n?`btn-secondary`:`btn-primary`}"
                      data-action="toggle-attendance"
                      data-id="${e.id}"
                      data-present="${n?`true`:`false`}"
                    >
                      ${n?`Desmarcar`:`Registrar entrada`}
                    </button>
                  </td>
                </tr>
              `}).join(``)}
          </tbody>
        </table>
      </div>
    `,i.querySelectorAll(`[data-action="toggle-attendance"]`).forEach(e=>{e.addEventListener(`click`,t=>{let n=e.getAttribute(`data-id`),r=e.getAttribute(`data-present`)===`true`?`absent`:`present`;h(l,n,r),f()})}))}t&&t.addEventListener(`input`,f),n&&n.addEventListener(`change`,e=>{l=e.target.value,f()}),r&&r.addEventListener(`click`,()=>d(!0)),d(!1)}function v(){return`
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
  `}function y(){return`
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
  `}var b=`/**
 * Backend de Google Apps Script para Innovathon Mollendo 2026
 * Permite leer "Registros" y escribir en "Asistencias" de forma segura.
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Registros") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return responseJSON({ success: true, total: 0, data: [] });
    }
    
    const headers = data[0];
    const rows = data.slice(1).map(function(row) {
      var item = {};
      headers.forEach(function(h, i) {
        if (h) item[String(h).trim()] = row[i];
      });
      return item;
    });
    
    return responseJSON({
      success: true,
      sheet: sheet.getName(),
      total: rows.length,
      data: rows
    });
  } catch (err) {
    return responseJSON({ success: false, error: err.message });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;function x(){let t=u.config;return`
    <div class="page-header-row">
      <div>
        <h1 class="page-title">Configuración de integraciones</h1>
        <p class="page-subtitle">Gestiona la conexión con Google Sheets (hoja «Registros») y servicios de Google Workspace.</p>
      </div>
      <div class="page-actions">
        <a href="#/" class="btn btn-secondary">
          ${e.arrowLeft}
          <span>Volver al panel</span>
        </a>
      </div>
    </div>

    <!-- Formulario de Configuración -->
    <div class="form-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-midnight); margin: 0;">
            Conexión con Google Sheets
          </h2>
          <p class="form-hint" style="margin-top: 0.25rem;">
            Especifica el ID de tu hoja y el nombre de la pestaña donde están los participantes registrados.
          </p>
        </div>
        <a href="${u.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          ${e.externalLink}
          <span>Abrir hoja en Google Sheets</span>
        </a>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label" for="cfg-spreadsheet-id">ID de la Hoja de Cálculo (Google Sheets ID)</label>
          <input 
            type="text" 
            id="cfg-spreadsheet-id" 
            class="form-control" 
            value="${t.spreadsheetId}" 
            placeholder="1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8"
          />
          <span class="form-hint">
            Extraído de la URL de tu hoja: <code>docs.google.com/spreadsheets/d/<strong>ID</strong>/edit</code>
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" for="cfg-sheet-name">Nombre de la Pestaña / Hoja</label>
          <input 
            type="text" 
            id="cfg-sheet-name" 
            class="form-control" 
            value="${t.sheetName}" 
            placeholder="Registros"
          />
          <span class="form-hint">
            Debe coincidir exactamente con el nombre de la pestaña (por defecto: <code>Registros</code>).
          </span>
        </div>

        <div class="form-group">
          <label class="form-label" for="cfg-apps-script-url">
            URL de Google Apps Script Web App <span style="font-weight: 400; color: var(--text-muted);">(Opcional / Recomendado)</span>
          </label>
          <input 
            type="url" 
            id="cfg-apps-script-url" 
            class="form-control" 
            value="${t.appsScriptUrl||``}" 
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <span class="form-hint">
            Si prefieres mantener la hoja privada o registrar asistencias, implementa el script proporcionado abajo.
          </span>
        </div>
      </div>

      <div id="settings-status-box"></div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary" id="btn-save-and-test">
          ${e.refresh}
          <span>Guardar y Probar Conexión</span>
        </button>
      </div>
    </div>

    <!-- Guía de Configuración -->
    <div class="form-card">
      <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-midnight); margin-bottom: 1.25rem;">
        ¿Cómo conectar la hoja de Google Sheets?
      </h2>

      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--color-purple); margin-bottom: 0.75rem;">
          Opción 1: Acceso Directo por Enlace (Rápido - 10 segundos)
        </h3>
        
        <div class="guide-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-title">Abre la hoja de cálculo</div>
            <div class="step-desc">
              Ingresa a <a href="${u.getSpreadsheetUrl()}" target="_blank" rel="noopener noreferrer">este enlace de Google Sheets</a>.
            </div>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-title">Cambia los permisos de compartir</div>
            <div class="step-desc">
              Haz clic en el botón superior derecho <strong>Compartir</strong>. En la sección <strong>Acceso general</strong>, cambia de <em>Restringido</em> a <strong>«Cualquier persona con el enlace»</strong> con rol de <strong>Lector</strong>.
            </div>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-title">Haz clic en Listo y Prueba</div>
            <div class="step-desc">
              Presiona el botón <strong>«Guardar y Probar Conexión»</strong> arriba. El panel leerá inmediatamente las filas de «Registros».
            </div>
          </div>
        </div>
      </div>

      <div class="nav-divider" style="margin: 2rem 0;"></div>

      <div>
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--color-purple); margin-bottom: 0.75rem;">
          Opción 2: Conector Google Apps Script (Ideal para mantener la hoja privada y registrar asistencias)
        </h3>
        <p class="form-hint" style="margin-bottom: 1rem;">
          Permite leer los registros y enviar marcas de asistencia directamente a Google Sheets sin hacer el archivo público para todo el mundo.
        </p>

        <div class="guide-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-title">Abrir el editor de Apps Script</div>
            <div class="step-desc">
              En tu hoja de Google Sheets, ve a <strong>Extensiones &gt; Apps Script</strong>.
            </div>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-title">Pegar el código de backend</div>
            <div class="step-desc">
              Borra el código que aparezca y pega el siguiente script:
            </div>
            <div class="code-box">
              <div class="code-header">
                <span>Código.gs</span>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-code" style="padding: 2px 8px; font-size: 0.75rem;">
                  ${e.copy}
                  <span id="copy-text">Copiar código</span>
                </button>
              </div>
              <pre><code>${b}</code></pre>
            </div>
          </div>
        </div>

        <div class="guide-step" style="margin-top: 1.25rem;">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-title">Implementar como Aplicación Web</div>
            <div class="step-desc">
              Haz clic en <strong>Implementar &gt; Nueva implementación</strong>. Selecciona tipo <strong>Aplicación web</strong>.<br>
              En <em>Ejecutar como</em>: <strong>Yo</strong>.<br>
              En <em>Quién tiene acceso</em>: <strong>Cualquier persona</strong> (Anyone).<br>
              Copia la URL generada (termina en <code>/exec</code>) y pégala en el campo «URL de Google Apps Script Web App» de arriba.
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function S(){let t=document.querySelector(`#btn-save-and-test`),n=document.querySelector(`#btn-copy-code`),r=document.querySelector(`#copy-text`),i=document.querySelector(`#settings-status-box`),a=document.querySelector(`#cfg-spreadsheet-id`),o=document.querySelector(`#cfg-sheet-name`),s=document.querySelector(`#cfg-apps-script-url`);n&&n.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(b),r&&(r.textContent=`¡Copiado!`),setTimeout(()=>{r&&(r.textContent=`Copiar código`)},2500)}catch{alert(`Copia el código manualmente desde el bloque de texto.`)}}),t&&t.addEventListener(`click`,async()=>{let n=a?a.value.trim():``,r=o?o.value.trim():``,c=s?s.value.trim():``;u.saveConfig({spreadsheetId:n||u.config.spreadsheetId,sheetName:r||u.config.sheetName,appsScriptUrl:c}),i&&(i.innerHTML=`
          <div class="alert-box alert-info">
            ${e.refresh}
            <div>Probando conexión con Google Sheets...</div>
          </div>
        `),t.classList.add(`spinning`);let l=await u.fetchParticipants(!0);t.classList.remove(`spinning`),i&&(l.success?i.innerHTML=`
          <div class="alert-box alert-success">
            ${e.check}
            <div>
              <strong>¡Conexión establecida con éxito!</strong>
              <div style="margin-top: 0.25rem;">
                Se leyeron correctamente <strong>${l.count} participantes</strong> de la hoja «${u.config.sheetName}».
                Tanto el panel principal como el módulo de Asistencias ya están sincronizados.
              </div>
            </div>
          </div>
        `:l.error===`PERMISSION_DENIED`?i.innerHTML=`
            <div class="alert-box alert-warning">
              ${e.alertCircle}
              <div>
                <strong>Hoja protegida por Google Drive:</strong>
                <div style="margin-top: 0.25rem;">
                  La hoja no permite lectura anónima todavía. Para solucionarlo en 10 segundos:
                  <ol style="margin: 0.5rem 0 0.5rem 1.25rem; padding: 0;">
                    <li>Abre <a href="${u.getSpreadsheetUrl()}" target="_blank">tu hoja de Google Sheets</a>.</li>
                    <li>Presiona <strong>Compartir</strong> (botón verde/azul arriba a la derecha).</li>
                    <li>En <em>Acceso general</em>, selecciona <strong>«Cualquier persona con el enlace»</strong> como <strong>Lector</strong>.</li>
                    <li>Vuelve a presionar el botón <em>«Guardar y Probar Conexión»</em>.</li>
                  </ol>
                </div>
              </div>
            </div>
          `:i.innerHTML=`
            <div class="alert-box alert-error">
              ${e.alertCircle}
              <div>
                <strong>Error al consultar la hoja:</strong>
                <div style="margin-top: 0.25rem;">${l.message}</div>
              </div>
            </div>
          `)})}var C={"#/":{title:`Panel principal - Innovathon Manager`,pageTitle:`Panel principal`,breadcrumbs:[{label:`Inicio`,path:`#/`}],render:d,afterRender:f},"#/asistencias":{title:`Control de Asistencias - Innovathon Manager`,pageTitle:`Control de asistencia`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Asistencias`,path:`#/asistencias`}],render:g,afterRender:_},"#/certificados":{title:`Gestión de Certificados - Innovathon Manager`,pageTitle:`Gestión de certificados`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Certificados`,path:`#/certificados`}],render:v},"#/comunicados":{title:`Gestión de Comunicados - Innovathon Manager`,pageTitle:`Gestión de comunicados`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Comunicados`,path:`#/comunicados`}],render:y},"#/configuracion":{title:`Configuración - Innovathon Manager`,pageTitle:`Configuración`,breadcrumbs:[{label:`Inicio`,path:`#/`},{label:`Configuración`,path:`#/configuracion`}],render:x,afterRender:S}};function w(e){function t(){let t=window.location.hash||`#/`;t.startsWith(`#/`)||(t=`#/`);let n=C[t]||C[`#/`];document.title=n.title;let r=n.render();e.innerHTML=o({currentPath:t,pageTitle:n.pageTitle,breadcrumbs:n.breadcrumbs,contentHtml:r}),typeof n.afterRender==`function`&&n.afterRender()}window.addEventListener(`hashchange`,t),t()}var T=document.querySelector(`#app`);T&&w(T);
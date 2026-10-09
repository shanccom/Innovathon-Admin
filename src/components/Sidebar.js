import { icons } from './icons.js';

export function renderSidebar(currentPath) {
  const navItems = [
    { id: 'inicio', path: '#/', label: 'Inicio', icon: icons.home },
    { id: 'asistencias', path: '#/asistencias', label: 'Asistencias', icon: icons.attendance },
    { id: 'certificados', path: '#/certificados', label: 'Certificados', icon: icons.certificates },
    { id: 'comunicados', path: '#/comunicados', label: 'Comunicados', icon: icons.announcements },
  ];

  const configItem = {
    id: 'configuracion',
    path: '#/configuracion',
    label: 'Configuración',
    icon: icons.settings
  };

  const isCurrent = (path) => {
    if (path === '#/' && (currentPath === '#/' || currentPath === '' || currentPath === '#')) {
      return true;
    }
    return currentPath === path;
  };

  return `
    <aside class="app-sidebar" id="appSidebar">
      <!-- Decoración orbital estilo Innovathon Landing -->
      <div class="sidebar-glow-orb sidebar-glow-purple"></div>
      <div class="sidebar-glow-orb sidebar-glow-lime"></div>

      <!-- Cabecera de marca con logo oficial -->
      <div class="sidebar-brand-container">
        <a href="#/" class="sidebar-brand-link">
          <img 
            src="./logo-principal.png" 
            alt="Innovathon Mollendo Logo" 
            class="brand-logo-img" 
            onerror="this.src='./logo-light.png'"
          />
        </a>
      </div>

      <!-- Menú de navegación estilo Landing oficial -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">Plataforma</div>
        <div class="sidebar-links-stack">
          ${navItems.map(item => `
            <a href="${item.path}" class="nav-item ${isCurrent(item.path) ? 'active' : ''}">
              <span class="nav-item-icon">${item.icon}</span>
              <span class="nav-item-label">${item.label}</span>
            </a>
          `).join('')}
        </div>

        <div class="nav-divider"></div>

        <div class="nav-section-label">Ajustes</div>
        <div class="sidebar-links-stack">
          <a href="${configItem.path}" class="nav-item ${isCurrent(configItem.path) ? 'active' : ''}">
            <span class="nav-item-icon">${configItem.icon}</span>
            <span class="nav-item-label">${configItem.label}</span>
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
  `;
}

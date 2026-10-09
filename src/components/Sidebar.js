import { icons } from './icons.js';
import { DEMO_USER } from '../data/demoState.js';

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
      <div class="sidebar-brand">
        <div class="brand-icon-wrapper">
          ${icons.logo}
        </div>
        <div>
          <div class="brand-title">Innovathon</div>
          <div class="brand-subtitle">Manager 2026</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Gestión del Evento</div>
        ${navItems.map(item => `
          <a href="${item.path}" class="nav-item ${isCurrent(item.path) ? 'active' : ''}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `).join('')}

        <div class="nav-divider"></div>

        <div class="nav-section-label">Sistema</div>
        <a href="${configItem.path}" class="nav-item ${isCurrent(configItem.path) ? 'active' : ''}">
          ${configItem.icon}
          <span>${configItem.label}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-badge-demo" title="Elemento visual demostrativo (sin sesión real)">
          <div class="user-avatar">${DEMO_USER.avatarInitial}</div>
          <div class="user-info">
            <div class="user-name">${DEMO_USER.name}</div>
            <span class="user-role-badge">${DEMO_USER.role}</span>
          </div>
        </div>
      </div>
    </aside>
  `;
}

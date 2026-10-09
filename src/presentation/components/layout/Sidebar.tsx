import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import brandLogo from '../../../assets/images/brand-logo-transparent.png';
import logoPrincipal from '../../../assets/images/logo-principal.png';
import { Icon } from '../common/Icon';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { id: 'inicio', path: '/', label: 'Inicio', icon: 'home' },
    { id: 'asistencias', path: '/asistencias', label: 'Asistencias', icon: 'attendance' },
    { id: 'certificados', path: '/certificados', label: 'Certificados', icon: 'certificates' },
    { id: 'comunicados', path: '/comunicados', label: 'Comunicados', icon: 'announcements' },
  ];

  const configItem = {
    id: 'configuracion',
    path: '/configuracion',
    label: 'Configuración',
    icon: 'settings',
  };

  const isCurrent = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname === path;
  };

  return (
    <aside className="app-sidebar" id="appSidebar">
      {/* Decoración orbital estilo Innovathon Landing */}
      <div className="sidebar-glow-orb sidebar-glow-purple"></div>
      <div className="sidebar-glow-orb sidebar-glow-lime"></div>

      {/* Cabecera de marca con logo oficial de la navbar */}
      <div className="sidebar-brand-container">
        <Link to="/" className="sidebar-brand-link" title="Innovathon Manager 2026">
          <img
            src={brandLogo}
            alt="Innovathon Mollendo"
            className="brand-logo-img"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = logoPrincipal;
            }}
          />
        </Link>
      </div>

      {/* Menú de navegación estilo Landing oficial */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Plataforma</div>
        <div className="sidebar-links-stack">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isCurrent(item.path) ? 'active' : ''}`}
            >
              <span className="nav-item-icon">
                <Icon name={item.icon} />
              </span>
              <span className="nav-item-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-divider"></div>

        <div className="nav-section-label">Ajustes</div>
        <div className="sidebar-links-stack">
          <Link
            to={configItem.path}
            className={`nav-item ${isCurrent(configItem.path) ? 'active' : ''}`}
          >
            <span className="nav-item-icon">
              <Icon name={configItem.icon} />
            </span>
            <span className="nav-item-label">{configItem.label}</span>
          </Link>
        </div>
      </nav>

      {/* Pie minimalista con acento cyber */}
      <div className="sidebar-footer">
        <div className="sidebar-user-minimal" title="Sesión activa en modo demostración">
          <div className="user-status-dot"></div>
          <div className="user-info-minimal">
            <span className="user-name-minimal">Comité Organizador</span>
            <span className="user-meta-minimal">laptop</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEMO_USER } from '../../../infrastructure/state/demo-state';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const ROUTE_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Inicio', path: '/' }],
  '/asistencias': [
    { label: 'Inicio', path: '/' },
    { label: 'Asistencias', path: '/asistencias' },
  ],
  '/certificados': [
    { label: 'Inicio', path: '/' },
    { label: 'Certificados', path: '/certificados' },
  ],
  '/comunicados': [
    { label: 'Inicio', path: '/' },
    { label: 'Comunicados', path: '/comunicados' },
  ],
  '/configuracion': [
    { label: 'Inicio', path: '/' },
    { label: 'Configuración', path: '/configuracion' },
  ],
};

export const Header: React.FC = () => {
  const location = useLocation();
  const breadcrumbs = ROUTE_BREADCRUMBS[location.pathname] || [
    { label: 'Inicio', path: '/' },
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-breadcrumbs">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            if (isLast) {
              return (
                <span key={b.path} className="breadcrumb-current">
                  {b.label}
                </span>
              );
            }
            return (
              <React.Fragment key={b.path}>
                <Link to={b.path}>{b.label}</Link>
                <span className="breadcrumb-separator">/</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="header-right">
        <div className="event-live-pill" title="Evento activo: Innovathon Mollendo 2026">
          <span className="event-live-indicator"></span>
          <span>{DEMO_USER.event}</span>
        </div>

        <div className="demo-account-chip" title="Sesión de demostración">
          <span className="account-dot"></span>
          <span>{DEMO_USER.name}</span>
        </div>
      </div>
    </header>
  );
};

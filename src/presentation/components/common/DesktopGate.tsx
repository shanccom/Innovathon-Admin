import React from 'react';
import logoPrincipal from '../../../assets/images/logo-principal.png';
import logoLight from '../../../assets/images/logo-light.png';
import { Icon } from './Icon';

export const DesktopGate: React.FC = () => {
  return (
    <div className="desktop-only-gate">
      <div className="desktop-gate-card">
        <div className="desktop-gate-logo">
          <img
            src={logoPrincipal}
            alt="Innovathon Mollendo Logo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = logoLight;
            }}
          />
        </div>
        <div className="desktop-gate-icon">
          <Icon name="laptop" size={48} />
        </div>
        <h2 className="desktop-gate-title">Experiencia optimizada para ordenador</h2>
        <p className="desktop-gate-text">
          <strong>Innovathon Manager</strong> está diseñado exclusivamente para su uso en laptop o computadora de escritorio, garantizando la gestión fluida de tablas masivas, asistencias y emisión de certificados.
        </p>
        <div className="desktop-gate-badge">
          <span>Resolución mínima recomendada: 1024px</span>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';

export const AnnouncementsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Gestión de Comunicados - Innovathon Manager';
  }, []);

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Gestión de comunicados</h1>
          <p className="page-subtitle">
            Prepara comunicados masivos o personalizados para los participantes y supervisa los envíos.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/" className="btn btn-secondary">
            <Icon name="arrowLeft" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </div>

      {/* Espacios para futuros apartados: Redactar, Destinatarios e Historial */}
      <div className="status-cards-row">
        <div className="status-step-card" style={{ borderLeft: '3px solid var(--color-primary-600)' }}>
          <div>
            <div className="status-step-title">Apartado 1</div>
            <div className="status-step-count" style={{ fontSize: '1rem', fontWeight: 600 }}>
              Redactar comunicado
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Plantillas y variables dinámicas
            </small>
          </div>
        </div>

        <div className="status-step-card" style={{ borderLeft: '3px solid var(--color-primary-600)' }}>
          <div>
            <div className="status-step-title">Apartado 2</div>
            <div className="status-step-count" style={{ fontSize: '1rem', fontWeight: 600 }}>
              Filtro de destinatarios
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Por equipo, rol o asistencia
            </small>
          </div>
        </div>

        <div className="status-step-card" style={{ borderLeft: '3px solid var(--color-primary-600)' }}>
          <div>
            <div className="status-step-title">Apartado 3</div>
            <div className="status-step-count" style={{ fontSize: '1rem', fontWeight: 600 }}>
              Historial de entregas
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Logs de envío vía Gmail API
            </small>
          </div>
        </div>
      </div>

      {/* Filtros de búsqueda / acciones */}
      <div className="filter-strip">
        <div className="filter-input">
          <Icon name="search" />
          <input type="text" placeholder="Buscar por asunto o remitente..." disabled />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-disabled"
          style={{ opacity: 0.65 }}
          disabled
        >
          <Icon name="send" />
          <span>Nuevo comunicado (Pendiente)</span>
        </button>
      </div>

      {/* Área de tabla y Estado vacío */}
      <div className="content-box">
        <div className="table-container" style={{ marginBottom: '1.5rem', opacity: 0.65 }}>
          <table className="table-mock">
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
                <td>
                  <span className="badge-demo">Pendiente</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="empty-state">
          <div className="empty-icon-box">
            <Icon name="announcements" />
          </div>
          <h3 className="empty-title">Sin comunicados registrados</h3>
          <p className="empty-desc">
            En la siguiente fase se conectará el servicio de mensajería con <strong>Gmail / MailApp</strong> para programar recordatorios, confirmaciones de asistencia y avisos de premiación.
          </p>
          <div className="integration-preview-badge">
            <Icon name="info" />
            <span>Estado: Módulo listo para configuración de plantillas y backend</span>
          </div>
        </div>
      </div>
    </>
  );
};

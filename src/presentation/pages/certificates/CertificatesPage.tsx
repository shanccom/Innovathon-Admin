import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';

export const CertificatesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Gestión de Certificados - Innovathon Manager';
  }, []);

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Gestión de certificados</h1>
          <p className="page-subtitle">
            Supervisa la generación automática, firma digital, recepción y entrega de acreditaciones.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/" className="btn btn-secondary">
            <Icon name="arrowLeft" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </div>

      {/* Espacios visuales para los futuros estados */}
      <div className="status-cards-row">
        <div className="status-step-card">
          <div className="status-step-icon pending">
            <Icon name="clock" />
          </div>
          <div>
            <div className="status-step-title">Pendiente de generación</div>
            <div className="status-step-count">—</div>
          </div>
        </div>

        <div className="status-step-card">
          <div className="status-step-icon signing">
            <Icon name="penTool" />
          </div>
          <div>
            <div className="status-step-title">Pendiente de firma</div>
            <div className="status-step-count">—</div>
          </div>
        </div>

        <div className="status-step-card">
          <div className="status-step-icon signed">
            <Icon name="award" />
          </div>
          <div>
            <div className="status-step-title">Firmado</div>
            <div className="status-step-count">—</div>
          </div>
        </div>

        <div className="status-step-card">
          <div className="status-step-icon delivered">
            <Icon name="mailCheck" />
          </div>
          <div>
            <div className="status-step-title">Entregado al participante</div>
            <div className="status-step-count">—</div>
          </div>
        </div>
      </div>

      {/* Filtros de certificados */}
      <div className="filter-strip">
        <div className="filter-input">
          <Icon name="search" />
          <input
            type="text"
            placeholder="Buscar certificado por nombre o código..."
            disabled
          />
        </div>
        <select className="filter-select" disabled>
          <option>Todos los estados</option>
          <option>Pendiente de firma</option>
          <option>Firmados</option>
          <option>Entregados</option>
        </select>
        <button type="button" className="btn btn-secondary btn-sm btn-disabled" disabled>
          Generar lote (Fase posterior)
        </button>
      </div>

      {/* Área de tabla y Estado vacío */}
      <div className="content-box">
        <div className="table-container" style={{ marginBottom: '1.5rem', opacity: 0.65 }}>
          <table className="table-mock">
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
                <td>
                  <span className="badge-demo">Pendiente</span>
                </td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="empty-state">
          <div className="empty-icon-box">
            <Icon name="fileText" />
          </div>
          <h3 className="empty-title">Sin certificados procesados</h3>
          <p className="empty-desc">
            En la siguiente fase se conectará con plantillas en <strong>Google Docs</strong> y carpetas
            organizadas en <strong>Google Drive</strong> para emitir y firmar certificados en PDF.
          </p>
          <div className="integration-preview-badge">
            <Icon name="info" />
            <span>Estado: Arquitectura de estados y diseño de módulo preparados</span>
          </div>
        </div>
      </div>
    </>
  );
};

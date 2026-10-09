import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_STATS, MODULES_INFO } from '../../../infrastructure/state/demo-state';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useConfig } from '../../../application/hooks/useConfig';
import { Icon } from '../../components/common/Icon';

export const DashboardPage: React.FC = () => {
  const { participants, loading, status, error, refresh } = useParticipants();
  const { config, getSpreadsheetUrl } = useConfig();

  useEffect(() => {
    document.title = 'Panel principal - Innovathon Manager';
  }, []);

  const isParticipantsConnected = status.state === 'connected' && participants.length > 0;
  const isPermissionDenied = status.errorType === 'PERMISSION_DENIED';

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Panel principal</h1>
          <p className="page-subtitle">Gestiona las operaciones de Innovathon Mollendo desde un solo lugar</p>
        </div>
        <div className="page-actions">
          <Link
            to="/configuracion"
            className="btn btn-secondary btn-sm"
            title="Configurar conexión con Google Sheets"
          >
            <Icon name="settings" />
            <span>Conexión Google Sheets</span>
          </Link>
        </div>
      </div>

      {/* Resumen Operativo */}
      <section className="stats-grid" aria-label="Tarjetas de resumen">
        {DEMO_STATS.map((stat) => {
          const isParticipants = stat.id === 'participants';

          return (
            <div className="stat-card" id={`card-${stat.id}`} key={stat.id}>
              <div className="stat-card-header">
                <span className="stat-card-title">{stat.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isParticipants && (
                    <button
                      className={`sync-btn ${loading ? 'spinning' : ''}`}
                      id="btn-sync-participants"
                      title="Sincronizar con hoja de Google Sheets"
                      type="button"
                      onClick={() => refresh()}
                      disabled={loading}
                    >
                      <Icon name="refresh" />
                    </button>
                  )}
                  <div className="stat-card-icon">
                    <Icon name={stat.icon} />
                  </div>
                </div>
              </div>

              <div className="stat-card-value" id={`val-${stat.id}`}>
                {isParticipants ? (
                  loading && participants.length === 0 ? (
                    <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>Cargando...</span>
                  ) : isParticipantsConnected ? (
                    participants.length
                  ) : (
                    '—'
                  )
                ) : (
                  stat.value
                )}
              </div>

              <div className="stat-card-meta" id={`meta-${stat.id}`}>
                {isParticipants ? (
                  isParticipantsConnected ? (
                    <>
                      <span className="badge-live">En vivo</span>
                      <span>
                        Sincronizado con «{config.sheetName}» ({participants.length} participantes)
                      </span>
                    </>
                  ) : status.state === 'error' || error ? (
                    <>
                      <Link to="/configuracion" style={{ textDecoration: 'none' }}>
                        <span className="badge-warning">Configurar</span>
                      </Link>
                      <span>
                        {isPermissionDenied ? 'Hoja privada en Drive' : 'Error de conexión'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="badge-demo">Demo</span>
                      <span>{stat.note}</span>
                    </>
                  )
                ) : (
                  <>
                    <span className="badge-demo">Demo</span>
                    <span>{stat.note}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Módulos de Gestión */}
      <section>
        <div className="section-heading-row">
          <h2 className="section-title">Módulos de gestión</h2>
          <span className="section-desc">Selecciona un área para comenzar</span>
        </div>
        <div className="modules-grid">
          {MODULES_INFO.map((mod) => (
            <Link to={mod.path} className="module-card" key={mod.id}>
              <div className="module-icon-bubble">
                <Icon name={mod.icon} />
              </div>
              <h3 className="module-card-title">{mod.title}</h3>
              <p className="module-card-desc">{mod.description}</p>
              <div className="module-card-footer">
                <span className="module-action-link">
                  <span>{mod.actionText}</span>
                  <Icon name="arrowRight" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Actividad Reciente / Estado de Conexión */}
      <section>
        <div className="section-heading-row">
          <h2 className="section-title">Actividad y sincronización</h2>
        </div>
        <div className="content-box" id="dashboard-activity-container">
          {loading && participants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-box">
                <Icon name="refresh" className="spinning" />
              </div>
              <h3 className="empty-title">Conectando con Google Sheets</h3>
              <p className="empty-desc">
                Sincronizando los datos del sistema con la hoja de cálculo de Google Sheets...
              </p>
            </div>
          ) : isParticipantsConnected ? (
            <>
              <div
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--color-midnight)',
                  }}
                >
                  Últimos participantes registrados ({participants.length} en total)
                </h3>
                <Link to="/asistencias" className="btn btn-secondary btn-sm">
                  Ver todos en Asistencias
                </Link>
              </div>
              <div className="table-container">
                <table className="table-mock">
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
                    {participants.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <code>{p.dni}</code>
                        </td>
                        <td>
                          <strong>{p.nombre}</strong>
                        </td>
                        <td>{p.equipo}</td>
                        <td>{p.rol}</td>
                        <td>
                          <span className="badge-live">Registrado</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : status.state === 'error' || error ? (
            <div className="alert-box alert-warning">
              <Icon name="alertCircle" />
              <div>
                <strong>Conexión con Google Sheets pendiente de autorización:</strong>
                <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: '#78350f' }}>
                  La hoja de cálculo está protegida por los permisos de Google Drive de la organización.
                  Para que el panel la lea de forma automática, puedes{' '}
                  <strong>compartirla como &quot;Cualquier persona con el enlace (Lector)&quot;</strong> o{' '}
                  <strong>configurar el conector de Google Apps Script</strong>.
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                  <Link to="/configuracion" className="btn btn-primary btn-sm">
                    <Icon name="settings" />
                    <span>Ver pasos de conexión</span>
                  </Link>
                  <a
                    href={getSpreadsheetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Icon name="externalLink" />
                    <span>Abrir hoja en Google Sheets</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon-box">
                <Icon name="inbox" />
              </div>
              <h3 className="empty-title">Sin actividad reciente</h3>
              <p className="empty-desc">
                Sincronizando los datos del sistema con la hoja de cálculo de Google Sheets...
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

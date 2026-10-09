import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useAttendance } from '../../../application/hooks/useAttendance';
import { useConfig } from '../../../application/hooks/useConfig';
import { Icon } from '../../components/common/Icon';

export const AttendancePage: React.FC = () => {
  const [session, setSession] = useState<string>('s1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { participants, loading, status, refresh } = useParticipants();
  const { records, toggleAttendance } = useAttendance(session);
  const { getSpreadsheetUrl } = useConfig();

  useEffect(() => {
    document.title = 'Control de Asistencias - Innovathon Manager';
  }, []);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.dni.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.equipo.toLowerCase().includes(q) ||
        p.correo.toLowerCase().includes(q)
    );
  }, [participants, searchQuery]);

  const presentCount = useMemo(() => {
    return participants.filter((p) => records[p.id]?.status === 'present').length;
  }, [participants, records]);

  const totalCount = participants.length;
  const pendingCount = Math.max(0, totalCount - presentCount);

  const isConnected = status.state === 'connected' && participants.length > 0;
  const hasError = status.state === 'error' && participants.length === 0;

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Control de asistencia</h1>
          <p className="page-subtitle">
            Registra la asistencia de los participantes y consulta su historial por sesión.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn btn-secondary btn-sm ${loading ? 'spinning' : ''}`}
            id="btn-refresh-attendance"
            type="button"
            onClick={() => refresh()}
            disabled={loading}
          >
            <Icon name="refresh" />
            <span>Actualizar registros</span>
          </button>
          <Link to="/" className="btn btn-secondary btn-sm">
            <Icon name="arrowLeft" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="filter-strip">
        <div className="filter-input" style={{ flex: 1 }}>
          <Icon name="search" />
          <input
            type="text"
            id="attendance-search"
            placeholder="Buscar por DNI, nombres o equipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          id="attendance-session-select"
          value={session}
          onChange={(e) => setSession(e.target.value)}
        >
          <option value="s1">Sesión: Jornada 1 - Apertura</option>
          <option value="s2">Sesión: Jornada 2 - Hackathon</option>
          <option value="s3">Sesión: Jornada 3 - Clausura</option>
        </select>
      </div>

      {/* Indicadores de asistencia rápida */}
      <div
        className="status-cards-row"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}
        id="attendance-counters"
      >
        <div className="status-step-card">
          <div className="status-step-icon pending">
            <Icon name="users" />
          </div>
          <div>
            <div className="status-step-title">Inscritos en «Registros»</div>
            <div className="status-step-count" id="count-total">
              {isConnected ? totalCount : '—'}
            </div>
          </div>
        </div>

        <div className="status-step-card">
          <div
            className="status-step-icon"
            style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
            }}
          >
            <Icon name="checkCircle" />
          </div>
          <div>
            <div className="status-step-title">Presentes en sesión</div>
            <div className="status-step-count" id="count-present">
              {isConnected ? presentCount : 0}
            </div>
          </div>
        </div>

        <div className="status-step-card">
          <div className="status-step-icon pending">
            <Icon name="clock" />
          </div>
          <div>
            <div className="status-step-title">Pendientes de ingreso</div>
            <div className="status-step-count" id="count-pending">
              {isConnected ? pendingCount : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Área de tabla y Estado */}
      <div className="content-box">
        {loading && participants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            Cargando participantes desde Google Sheets...
          </div>
        ) : hasError ? (
          <div className="empty-state">
            <div className="empty-icon-box" style={{ color: '#b45309' }}>
              <Icon name="alertCircle" />
            </div>
            <h3 className="empty-title">Hoja de cálculo requiere autorización</h3>
            <p className="empty-desc">
              No se pudo leer la lista de participantes porque la hoja de cálculo de Google Drive no
              está en modo público o requiere un conector Apps Script.
            </p>
            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <Link to="/configuracion" className="btn btn-primary btn-sm">
                <Icon name="settings" />
                <span>Ver instrucciones de conexión</span>
              </Link>
              <a
                href={getSpreadsheetUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Icon name="externalLink" />
                <span>Abrir Google Sheets</span>
              </a>
            </div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-box">
              <Icon name="search" />
            </div>
            <h3 className="empty-title">Sin resultados</h3>
            <p className="empty-desc">
              No se encontraron participantes que coincidan con &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-mock">
              <thead>
                <tr>
                  <th>DNI / Identificación</th>
                  <th>Participante</th>
                  <th>Equipo / Proyecto</th>
                  <th>Hora de Entrada</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => {
                  const att = records[p.id];
                  const isPresent = att && att.status === 'present';

                  return (
                    <tr key={p.id}>
                      <td>
                        <code>{p.dni}</code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                        <small style={{ color: 'var(--text-muted)' }}>
                          {p.correo !== '—' ? p.correo : p.rol}
                        </small>
                      </td>
                      <td>{p.equipo}</td>
                      <td>{isPresent ? att.timestamp : '—'}</td>
                      <td>
                        {isPresent ? (
                          <span className="badge-live">Presente</span>
                        ) : (
                          <span className="badge-demo">Pendiente</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn btn-sm ${isPresent ? 'btn-secondary' : 'btn-primary'}`}
                          type="button"
                          onClick={() => toggleAttendance(p.id, att?.status)}
                        >
                          {isPresent ? 'Desmarcar' : 'Registrar entrada'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

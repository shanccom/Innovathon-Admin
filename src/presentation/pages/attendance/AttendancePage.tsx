import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useAttendance } from '../../../application/hooks/useAttendance';
import { useConfig } from '../../../application/hooks/useConfig';
import { Participant } from '../../../domain/models/participant.model';
import { AttendanceSessionMap } from '../../../domain/models/attendance.model';
import { Icon } from '../../components/common/Icon';
import { QrCameraScanner } from '../../components/attendance/QrCameraScanner';
import { playAudioFeedback } from '../../utils/audio';

interface ScanFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
  participant?: Participant;
  timestamp?: string;
}

export const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scanCodeInput, setScanCodeInput] = useState<string>('');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);

  const { participants, loading, status, refresh } = useParticipants();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    addSession,
    deleteSession,
    clearSession,
    records,
    allRecords,
    markPresent,
    toggleAttendance,
  } = useAttendance();
  const { config, getSpreadsheetUrl } = useConfig();

  useEffect(() => {
    document.title = 'Control de Asistencias - Innovathon Manager';
  }, []);

  // Autofoco en el input de escaneo al cargar o cambiar sesión
  useEffect(() => {
    if (!showCamera) {
      scanInputRef.current?.focus();
    }
  }, [activeSessionId, showCamera]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.codigo.toLowerCase().includes(q) ||
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

  const isConnected = status.state === 'connected';
  const hasError = status.state === 'error' && participants.length === 0;

  // Procesamiento del código escaneado o ingresado
  const handleProcessCode = (rawCode: string) => {
    const clean = rawCode.trim();
    if (!clean) return;

    // Buscar participante por Código (preferente) o DNI
    const found = participants.find(
      (p) =>
        p.codigo.toLowerCase() === clean.toLowerCase() ||
        p.dni.toLowerCase() === clean.toLowerCase() ||
        p.id.toLowerCase() === clean.toLowerCase()
    );

    if (!found) {
      if (soundEnabled) playAudioFeedback('error');
      setFeedback({
        type: 'error',
        message: `Código o DNI «${clean}» no encontrado en el padrón de participantes.`,
      });
      return;
    }

    // Verificar si ya está presente en la sesión activa
    const existing = records[found.id];
    if (existing && existing.status === 'present') {
      if (soundEnabled) playAudioFeedback('warning');
      setFeedback({
        type: 'warning',
        message: `El participante ya registró asistencia en ${activeSession?.name || 'esta sesión'}.`,
        participant: found,
        timestamp: existing.timestamp,
      });
      return;
    }

    // Registrar asistencia
    markPresent(found.id);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (soundEnabled) playAudioFeedback('success');
    setFeedback({
      type: 'success',
      message: `¡Asistencia registrada con éxito!`,
      participant: found,
      timestamp: nowTime,
    });
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessCode(scanCodeInput);
    setScanCodeInput('');
    scanInputRef.current?.focus();
  };

  const handleCreateSession = () => {
    const defaultName = `Asistencia ${sessions.length + 1}`;
    const name = window.prompt('Ingresa el nombre de la nueva sesión de asistencia:', defaultName);
    if (name !== null) {
      addSession(name.trim() || defaultName);
    }
  };

  const handleDeleteCurrentSession = () => {
    if (sessions.length <= 1) {
      alert('Debe existir al menos una sesión de asistencia.');
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${activeSession?.name}"? Se perderán los registros de esta sesión.`
    );
    if (confirmed && activeSession) {
      deleteSession(activeSession.id);
    }
  };

  const handleClearCurrentSession = () => {
    const confirmed = window.confirm(
      `¿Deseas reiniciar todas las marcas de asistencia para "${activeSession?.name}"?`
    );
    if (confirmed && activeSession) {
      clearSession(activeSession.id);
      setFeedback(null);
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert('No hay participantes registrados para exportar.');
      return;
    }

    const headers = ['Código', 'DNI', 'Nombres y Apellidos', 'Equipo', 'Rol', ...sessions.map(s => s.name), 'Total Asistencias'];
    const rows = participants.map(p => {
      let count = 0;
      const sessionCols = sessions.map(s => {
        const rec = (allRecords as AttendanceSessionMap)[s.id]?.[p.id];
        if (rec?.status === 'present') {
          count++;
          return rec.timestamp || 'Presente';
        }
        return 'Ausente';
      });
      return [
        `"${p.codigo}"`,
        `"${p.dni}"`,
        `"${p.nombre}"`,
        `"${p.equipo}"`,
        `"${p.rol}"`,
        ...sessionCols.map(c => `"${c}"`),
        count,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asistencias_innovathon_mollendo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Control de asistencia</h1>
          <p className="page-subtitle">
            Escanea el código del participante o regístralo manualmente para cada una de las sesiones.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={handleExportCSV}
            title="Descargar reporte completo en CSV / Excel"
          >
            <Icon name="download" />
            <span>Exportar CSV</span>
          </button>
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

      {/* Selector y Gestión Dinámica de Sesiones de Asistencia */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-midnight)', marginRight: '0.25rem' }}>
            Sesión activa:
          </span>
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(s.id);
                  setFeedback(null);
                }}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.4rem 1rem',
                  fontSize: '0.825rem',
                  borderColor: isActive ? 'var(--color-purple)' : 'var(--border-medium)',
                }}
              >
                {s.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleCreateSession}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            title="Crear nueva sesión de asistencia (ej. Asistencia 4)"
          >
            <Icon name="plus" size={14} />
            <span>Nueva sesión</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={handleDeleteCurrentSession}
              className="btn btn-secondary btn-sm"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              title={`Eliminar sesión "${activeSession?.name}"`}
            >
              <Icon name="trash" size={14} />
              <span>Eliminar esta sesión</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClearCurrentSession}
            className="btn btn-secondary btn-sm"
            title="Limpiar todas las asistencias marcadas en esta sesión"
          >
            <span>Reiniciar marcas</span>
          </button>
        </div>
      </div>

      {/* Módulo de Escaneo Rápido de Código y Cámara */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-midnight)', margin: 0 }}>
              Toma de Asistencia: <span style={{ color: 'var(--color-purple)' }}>{activeSession?.name}</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Pasa el lector de código de barras/QR o ingresa el código del participante
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn btn-secondary btn-sm"
              title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
              style={{ opacity: soundEnabled ? 1 : 0.55 }}
            >
              <Icon name="volume2" size={16} />
              <span>{soundEnabled ? 'Sonido ON' : 'Sonido OFF'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCamera(!showCamera)}
              className={`btn btn-sm ${showCamera ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Icon name="camera" size={16} />
              <span>{showCamera ? 'Ocultar cámara' : 'Escanear con cámara QR'}</span>
            </button>
          </div>
        </div>

        {/* Cámara QR si está activa */}
        {showCamera && (
          <QrCameraScanner
            onScan={(code) => handleProcessCode(code)}
            onClose={() => setShowCamera(false)}
          />
        )}

        {/* Input de escaneo rápido con autofocus */}
        <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="filter-input" style={{ flex: 1, padding: '0.8rem 1.1rem', borderColor: 'var(--color-purple)' }}>
            <Icon name="qrCode" size={20} style={{ color: 'var(--color-purple)' }} />
            <input
              ref={scanInputRef}
              type="text"
              placeholder="Escanear código con pistola USB o escribir Código / DNI y presionar Enter..."
              value={scanCodeInput}
              onChange={(e) => setScanCodeInput(e.target.value)}
              style={{ fontSize: '1rem', fontWeight: 600 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.75rem' }}>
            <span>Registrar</span>
          </button>
        </form>

        {/* Tarjeta de Feedback Inmediato */}
        {feedback && (
          <div
            className={`alert-box ${
              feedback.type === 'success'
                ? 'alert-success'
                : feedback.type === 'warning'
                ? 'alert-warning'
                : 'alert-error'
            }`}
            style={{ marginTop: '1.25rem' }}
          >
            <Icon
              name={feedback.type === 'success' ? 'check' : 'alertCircle'}
              size={22}
              style={{ flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{feedback.message}</div>
              {feedback.participant && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.875rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <span>
                    <strong>Participante:</strong> {feedback.participant.nombre}
                  </span>
                  <span>
                    <strong>Código:</strong> <code>{feedback.participant.codigo}</code>
                  </span>
                  <span>
                    <strong>DNI:</strong> <code>{feedback.participant.dni}</code>
                  </span>
                  <span>
                    <strong>Equipo:</strong> {feedback.participant.equipo}
                  </span>
                  {feedback.timestamp && (
                    <span>
                      <strong>Hora de registro:</strong> {feedback.timestamp}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
              title="Cerrar aviso"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Indicadores de Asistencia de la Sesión Activa */}
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
            <div className="status-step-title">Presentes en {activeSession?.name}</div>
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
            <div className="status-step-title">Pendientes en {activeSession?.name}</div>
            <div className="status-step-count" id="count-pending">
              {isConnected ? pendingCount : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda en la Lista */}
      <div className="filter-strip">
        <div className="filter-input" style={{ flex: 1 }}>
          <Icon name="search" />
          <input
            type="text"
            id="attendance-search"
            placeholder="Filtrar tabla por Código, DNI, nombres o equipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Participantes */}
      <div className="content-box">
        {loading && participants.length === 0 && !isConnected ? (
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
        ) : participants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-box">
              <Icon name="users" />
            </div>
            <h3 className="empty-title">Sin participantes registrados</h3>
            <p className="empty-desc">
              La hoja «{config.sheetName}» está conectada correctamente, pero aún no contiene registros de participantes.
            </p>
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
                  <th>Código</th>
                  <th>DNI / Identificación</th>
                  <th>Participante</th>
                  <th>Equipo / Proyecto</th>
                  <th>Hora de Entrada ({activeSession?.name})</th>
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
                        <strong style={{ color: 'var(--color-purple)' }}>
                          <code>{p.codigo}</code>
                        </strong>
                      </td>
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

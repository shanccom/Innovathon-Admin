import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useAttendance } from '../../../application/hooks/useAttendance';
import { useConfig } from '../../../application/hooks/useConfig';
import { Participant } from '../../../domain/models/participant.model';
import { AttendanceSessionMap } from '../../../domain/models/attendance.model';
import { Icon } from '../../components/common/Icon';
import { QrCameraScanner } from '../../components/attendance/QrCameraScanner';
import { SelfCheckinQrModal } from '../../components/attendance/SelfCheckinQrModal';
import { playAudioFeedback } from '../../utils/audio';
import { appsScriptAttendanceClient } from '../../../infrastructure/api/apps-script-attendance.client';

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
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);

  const { participants, loading, status, refresh } = useParticipants();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
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
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Limpiar timer de feedback al desmontar
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const triggerFeedback = (newFeedback: ScanFeedback) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback(newFeedback);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
    }, 3000); // Se oculta automáticamente tras 3 segundos
  };

  // Procesamiento del código escaneado o ingresado
  const handleProcessCode = (rawCode: string) => {
    let clean = rawCode.trim();
    if (!clean) return;

    // Si el QR escaneado es una URL (ej. https://.../#/checkin?code=IM-2026-0003 o dni=72859994)
    if (clean.includes('?') || clean.includes('/')) {
      const urlCodeMatch = clean.match(/[?&](?:code|codigo|dni|id)=([A-Za-z0-9_-]+)/i);
      if (urlCodeMatch && urlCodeMatch[1]) {
        clean = urlCodeMatch[1].trim();
      } else {
        const pathPartMatch = clean.match(/(IM-\d{4}-\d+|[0-9]{8})/i);
        if (pathPartMatch && pathPartMatch[1]) {
          clean = pathPartMatch[1].trim();
        }
      }
    }

    const cleanUpper = clean.toUpperCase();
    const digitsOnly = clean.replace(/\D/g, '');
    const dniPadded = digitsOnly.length > 0 && digitsOnly.length <= 8 ? digitsOnly.padStart(8, '0') : '';

    // Buscar participante por Código (preferente), DNI exacto, DNI normalizado o ID
    const found = participants.find((p) => {
      const pCod = p.codigo.trim().toUpperCase();
      const pDni = p.dni.trim();
      const pDniPadded = pDni.replace(/\D/g, '').padStart(8, '0');
      const pId = p.id.toLowerCase();

      return (
        pCod === cleanUpper ||
        pDni === clean ||
        (dniPadded !== '' && pDniPadded === dniPadded) ||
        pId === clean.toLowerCase()
      );
    });

    if (!found) {
      if (soundEnabled) playAudioFeedback('error');
      triggerFeedback({
        type: 'error',
        message: `Código o DNI «${clean}» no encontrado en el padrón de participantes.`,
      });
      return;
    }

    // Verificar si ya está presente en la sesión activa
    const existing = records[found.id];
    if (existing && existing.status === 'present') {
      if (soundEnabled) playAudioFeedback('warning');
      triggerFeedback({
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
    
    // Sincronizar en segundo plano con la hoja Asistencias en Google Sheets (Formato Matriz)
    appsScriptAttendanceClient.syncToMatrix({
      action: 'markAttendance',
      codigo: found.codigo,
      dni: found.dni,
      nombre: found.nombre,
      equipo: found.equipo,
      sessionId: activeSessionId,
      sessionName: activeSession?.name || 'Asistencia 1',
      timestamp: nowTime,
    });

    if (soundEnabled) playAudioFeedback('success');
    triggerFeedback({
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

  const handleClearCurrentSession = () => {
    const confirmed = window.confirm(
      `¿Deseas reiniciar todas las marcas de asistencia para "${activeSession?.name}"? Esto también limpiará la columna en Google Sheets.`
    );
    if (confirmed && activeSession) {
      clearSession(activeSession.id);
      appsScriptAttendanceClient.clearSessionColumn(activeSession.name, activeSession.id);
      setFeedback({
        type: 'warning',
        message: `Se han reiniciado todas las marcas de "${activeSession.name}" en la web y en Google Sheets.`,
      });
    }
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
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => setShowQrModal(true)}
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
            title="Mostrar o proyectar el código QR para que los participantes se registren con su celular"
          >
            <Icon name="maximize" />
            <span>Proyectar QR Auto Check-in</span>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleClearCurrentSession}
            className="btn btn-secondary btn-sm"
            title="Limpiar todas las marcas de asistencia para la sesión seleccionada"
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
              <span>{showCamera ? 'Ocultar cámara' : 'Escanear con cámara (Barras)'}</span>
            </button>
          </div>
        </div>

        {/* Lector de Código de Barras por cámara si está activo */}
        {showCamera && (
          <div style={{ marginBottom: '1.25rem' }}>
            <QrCameraScanner
              onScan={(code) => handleProcessCode(code)}
              onClose={() => setShowCamera(false)}
            />
          </div>
        )}

        {/* Input de escaneo rápido estilo torniquete con autofocus continuo */}
        <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            className="filter-input"
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              borderColor: 'var(--color-purple)',
              boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.1)',
              backgroundColor: '#fff',
            }}
          >
            <Icon name="qrCode" size={24} style={{ color: 'var(--color-purple)' }} />
            <input
              ref={scanInputRef}
              type="text"
              placeholder="Escanea aquí con pistola USB o escribe Código / DNI y presiona Enter..."
              value={scanCodeInput}
              onChange={(e) => setScanCodeInput(e.target.value)}
              style={{ fontSize: '1.05rem', fontWeight: 600 }}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', fontSize: '0.95rem' }}>
            <span>Registrar</span>
          </button>
        </form>

        {/* Banner Grande de Confirmación Rápida Estilo Universidad (Torniquete) */}
        {feedback && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor:
                feedback.type === 'success'
                  ? '#ecfdf5'
                  : feedback.type === 'warning'
                  ? '#fffbeb'
                  : '#fef2f2',
              border: `2px solid ${
                feedback.type === 'success'
                  ? '#10b981'
                  : feedback.type === 'warning'
                  ? '#f59e0b'
                  : '#ef4444'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              animation: 'fadeIn 0.15s ease-in-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor:
                    feedback.type === 'success'
                      ? '#10b981'
                      : feedback.type === 'warning'
                      ? '#f59e0b'
                      : '#ef4444',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon
                  name={feedback.type === 'success' ? 'check' : 'alertCircle'}
                  size={28}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color:
                      feedback.type === 'success'
                        ? '#065f46'
                        : feedback.type === 'warning'
                        ? '#92400e'
                        : '#991b1b',
                  }}
                >
                  {feedback.message}
                </div>

                {feedback.participant && (
                  <div
                    style={{
                      marginTop: '0.35rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      fontSize: '0.925rem',
                      color: 'var(--color-midnight)',
                    }}
                  >
                    <span>
                      <strong>Estudiante:</strong>{' '}
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {feedback.participant.nombre}
                      </span>
                    </span>
                    <span>
                      <strong>Código:</strong>{' '}
                      <code style={{ fontSize: '0.95rem', color: 'var(--color-purple)', fontWeight: 700 }}>
                        {feedback.participant.codigo}
                      </code>
                    </span>
                    <span>
                      <strong>DNI:</strong> <code>{feedback.participant.dni}</code>
                    </span>
                    {feedback.timestamp && (
                      <span>
                        <strong>Hora:</strong> {feedback.timestamp}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.5rem',
              }}
              title="Cerrar notificación"
            >
              <Icon name="x" size={20} />
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
              {loading && participants.length === 0 ? '...' : totalCount > 0 ? totalCount : isConnected ? 0 : '—'}
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
                  <th>Hora ({activeSession?.name})</th>
                  <th style={{ textAlign: 'center' }}>Total Asistencias</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => {
                  const att = records[p.id];
                  const isPresent = att && att.status === 'present';

                  // Calcular total de asistencias acumuladas en todas las sesiones
                  const totalAsistenciasParticipant = sessions.filter(
                    (s) => (allRecords as AttendanceSessionMap)[s.id]?.[p.id]?.status === 'present'
                  ).length;

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
                      <td>{isPresent ? att.timestamp : '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '28px',
                            height: '24px',
                            padding: '0 8px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            backgroundColor: totalAsistenciasParticipant > 0 ? '#ecfdf5' : 'var(--bg-card)',
                            color: totalAsistenciasParticipant > 0 ? '#047857' : 'var(--text-muted)',
                            border: `1px solid ${totalAsistenciasParticipant > 0 ? '#a7f3d0' : 'var(--border-light)'}`,
                          }}
                        >
                          {totalAsistenciasParticipant} / {sessions.length}
                        </span>
                      </td>
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
                          onClick={() => {
                            const nextStatus = toggleAttendance(p.id, att?.status);
                            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            appsScriptAttendanceClient.syncToMatrix({
                              action: nextStatus === 'present' ? 'markAttendance' : 'unmarkAttendance',
                              codigo: p.codigo,
                              dni: p.dni,
                              nombre: p.nombre,
                              sessionId: activeSessionId,
                              sessionName: activeSession?.name || 'Asistencia 1',
                              timestamp: nextStatus === 'present' ? nowTime : '',
                            });
                          }}
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

      {/* Modal para Proyectar / Compartir el Código QR de Auto Check-in */}
      <SelfCheckinQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        activeSessionId={activeSessionId}
        sessions={sessions}
        onSelectSession={(id) => setActiveSessionId(id)}
      />
    </>
  );
};

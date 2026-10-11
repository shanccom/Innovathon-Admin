import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useAttendance } from '../../../application/hooks/useAttendance';
import { useConfig } from '../../../application/hooks/useConfig';
import { Participant } from '../../../domain/models/participant.model';
import { AttendanceSessionMap } from '../../../domain/models/attendance.model';
import { Icon } from '../../components/common/Icon';
import { SelfCheckinQrModal } from '../../components/attendance/SelfCheckinQrModal';
import { appsScriptAttendanceClient } from '../../../infrastructure/api/apps-script-attendance.client';

interface ScanFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
  participant?: Participant;
  timestamp?: string;
}

export const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'pending'>('all');
  const [scanCodeInput, setScanCodeInput] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
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
    scanInputRef.current?.focus();
  }, [activeSessionId]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return participants.filter((p) => {
      // Filtro de texto
      const matchesSearch =
        !q ||
        p.codigo.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.equipo.toLowerCase().includes(q) ||
        p.correo.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Filtro de estado por clic en tarjetas
      const isPresent = records[p.id]?.status === 'present';
      if (statusFilter === 'present') return isPresent;
      if (statusFilter === 'pending') return !isPresent;
      return true;
    });
  }, [participants, searchQuery, statusFilter, records]);

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
      triggerFeedback({
        type: 'error',
        message: `Código o DNI «${clean}» no encontrado en el padrón de participantes.`,
      });
      return;
    }

    // Verificar si ya está presente en la sesión activa
    const existing = records[found.id];
    if (existing && existing.status === 'present') {
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
      {/* Encabezado Administrativo Limpio y Sobrio */}
      <div className="page-header-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            Control de Asistencia
          </h1>
          <p className="page-subtitle" style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Gestiona la toma de asistencia por sesión y genera el QR para los participantes.
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Botón QR: sobrio, profesional, pero claramente visible */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="btn btn-sm"
            style={{
              backgroundColor: '#4338CA',
              color: '#FFFFFF',
              border: '1px solid #3730A3',
              borderRadius: '8px',
              padding: '0.5rem 0.95rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
            title="Abrir y proyectar el código QR de autoasistencia"
          >
            <Icon name="maximize" size={16} />
            <span>Código QR de Asistencia</span>
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className={`btn btn-secondary btn-sm ${loading ? 'spinning' : ''}`}
            style={{
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Icon name="refresh" size={15} />
            <span>Actualizar</span>
          </button>

          <Link
            to="/"
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Icon name="arrowLeft" size={15} />
            <span>Panel</span>
          </Link>
        </div>
      </div>

      {/* Selector de Sesiones Estilo Pill Moderno */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sesión:
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
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  backgroundColor: isActive ? '#eef2ff' : '#f8fafc',
                  color: isActive ? '#4338ca' : '#475569',
                  transition: 'all 0.15s ease',
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
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid #fee2e2',
              backgroundColor: '#fff5f5',
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Reiniciar asistencias de la sesión activa"
          >
            Reiniciar marcas
          </button>
        </div>
      </div>

      {/* Tarjeta de Registro Manual Rápido (Minimalista y Clara) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
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
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Registro Directo • <span style={{ color: '#4f46e5' }}>{activeSession?.name}</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Digita el DNI o Código del participante y presiona Enter
            </p>
          </div>
        </div>

        {/* Input de Registro */}
        <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '14px',
              padding: '0.75rem 1.25rem',
              gap: '0.75rem',
              transition: 'border-color 0.15s ease',
            }}
          >
            <Icon name="attendance" size={22} style={{ color: '#4f46e5' }} />
            <input
              ref={scanInputRef}
              type="text"
              placeholder="Ingresa DNI (ej. 72859994) o Código (ej. IM-2026-0003)..."
              value={scanCodeInput}
              onChange={(e) => setScanCodeInput(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
              }}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0 1.75rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
            }}
          >
            Registrar
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

      {/* Indicadores Compactos y Funcionales (Filtran la tabla al hacer clic) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
        id="attendance-counters"
      >
        {/* Tarjeta: Total Inscritos */}
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            backgroundColor: statusFilter === 'all' ? '#F8FAFC' : '#FFFFFF',
            border: `1.5px solid ${statusFilter === 'all' ? '#4F46E5' : '#E2E8F0'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: statusFilter === 'all' ? '0 2px 4px rgba(79, 70, 229, 0.08)' : 'none',
          }}
          title="Ver todos los participantes"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="users" size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Total Inscritos
              </div>
              <div style={{ fontSize: '0.75rem', color: statusFilter === 'all' ? '#4F46E5' : '#94A3B8' }}>
                {statusFilter === 'all' ? 'Mostrando todos' : 'Clic para filtrar'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {loading && participants.length === 0 ? '...' : totalCount}
          </div>
        </div>

        {/* Tarjeta: Presentes */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}
          style={{
            backgroundColor: statusFilter === 'present' ? '#F0FDF4' : '#FFFFFF',
            border: `1.5px solid ${statusFilter === 'present' ? '#16A34A' : '#E2E8F0'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: statusFilter === 'present' ? '0 2px 4px rgba(22, 163, 74, 0.08)' : 'none',
          }}
          title="Filtrar solo participantes con asistencia marcada"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="checkCircle" size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Presentes ({activeSession?.name})
              </div>
              <div style={{ fontSize: '0.75rem', color: statusFilter === 'present' ? '#16A34A' : '#94A3B8' }}>
                {statusFilter === 'present' ? 'Filtro activo' : 'Clic para filtrar'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A', lineHeight: 1 }}>
            {presentCount}
          </div>
        </div>

        {/* Tarjeta: Pendientes */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          style={{
            backgroundColor: statusFilter === 'pending' ? '#FFFBEB' : '#FFFFFF',
            border: `1.5px solid ${statusFilter === 'pending' ? '#D97706' : '#E2E8F0'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: statusFilter === 'pending' ? '0 2px 4px rgba(217, 119, 6, 0.08)' : 'none',
          }}
          title="Filtrar participantes que aún no registran asistencia"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="clock" size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Pendientes ({activeSession?.name})
              </div>
              <div style={{ fontSize: '0.75rem', color: statusFilter === 'pending' ? '#D97706' : '#94A3B8' }}>
                {statusFilter === 'pending' ? 'Filtro activo' : 'Clic para filtrar'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', lineHeight: 1 }}>
            {pendingCount}
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

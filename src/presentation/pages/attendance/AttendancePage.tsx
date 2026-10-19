import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useAttendance, normalizeAttendanceCode } from '../../../application/hooks/useAttendance';
import { useConfig } from '../../../application/hooks/useConfig';
import { AttendanceSessionMap } from '../../../domain/models/attendance.model';
import { Icon } from '../../components/common/Icon';
import { AttendanceQrModal } from '../../components/attendance/AttendanceQrModal';
import { MIN_ATTENDANCE_FOR_CERTIFICATE } from '../../../infrastructure/config/attendance-forms.config';

const PAGE_SIZE = 8;

const pagerButtonStyle: React.CSSProperties = {
  borderRadius: '8px',
  padding: '0.4rem 0.7rem',
  fontSize: '0.8rem',
  minWidth: '34px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  const { participants, loading, status, refresh } = useParticipants();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    records,
    allRecords,
    source,
    refreshAll,
    markManualAttendance,
  } = useAttendance(participants);
  const { config, getSpreadsheetUrl } = useConfig();

  const handleRefresh = () => {
    refresh();
    refreshAll();
  };

  useEffect(() => {
    document.title = 'Control de Asistencias - Innovathon Manager';
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return participants.filter((p) => {
      const matchesSearch =
        !q ||
        p.codigo.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.equipo.toLowerCase().includes(q) ||
        p.correo.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const isPresent = records[normalizeAttendanceCode(p.codigo)]?.status === 'present';
      if (statusFilter === 'present') return isPresent;
      if (statusFilter === 'pending') return !isPresent;
      return true;
    });
  }, [participants, searchQuery, statusFilter, records]);

  // Reinicia a la primera página al cambiar búsqueda, filtro o sesión.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeSessionId]);

  const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = filteredParticipants.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const lastIndex = Math.min(safePage * PAGE_SIZE, filteredParticipants.length);

  const pageItems = useMemo(
    () => filteredParticipants.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredParticipants, safePage]
  );

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i += 1) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  const presentCount = useMemo(() => {
    return participants.filter((p) => records[normalizeAttendanceCode(p.codigo)]?.status === 'present').length;
  }, [participants, records]);

  const totalCount = participants.length;
  const pendingCount = Math.max(0, totalCount - presentCount);

  const isConnected = status.state === 'connected';
  const hasError = status.state === 'error' && participants.length === 0;

  return (
    <>
      {/* Encabezado Administrativo Limpio y Sobrio */}
      <div className="page-header-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            Control de Asistencia
          </h1>
          <p className="page-subtitle" style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {source === 'sheets'
              ? 'Asistencia en tiempo real sincronizada desde Google Forms y la matriz oficial de Google Sheets.'
              : 'Asistencia en modo local (esperando conexión con la matriz de Google Sheets).'}
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: '8px',
              padding: '0.5rem 0.95rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#4F46E5',
              borderColor: '#4F46E5',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
            }}
            title="Proyectar código QR oficial en el ecran del auditorio para escaneo de participantes"
          >
            <Icon name="scan" size={16} />
            <span>Proyectar QR</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
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
                onClick={() => setActiveSessionId(s.id)}
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
          <>
            <div className="table-container">
              <table className="table-mock">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>DNI / Identificación</th>
                    <th>Participante</th>
                    <th style={{ textAlign: 'center' }}>Sesión ({activeSession?.name})</th>
                    <th style={{ textAlign: 'center' }}>Total Asistencias</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Contingencia</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => {
                    const keyCod = normalizeAttendanceCode(p.codigo);
                    const keyDni = normalizeAttendanceCode(p.dni);
                    const att = records[keyCod] || records[keyDni];
                    const isPresent = att && att.status === 'present';

                    const totalAsistenciasParticipant = sessions.filter(
                      (s) => {
                        const sMap = (allRecords as AttendanceSessionMap)[s.id];
                        return sMap?.[keyCod]?.status === 'present' || sMap?.[keyDni]?.status === 'present';
                      }
                    ).length;

                    const isCertified = totalAsistenciasParticipant >= MIN_ATTENDANCE_FOR_CERTIFICATE;

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
                        <td style={{ textAlign: 'center' }}>
                          {isPresent ? (
                            <span style={{ color: '#16A34A', display: 'inline-flex' }}>
                              <Icon name="check" size={18} />
                            </span>
                          ) : (
                            <span style={{ color: '#CBD5E1' }}>—</span>
                          )}
                        </td>
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
                              backgroundColor: totalAsistenciasParticipant > 0 ? (isCertified ? '#ecfdf5' : '#f0fdf4') : 'var(--bg-card)',
                              color: totalAsistenciasParticipant > 0 ? (isCertified ? '#047857' : '#15803d') : 'var(--text-muted)',
                              border: `1px solid ${totalAsistenciasParticipant > 0 ? (isCertified ? '#6ee7b7' : '#a7f3d0') : 'var(--border-light)'}`,
                            }}
                            title={isCertified ? 'Apto para certificado (≥5 de 6)' : `${totalAsistenciasParticipant} de ${sessions.length} asistencias`}
                          >
                            {totalAsistenciasParticipant} / {sessions.length}
                          </span>
                        </td>
                        <td>
                          {isPresent ? (
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Presente</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Pendiente</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => markManualAttendance(activeSessionId, p.codigo, p.dni)}
                            className={`btn btn-sm ${isPresent ? 'btn-secondary' : 'btn-primary'}`}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title={
                              isPresent
                                ? 'Haga clic para desmarcar asistencia manual'
                                : 'Marcar asistencia manual de contingencia (sin batería/conexión)'
                            }
                          >
                            {isPresent ? 'Desmarcar' : 'Check-in'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredParticipants.length > PAGE_SIZE && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mostrando <strong>{firstIndex}–{lastIndex}</strong> de{' '}
                  <strong>{filteredParticipants.length}</strong> participantes
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="btn btn-secondary btn-sm"
                    style={{
                      ...pagerButtonStyle,
                      opacity: safePage === 1 ? 0.5 : 1,
                      cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Anterior
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCurrentPage(n)}
                      className="btn btn-sm"
                      style={{
                        ...pagerButtonStyle,
                        fontWeight: n === safePage ? 800 : 600,
                        border: n === safePage ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                        backgroundColor: n === safePage ? '#EEF2FF' : '#FFFFFF',
                        color: n === safePage ? '#4338CA' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                    disabled={safePage === totalPages}
                    className="btn btn-secondary btn-sm"
                    style={{
                      ...pagerButtonStyle,
                      opacity: safePage === totalPages ? 0.5 : 1,
                      cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Proyección de Código QR */}
      <AttendanceQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        activeSessionId={activeSessionId}
        sessions={sessions}
        onSelectSession={(id) => setActiveSessionId(id)}
      />
    </>
  );
};

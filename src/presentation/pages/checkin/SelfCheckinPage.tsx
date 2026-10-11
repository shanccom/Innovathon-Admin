import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParticipants } from '../../../application/hooks/useParticipants';
import { useAttendance } from '../../../application/hooks/useAttendance';
import { manageAttendanceUseCase } from '../../../application/use-cases/manage-attendance.use-case';
import { appsScriptAttendanceClient } from '../../../infrastructure/api/apps-script-attendance.client';
import { Participant } from '../../../domain/models/participant.model';
import { Icon } from '../../components/common/Icon';
import logoPrincipal from '../../../assets/images/logo-principal.png';
import logoLight from '../../../assets/images/logo-light.png';

interface CheckinResult {
  status: 'success' | 'already' | 'error';
  participant?: Participant;
  message: string;
  sessionName: string;
  time?: string;
}

export const SelfCheckinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [identificador, setIdentificador] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);

  const { participants, loading: loadingParticipants } = useParticipants();
  const { sessions, activeSessionId, allRecords } = useAttendance();

  // Resolución precisa de la sesión objetivo (soporta ?sesion=asistencia-2 o ?session=asistencia-2)
  const querySession = searchParams.get('sesion') || searchParams.get('session');
  const targetSession = useMemo(() => {
    if (querySession) {
      const match = sessions.find(
        (s) => s.id === querySession || s.name.toLowerCase() === querySession.toLowerCase()
      );
      if (match) return match;
    }
    return (
      sessions.find((s) => s.id === activeSessionId) ||
      sessions[0] || { id: 'asistencia-1', name: 'Asistencia 1' }
    );
  }, [sessions, activeSessionId, querySession]);

  useEffect(() => {
    document.title = `Auto Check-in | Innovathon 2026`;
  }, []);

  const normalizarDoc = (str: string) => {
    const clean = str.trim().toUpperCase();
    const soloDigitos = clean.replace(/\D/g, '');
    return soloDigitos.length > 0 && soloDigitos.length <= 8 ? soloDigitos.padStart(8, '0') : clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identificador.trim().toUpperCase();
    if (!clean || submitting) return;

    if (loadingParticipants && participants.length === 0) {
      setResult({
        status: 'error',
        message: 'Cargando padrón oficial de participantes... Por favor espera 2 segundos y reintenta.',
        sessionName: targetSession.name,
      });
      return;
    }

    setSubmitting(true);
    setResult(null);

    let cleanDoc = clean;
    if (cleanDoc.includes('?') || cleanDoc.includes('/')) {
      const urlCodeMatch = cleanDoc.match(/[?&](?:code|codigo|dni|id)=([A-Za-z0-9_-]+)/i);
      if (urlCodeMatch && urlCodeMatch[1]) {
        cleanDoc = urlCodeMatch[1].trim().toUpperCase();
      } else {
        const pathPartMatch = cleanDoc.match(/(IM-\d{4}-\d+|[0-9]{8})/i);
        if (pathPartMatch && pathPartMatch[1]) {
          cleanDoc = pathPartMatch[1].trim().toUpperCase();
        }
      }
    }

    const docBuscado = normalizarDoc(cleanDoc);

    // 1. Validar que exista en el padrón de participantes (Registros)
    const found = participants.find((p) => {
      const pDni = normalizarDoc(p.dni);
      const pCod = p.codigo.trim().toUpperCase();
      return pDni === docBuscado || pCod === cleanDoc || p.id.toLowerCase() === cleanDoc.toLowerCase();
    });

    if (!found) {
      setSubmitting(false);
      setResult({
        status: 'error',
        message: `No se encontró ningún participante con DNI o Código "${clean}". Revisa que tus datos coincidan o acércate a la mesa de acreditación.`,
        sessionName: targetSession.name,
      });
      return;
    }

    // 2. Validar si ya está presente en la sesión específica
    const sessionRecords = allRecords[targetSession.id] || {};
    const alreadyMarked = sessionRecords[found.id]?.status === 'present';

    if (alreadyMarked) {
      setSubmitting(false);
      const recordedTime = sessionRecords[found.id]?.timestamp || 'Registrado';
      setResult({
        status: 'already',
        participant: found,
        message: `Ya marcaste tu asistencia para esta sesión.`,
        sessionName: targetSession.name,
        time: recordedTime,
      });
      return;
    }

    // 3. Registrar asistencia en la sesión objetivo exacta
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    manageAttendanceUseCase.markPresent(targetSession.id, found.id);

    // Sincronizar en segundo plano con Google Apps Script con LockService
    appsScriptAttendanceClient.syncToMatrix({
      action: 'markAttendance',
      codigo: found.codigo,
      dni: found.dni,
      nombre: found.nombre,
      sessionId: targetSession.id,
      sessionName: targetSession.name,
      timestamp: nowTime,
    });

    setSubmitting(false);
    setResult({
      status: 'success',
      participant: found,
      message: `¡Bienvenido/a ${found.nombre}! Tu asistencia para la ${targetSession.name} ha sido registrada.`,
      sessionName: targetSession.name,
      time: nowTime,
    });
  };

  const resetForm = () => {
    setIdentificador('');
    setResult(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '2.25rem 1.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          textAlign: 'center',
        }}
      >
        {/* Encabezado Simple */}
        <div style={{ marginBottom: '1.75rem' }}>
          <img
            src={logoPrincipal}
            alt="Innovathon"
            style={{ height: '44px', maxWidth: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = logoLight;
            }}
          />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0.85rem 0 0.25rem' }}>
            Registro de Asistencia
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>
            Innovathon Mollendo 2026
          </p>
        </div>

        {/* Indicador de Sesión Activa */}
        <div
          style={{
            backgroundColor: '#EEF2FF',
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#4338CA',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F46E5' }} />
          <span>{targetSession.name}</span>
        </div>

        {/* Mensaje de Éxito */}
        {result?.status === 'success' && (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: '16px',
              padding: '1.75rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                color: '#fff',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
              ¡Asistencia Registrada!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#15803D', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              {result.message}
            </p>
            {result.participant && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  color: '#334155',
                  border: '1px solid #DCFCE7',
                  marginBottom: '1.25rem',
                  lineHeight: '1.6',
                }}
              >
                <div><strong>Participante:</strong> {result.participant.nombre}</div>
                <div><strong>DNI:</strong> {result.participant.dni}</div>
                <div><strong>Hora:</strong> {result.time}</div>
              </div>
            )}
            <button
              onClick={resetForm}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Registrar a otro compañero
            </button>
          </div>
        )}

        {/* Mensaje de Duplicado */}
        {result?.status === 'already' && (
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '16px',
              padding: '1.75rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#D97706',
                color: '#fff',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="alertCircle" size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E', marginBottom: '0.5rem' }}>
              Ya estás registrado
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#B45309', marginBottom: '1.25rem' }}>
              Tu asistencia para esta sesión ya fue marcada previamente ({result.time}).
            </p>
            <button
              onClick={resetForm}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Entendido / Registrar a otro
            </button>
          </div>
        )}

        {/* Mensaje de Error */}
        {result?.status === 'error' && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '16px',
              padding: '1.75rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#DC2626',
                color: '#fff',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="x" size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991B1B', marginBottom: '0.5rem' }}>
              DNI o Código no encontrado
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#B91C1C', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              {result.message}
            </p>
            <button
              onClick={resetForm}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Volver a intentar
            </button>
          </div>
        )}

        {/* Formulario de Entrada */}
        {!result && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.5rem',
                }}
              >
                Ingresa tu DNI o Código:
              </label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ej. 74206871 o IM-2026-0007"
                autoFocus
                required
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  border: '2px solid #CBD5E1',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4F46E5';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !identificador.trim()}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: '#4F46E5',
                border: 'none',
                borderRadius: '12px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting || !identificador.trim() ? 0.6 : 1,
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Icon name="checkCircle" size={18} />
              <span>
                {submitting ? 'Confirmando asistencia...' : 'Confirmar Asistencia'}
              </span>
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94A3B8' }}>
          Sistema oficial de asistencia • Innovathon Mollendo
        </div>
      </div>
    </div>
  );
};

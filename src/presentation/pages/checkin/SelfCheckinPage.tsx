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

    const docBuscado = normalizarDoc(clean);

    // 1. Validar que exista en el padrón de participantes (Registros)
    const found = participants.find((p) => {
      const pDni = normalizarDoc(p.dni);
      const pCod = p.codigo.trim().toUpperCase();
      return pDni === docBuscado || pCod === clean || p.id.toLowerCase() === clean.toLowerCase();
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

    // 2. Validar duplicados en la sesión específica
    const sessionRecords = allRecords[targetSession.id] || {};
    const alreadyMarkedLocal = sessionRecords[found.id]?.status === 'present';
    const localStoreKey = `innovathon_self_checkin_${targetSession.id}_${found.id}`;
    const alreadyMarkedInPhone = localStorage.getItem(localStoreKey);

    if (alreadyMarkedLocal || alreadyMarkedInPhone) {
      setSubmitting(false);
      const recordedTime = alreadyMarkedInPhone || sessionRecords[found.id]?.timestamp || 'Registrado';
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
    localStorage.setItem(localStoreKey, nowTime);

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
        backgroundColor: '#070a18',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'rgba(10, 15, 38, 0.95)',
          border: '1px solid #1b254b',
          borderRadius: '24px',
          padding: '2rem 1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
        }}
      >
        {/* Encabezado */}
        <div style={{ marginBottom: '1.5rem' }}>
          <img
            src={logoPrincipal}
            alt="Innovathon Mollendo"
            style={{ height: '48px', maxWidth: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = logoLight;
            }}
          />
          <div
            style={{
              display: 'inline-block',
              marginTop: '0.75rem',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(203, 251, 69, 0.15)',
              border: '1px solid #cbfb45',
              color: '#cbfb45',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Auto Check-in Cero Filas
          </div>
        </div>

        {/* Indicador de Sesión Activa */}
        <div
          style={{
            backgroundColor: '#131b3b',
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#c9b4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon name="attendance" size={16} />
          <span>
            Sesión activa: <strong>{targetSession.name}</strong>
          </span>
        </div>

        {/* Mensaje de Éxito */}
        {result?.status === 'success' && (
          <div
            style={{
              backgroundColor: '#064e3b',
              border: '2px solid #10b981',
              borderRadius: '16px',
              padding: '1.5rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                color: '#fff',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ecfdf5', marginBottom: '0.5rem' }}>
              ¡Asistencia Confirmada!
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#a7f3d0', marginBottom: '1rem', lineHeight: 1.4 }}>
              {result.message}
            </p>
            {result.participant && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  color: '#e2e8f0',
                  marginBottom: '1rem',
                }}
              >
                <div><strong>Estudiante:</strong> {result.participant.nombre}</div>
                <div><strong>Código:</strong> {result.participant.codigo}</div>
                <div><strong>DNI:</strong> {result.participant.dni}</div>
                <div><strong>Hora:</strong> {result.time}</div>
              </div>
            )}
            <button
              onClick={resetForm}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#10b981',
                color: '#070a18',
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
              backgroundColor: '#451a03',
              border: '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '1.5rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: '#fff',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="alertCircle" size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fef3c7', marginBottom: '0.5rem' }}>
              Ya marcaste tu asistencia
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#fde68a', marginBottom: '1rem' }}>
              Ya registraste tu asistencia para esta sesión ({result.time}).
            </p>
            <button
              onClick={resetForm}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f59e0b',
                color: '#070a18',
                borderRadius: '12px',
                fontWeight: 700,
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
              backgroundColor: '#450a0a',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '1.5rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#fff',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="x" size={32} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fee2e2', marginBottom: '0.5rem' }}>
              DNI o Código no encontrado
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '1rem' }}>
              {result.message}
            </p>
            <button
              onClick={resetForm}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 700,
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
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '0.5rem',
                }}
              >
                Ingresa tu DNI o Código (ej. 74206871 o IM-2026-0007):
              </label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="DNI o Código..."
                autoFocus
                required
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  backgroundColor: '#0a0f26',
                  color: '#ffffff',
                  border: '2px solid #741cf3',
                  borderRadius: '14px',
                  outline: 'none',
                  boxShadow: '0 0 15px rgba(116, 28, 243, 0.3)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !identificador.trim()}
              style={{
                width: '100%',
                padding: '1.1rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#070a18',
                backgroundColor: '#cbfb45',
                border: 'none',
                borderRadius: '14px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting || !identificador.trim() ? 0.6 : 1,
                boxShadow: '0 0 20px rgba(203, 251, 69, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Icon name="checkCircle" size={20} />
              <span>
                {submitting ? 'Registrando en Google Sheets...' : 'Confirmar mi Asistencia'}
              </span>
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          Innovathon Mollendo 2026 • Registro oficial en tiempo real
        </div>
      </div>
    </div>
  );
};

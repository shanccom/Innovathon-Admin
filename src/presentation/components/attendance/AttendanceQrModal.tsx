import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from '../common/Icon';
import {
  DEFAULT_ATTENDANCE_SESSIONS,
  getEffectiveFormUrl,
  saveCustomFormUrl,
} from '../../../infrastructure/config/attendance-forms.config';

interface AttendanceQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string;
  sessions: { id: string; name: string }[];
  onSelectSession: (id: string) => void;
}

export const AttendanceQrModal: React.FC<AttendanceQrModalProps> = ({
  isOpen,
  onClose,
  activeSessionId,
  sessions,
  onSelectSession,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Busca los metadatos enriquecidos de la sesión (horario, descripción, formUrl)
  const sessionConfig = useMemo(() => {
    // 1. Coincidencia directa por id o name
    const direct = DEFAULT_ATTENDANCE_SESSIONS.find(
      (s) =>
        s.id === activeSessionId ||
        s.name.toLowerCase() === activeSessionId.toLowerCase()
    );
    if (direct) return direct;

    // 2. Si activeSessionId es "Asistencia X", extrae el número de sesión (1..6)
    const numMatch = activeSessionId.match(/(\d+)/);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10) - 1;
      if (idx >= 0 && idx < DEFAULT_ATTENDANCE_SESSIONS.length) {
        return DEFAULT_ATTENDANCE_SESSIONS[idx];
      }
    }

    // 3. Si coincide con la posición en la lista de sesiones
    const sessionIndex = sessions.findIndex(
      (s) => s.id === activeSessionId || s.name === activeSessionId
    );
    if (sessionIndex >= 0 && sessionIndex < DEFAULT_ATTENDANCE_SESSIONS.length) {
      return DEFAULT_ATTENDANCE_SESSIONS[sessionIndex];
    }

    return DEFAULT_ATTENDANCE_SESSIONS[0];
  }, [activeSessionId, sessions]);

  const effectiveUrl = useMemo(() => {
    return getEffectiveFormUrl(sessionConfig);
  }, [sessionConfig]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(effectiveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      saveCustomFormUrl(sessionConfig.id, customUrlInput.trim());
      setIsEditingUrl(false);
      setCustomUrlInput('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '540px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="scan" size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                Proyector de Asistencia QR
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                Innovathon Mollendo 2026 · Pantalla Oficial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#64748B',
            }}
          >
            ✕
          </button>
        </div>

        {/* Selector de Sesiones en el Modal */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#F1F5F9',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto',
          }}
        >
          {sessions.map((s) => {
            const isSelected = s.id === activeSessionId || s.name === activeSessionId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectSession(s.id);
                  setIsEditingUrl(false);
                }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #4F46E5' : '1px solid #CBD5E1',
                  backgroundColor: isSelected ? '#4F46E5' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Cuerpo Principal del QR */}
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#EEF2FF',
                color: '#4338CA',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                marginBottom: '0.35rem',
              }}
            >
              {sessionConfig.schedule}
            </span>
            <h2 style={{ margin: '0.2rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
              {sessionConfig.name}
            </h2>
            <p style={{ margin: '0 auto', maxWidth: '380px', fontSize: '0.82rem', color: '#64748B' }}>
              {sessionConfig.description}
            </p>
          </div>

          {/* Tarjeta Visual del Código QR */}
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#FFFFFF',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '2px solid #E2E8F0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
              marginBottom: '1rem',
            }}
          >
            <QRCodeSVG
              value={effectiveUrl}
              size={240}
              level="M"
              includeMargin={true}
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>

          {/* Indicación para los participantes */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.65rem 1rem',
              fontSize: '0.82rem',
              color: '#334155',
              maxWidth: '420px',
              margin: '0 auto 1.25rem',
              lineHeight: 1.4,
            }}
          >
            <strong>Instrucciones:</strong> Escanea el código con tu celular e ingresa tu <strong>número de DNI (8 dígitos)</strong>. Tu asistencia se registrará automáticamente.
          </div>

          {/* Formulario para editar URL si se requiere */}
          {isEditingUrl ? (
            <form onSubmit={handleSaveCustomUrl} style={{ maxWidth: '420px', margin: '0 auto 1rem', display: 'flex', gap: '0.4rem' }}>
              <input
                type="url"
                required
                placeholder="https://docs.google.com/forms/..."
                defaultValue={effectiveUrl}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUrl(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                Cancelar
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Icon name={copied ? 'check' : 'clipboard'} size={15} />
                <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
              </button>

              <a
                href={effectiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                }}
              >
                <Icon name="externalLink" size={15} />
                <span>Abrir formulario</span>
              </a>

              <button
                type="button"
                onClick={() => setIsEditingUrl(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#475569',
                }}
                title="Personalizar el enlace de este formulario"
              >
                <Icon name="settings" size={15} />
                <span>Editar URL</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Icon name="printer" size={15} />
                <span>Imprimir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

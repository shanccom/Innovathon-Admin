import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from '../common/Icon';
import logoPrincipal from '../../../assets/images/logo-principal.png';

interface SelfCheckinQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string;
  sessions: { id: string; name: string }[];
  onSelectSession: (id: string) => void;
}

export const SelfCheckinQrModal: React.FC<SelfCheckinQrModalProps> = ({
  isOpen,
  onClose,
  activeSessionId,
  sessions,
  onSelectSession,
}) => {
  const [copied, setCopied] = useState(false);

  // URL amigable para marcar asistencia en la sesión seleccionada
  const checkinUrl = useMemo(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}#/checkin?sesion=${activeSessionId}`;
  }, [activeSessionId]);

  const activeSessionName = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId)?.name || 'Asistencia';
  }, [sessions, activeSessionId]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback manual si clipboard no está disponible
      setCopied(false);
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
        padding: '1.25rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card print-friendly"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header Minimalista y Limpio */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={logoPrincipal} alt="Innovathon" style={{ height: '32px', width: 'auto' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                Código QR de Asistencia
              </h2>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Los participantes escanean con su celular para registrarse
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '9999px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', textAlign: 'center' }}>
          {/* Selector de Sesión activa */}
          <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                marginBottom: '0.5rem',
              }}
            >
              Seleccionar Sesión para el QR:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {sessions.map((s) => {
                const isSelected = s.id === activeSessionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSession(s.id)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFC',
                      color: isSelected ? '#4338CA' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner indicador de la sesión */}
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '0.75rem',
              padding: '0.6rem 1rem',
              marginBottom: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#15803D',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            Marcando automáticamente en: <strong>{activeSessionName}</strong>
          </div>

          {/* Contenedor del Código QR */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '1.25rem',
              borderRadius: '1rem',
              border: '2px dashed #CBD5E1',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <QRCodeSVG
              value={checkinUrl}
              size={240}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: logoPrincipal,
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
            <p
              style={{
                margin: '0.75rem 0 0 0',
                fontSize: '0.8rem',
                color: '#64748B',
                fontWeight: 600,
              }}
            >
              Escanea para marcar tu asistencia
            </p>
          </div>

          {/* Enlace directo y botón para copiar */}
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#F8FAFC',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <input
              type="text"
              readOnly
              value={checkinUrl}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.75rem',
                color: '#475569',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
            >
              <Icon name={copied ? 'check' : 'copy'} size={14} />
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Footer con acciones */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Icon name="download" size={16} />
            <span>Imprimir / Guardar PDF</span>
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={checkinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Abrir vista móvil</span>
            </a>
            <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
              <span>Listo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

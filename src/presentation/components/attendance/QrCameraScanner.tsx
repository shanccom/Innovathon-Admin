import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Icon } from '../common/Icon';

interface QrCameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });
  const containerId = 'qr-reader-container';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            const now = Date.now();
            // Evitar escaneos repetidos en ráfaga (cooldown de 1.8 segundos para el mismo código)
            if (
              lastScannedRef.current.text === decodedText &&
              now - lastScannedRef.current.time < 1800
            ) {
              return;
            }
            lastScannedRef.current = { text: decodedText, time: now };
            onScan(decodedText);
          },
          () => {
            // Callback opcional de frames sin detección
          }
        );

        setIsScanning(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No se pudo acceder a la cámara';
        if (message.includes('NotAllowedError') || message.includes('Permission')) {
          setError('Permiso de cámara denegado. Por favor concede acceso en tu navegador.');
        } else {
          setError('No se pudo iniciar la cámara web/móvil.');
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [onScan]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="camera" size={20} style={{ color: 'var(--color-purple)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-midnight)' }}>
            Lector de Código QR con Cámara
          </h3>
          {isScanning && <span className="badge-live">Activo</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Icon name="x" size={16} />
          <span>Cerrar escáner</span>
        </button>
      </div>

      {error ? (
        <div className="alert-box alert-error" style={{ margin: 0 }}>
          <Icon name="alertCircle" size={18} />
          <div>{error}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            id={containerId}
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          />
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Apunta la cámara al código QR impreso en el gafete o credencial del participante
          </p>
        </div>
      )}
    </div>
  );
};

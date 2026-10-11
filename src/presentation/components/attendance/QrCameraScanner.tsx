import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Limpiar contenido previo si quedó algún video o canvas residual
        container.innerHTML = '';

        // Configuración especializada 100% en CÓDIGO DE BARRAS (Pase de acreditación CODE_128)
        html5QrCode = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128, // Formato exacto del correo: IM-2026-XXXX
            Html5QrcodeSupportedFormats.CODE_39,
          ],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        // Visor rectangular horizontal específico para capturar las barras del celular de punta a punta
        const config = {
          fps: 25, // Máxima velocidad de muestreo
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = Math.min(Math.floor(viewfinderWidth * 0.90), 380);
            const height = Math.min(130, viewfinderHeight - 30); // Ventana estrecha de barras
            return { width: Math.max(width, 280), height: Math.max(height, 110) };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true, // Motor nativo de código de barras de Chrome/Edge/Safari
          },
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,

          (decodedText: string) => {
            const now = Date.now();
            // Cooldown de 2 segundos SOLO si es el mismo código exacto para evitar lecturas dobles
            if (
              lastScannedRef.current.text === decodedText &&
              now - lastScannedRef.current.time < 2000
            ) {
              return;
            }
            lastScannedRef.current = { text: decodedText, time: now };
            onScanRef.current(decodedText);
          },
          () => {
            // Callback opcional de frames sin detección
          }
        );

        if (isMounted) {
          setIsScanning(true);
        } else {
          // Si el componente se desmontó mientras la cámara iniciaba (comportamiento StrictMode)
          html5QrCode.stop().catch(() => {});
        }
      } catch (err: unknown) {
        if (!isMounted) return;
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
      isMounted = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
            }).catch(() => {});
          } else {
            scannerRef.current.clear();
          }
        } catch {}
      }
    };
  }, []);


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
            Lector de Acreditación (Barras / QR)
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
              maxWidth: '440px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          />
          <p style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Apunta la cámara al <strong>código de barras o QR</strong> que el participante muestra en la pantalla de su celular o credencial.
          </p>
        </div>
      )}
    </div>
  );
};

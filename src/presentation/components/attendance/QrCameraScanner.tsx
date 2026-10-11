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

        // Soporte universal: Códigos QR y Códigos de Barras (CODE_128, CODE_39, EAN_13)
        html5QrCode = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        // Visor adaptable: suficiente altura para QRs cuadrados y anchura para códigos de barras
        const config = {
          fps: 25, // Máxima velocidad de muestreo
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const edge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(Math.floor(edge * 0.75), 240);
            return { width: size, height: size };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true, // Motor nativo de código de barras / QR si el navegador lo soporta
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

import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/common/Icon';

export interface DriveConfig {
  folderId: string;
}

const STORAGE_KEY_FOLDER = 'innovathon_cert_drive_folder_id';

const DEFAULT_FOLDER_ID = '1QIMI2AGnVSDgVMJjPYNp9h9AqVJgAh_u';
const LEGACY_DEFAULT_FOLDER_ID = '1Z2Y-innovathon-certificados-drive';

export function getDriveConfig(): DriveConfig {
  const savedFolderId = localStorage.getItem(STORAGE_KEY_FOLDER)?.trim();
  const folderId = savedFolderId && savedFolderId !== LEGACY_DEFAULT_FOLDER_ID
    ? savedFolderId
    : DEFAULT_FOLDER_ID;
  return { folderId };
}

export function saveDriveConfig(config: DriveConfig): void {
  localStorage.setItem(STORAGE_KEY_FOLDER, config.folderId.trim());
}

interface DriveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: DriveConfig) => void;
}

export const DriveConfigModal: React.FC<DriveConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [folderId, setFolderId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getDriveConfig();
      setFolderId(current.folderId);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { folderId: folderId.trim() };
    saveDriveConfig(config);
    if (onSave) {
      onSave(config);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleOpenFolder = () => {
    if (folderId.trim()) {
      window.open(`https://drive.google.com/drive/folders/${encodeURIComponent(folderId.trim())}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-config-modal-title"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Icon name="folder" size={24} />
          </div>
          <div>
            <h2 id="drive-config-modal-title" className="modal-title">
              Configuración de Google Drive
            </h2>
            <p className="modal-subtitle">
              Define la carpeta de destino. La plantilla de certificados se administra desde Apps Script.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="drive-folder-id"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--color-midnight)',
                  }}
                >
                  ID de carpeta en Google Drive
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="drive-folder-id"
                    type="text"
                    required
                    className="form-input"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="1QIMI2AGnVSDgVMJjPYNp9h9AqVJgAh_u"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleOpenFolder}
                    disabled={!folderId.trim()}
                    title="Abrir carpeta en Google Drive"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Icon name="externalLink" size={15} />
                    <span>Abrir en Drive ↗</span>
                  </button>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Carpeta donde se guardarán los archivos PDF una vez emitidos.
                </p>
              </div>

              {savedSuccess && (
                <div
                  className="notice-banner notice-success"
                  style={{ marginTop: '8px', padding: '10px 14px' }}
                >
                  <Icon name="checkCircle" size={16} />
                  <span>Configuración guardada correctamente.</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Icon name="check" size={16} />
              <span>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

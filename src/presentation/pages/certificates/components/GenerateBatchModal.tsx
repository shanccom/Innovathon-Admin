import React from 'react';
import { Icon } from '../../../components/common/Icon';
import { getDriveConfig } from './DriveConfigModal';

interface BatchParticipantItem {
  identifier: string;
  fullName: string;
  role?: string;
  area?: string;
  team?: string;
  sendCertificate: boolean;
  generationStatus?: string;
}

interface GenerateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizers: BatchParticipantItem[];
  onConfirm: () => void;
  isProcessing?: boolean;
  populationLabel?: string;
}

export const GenerateBatchModal: React.FC<GenerateBatchModalProps> = ({
  isOpen,
  onClose,
  organizers,
  onConfirm,
  isProcessing = false,
  populationLabel = 'organizadores',
}) => {
  if (!isOpen) return null;

  const driveConfig = getDriveConfig();
  const activeOrganizers = organizers.filter(
    (o) => o.sendCertificate && !['generado', 'emitido'].includes(o.generationStatus?.trim().toLowerCase() || '')
  );

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="batch-modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Icon name="award" size={24} />
          </div>
          <div>
            <h2 id="batch-modal-title" className="modal-title">
              Generar certificados en Google Drive
            </h2>
            <p className="modal-subtitle">
              Los certificados se crearán en formato PDF a partir de la plantilla en Google Slides y se guardarán en la carpeta designada de Drive.
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

        <div className="modal-body">
          {/* Destination Callout */}
          <div className="batch-destination">
            <div className="batch-destination-main">
              <span className="batch-destination-icon">
                <Icon name="folder" size={20} />
              </span>
              <div>
                <div className="batch-destination-title">
                  Carpeta destino en Google Drive
                </div>
                <div className="batch-destination-id">
                  {driveConfig.folderId}
                </div>
              </div>
            </div>
            <a
              href={`https://drive.google.com/drive/folders/${encodeURIComponent(driveConfig.folderId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="batch-destination-link"
            >
              <span>Ver en Drive</span>
              <Icon name="externalLink" size={13} />
            </a>
          </div>

          <div className="batch-stats-grid">
            <div className="batch-stat-card">
              <span className="batch-stat-number">{activeOrganizers.length}</span>
              <span className="batch-stat-label">Certificados a emitir</span>
            </div>
          </div>

          <div className="batch-preview-list-header">
            <span>{populationLabel} seleccionados ({activeOrganizers.length})</span>
          </div>

          <div className="batch-preview-list">
            {activeOrganizers.map((org) => {
              return (
                <div key={org.identifier} className="batch-preview-item">
                  <div className="batch-item-info">
                    <span className="batch-item-name">{org.fullName}</span>
                    <span className="batch-item-meta">
                      {org.identifier} • {org.role || 'Participante'} • {org.area || org.team || 'General'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="batch-notice-box">
            <Icon name="info" size={18} />
            <div>
              Al confirmar, se creará la orden de generación de PDFs y <strong>se actualizará la columna ESTADO GENERACION en el Google Sheet</strong> para cada persona seleccionada.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isProcessing || activeOrganizers.length === 0}
          >
            <Icon name="checkCircle" size={16} />
            <span>{isProcessing ? 'Procesando lote...' : `Confirmar y generar (${activeOrganizers.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

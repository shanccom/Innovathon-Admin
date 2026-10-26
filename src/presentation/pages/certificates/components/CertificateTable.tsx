import React from 'react';
import { Icon } from '../../../components/common/Icon';
import { OrgEmissionType, ORG_EMISSION_LABELS } from '../../../../domain/models/certificate-type.model';

export interface CertificatePersonItem {
  identifier: string;
  dni?: string;
  fullName: string;
  role: string;
  area?: string;
  team?: string;
  sendCertificate: boolean;
  generationStatus?: string;
  drivePdfUrl?: string;
}

interface CertificateTableProps {
  organizers: CertificatePersonItem[];
  onToggleSendCertificate: (identifier: string, currentValue: boolean) => void;
  onRegenerateCertificate?: (identifier: string) => void;
  regeneratingIds?: Set<string>;
  toggleErrors: Record<string, string>;
  activeCount: number;
  totalCount: number;
  populationLabel?: string;
  population?: 'organizadores' | 'participantes';
  isLocked?: boolean;
  emissionTypeMap?: Record<string, OrgEmissionType>;
  onEmissionTypeChange?: (identifier: string, type: OrgEmissionType) => void;
  savingTemplateIds?: Set<string>;
  templateErrors?: Record<string, string>;
  onSelectAllVisible?: () => void;
  onDeselectAllVisible?: () => void;
  selectableCount?: number;
  deselectableCount?: number;
  bulkActionPending?: boolean;
}

export const CertificateTable: React.FC<CertificateTableProps> = ({
  organizers,
  onToggleSendCertificate,
  onRegenerateCertificate,
  regeneratingIds = new Set(),
  toggleErrors,
  activeCount,
  totalCount,
  populationLabel = 'Organizadores',
  population = 'organizadores',
  isLocked = false,
  emissionTypeMap,
  onEmissionTypeChange,
  savingTemplateIds = new Set(),
  templateErrors = {},
  onSelectAllVisible,
  onDeselectAllVisible,
  selectableCount = 0,
  deselectableCount = 0,
  bulkActionPending = false,
}) => {
  const isParticipants = population === 'participantes';
  const columnCount = isParticipants || !onEmissionTypeChange ? 6 : 7;

  const [confirmTarget, setConfirmTarget] = React.useState<CertificatePersonItem | null>(null);

  const handleConfirmRegenerate = () => {
    if (confirmTarget && onRegenerateCertificate) {
      onRegenerateCertificate(confirmTarget.identifier);
      setConfirmTarget(null);
    }
  };

  const renderGenerationBadge = (organizer: CertificatePersonItem) => {
    const rawStatus = organizer.generationStatus?.trim().toLowerCase();
    const isGenerated = rawStatus === 'generado' || rawStatus === 'emitido';
    const isRegenerating = regeneratingIds.has(organizer.identifier);

    let badgeContent;
    if (isRegenerating) {
      badgeContent = (
        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Icon name="refresh" size={12} className="spin" />
          <span>Regenerando…</span>
        </span>
      );
    } else if (isGenerated) {
      badgeContent = (
        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Icon name="checkCircle" size={12} />
          <span>Generado</span>
        </span>
      );
    } else if (rawStatus === 'error' || rawStatus === 'fallido') {
      badgeContent = (
        <span className="badge" style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', border: '1px solid var(--status-danger-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Icon name="alertCircle" size={12} />
          <span>Error</span>
        </span>
      );
    } else if (rawStatus === 'pendiente' || (rawStatus === '' && organizer.sendCertificate)) {
      badgeContent = (
        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Icon name="clock" size={12} />
          <span>Pendiente</span>
        </span>
      );
    } else if (rawStatus === 'en cola' || rawStatus === 'procesando') {
      badgeContent = (
        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Icon name="clock" size={12} />
          <span>En cola</span>
        </span>
      );
    } else {
      badgeContent = (
        <span className="status-badge status-excluded">
          <span className="status-dot gray" />
          Omitido
        </span>
      );
    }

    return (
      <div className="certificate-generation-cell">
        {badgeContent}
        {isGenerated && (
          <div className="certificate-generation-actions">
            {organizer.drivePdfUrl && (
              <a
                href={organizer.drivePdfUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary-link certificate-pdf-link"
                title="Abrir PDF generado en Google Drive"
              >
                <span>Ver PDF</span>
                <Icon name="externalLink" size={12} />
              </a>
            )}
            {onRegenerateCertificate && (
              <button
                type="button"
                className="btn-link-action btn-regenerate certificate-regenerate-icon"
                onClick={() => setConfirmTarget(organizer)}
                disabled={isRegenerating || isLocked}
                aria-label={`Regenerar certificado de ${organizer.fullName}`}
                title={`Regenerar certificado de ${organizer.fullName}`}
              >
                <Icon name="refresh" size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="table-container certificate-table-container">
      <div className="table-bulk-toolbar">
        <span className="table-bulk-info">
          {populationLabel} seleccionados para emisión: <strong>{activeCount} de {totalCount}</strong>
        </span>
        <div className="table-bulk-actions" aria-label={`Acciones masivas para ${populationLabel}`}>
          {onSelectAllVisible && (
            <button
              type="button"
              className="btn-link-action"
              onClick={onSelectAllVisible}
              disabled={isLocked || selectableCount === 0}
              title={`Seleccionar ${selectableCount} filas visibles de esta tabla y guardar en Google Sheets`}
            >
              <Icon name={bulkActionPending ? 'refresh' : 'check'} size={14} className={bulkActionPending ? 'spin' : ''} />
              <span>{bulkActionPending ? 'Guardando…' : `Seleccionar filtrados (${selectableCount})`}</span>
            </button>
          )}
          {onDeselectAllVisible && (
            <button
              type="button"
              className="btn-link-action"
              onClick={onDeselectAllVisible}
              disabled={isLocked || deselectableCount === 0}
              title={`Desmarcar ${deselectableCount} filas visibles pendientes de esta tabla; los certificados generados quedan protegidos`}
            >
              <Icon name={bulkActionPending ? 'refresh' : 'x'} size={14} className={bulkActionPending ? 'spin' : ''} />
              <span>Desmarcar filtrados ({deselectableCount})</span>
            </button>
          )}
        </div>
      </div>

      <table className="table-mock certificate-table">
        <thead>
          <tr>
            <th style={{ width: '170px' }}>{isParticipants ? 'Código' : 'Identificador'}</th>
            <th>Nombre completo</th>
            {isParticipants ? (
              <>
                <th style={{ width: '170px' }}>Reto / Eje</th>
                <th style={{ width: '260px' }}>Institución</th>
              </>
            ) : (
              <>
                <th>Rol</th>
                <th>Área de interés</th>
              </>
            )}
            <th style={{ width: '130px', textAlign: 'center' }}>Emitir cert.</th>
            {onEmissionTypeChange && <th>TIPO DE EMISIÓN</th>}
            <th style={{ width: '130px' }}>Estado Drive</th>
          </tr>
        </thead>
        <tbody>
          {organizers.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="certificate-table-empty">
                No hay personas que coincidan con los filtros actuales.
              </td>
            </tr>
          )}
          {organizers.map((organizer) => {
            const isGenerated = organizer.generationStatus?.trim().toLowerCase() === 'generado' || organizer.generationStatus?.trim().toLowerCase() === 'emitido';
            const templateType = emissionTypeMap?.[organizer.identifier];
            const templateClassName = templateType ? ` emission-type-${templateType}` : '';

            return (
              <tr key={organizer.identifier} className={organizer.sendCertificate ? 'row-selected' : ''}>
                <td>
                  <span className="cell-monospace">{organizer.identifier}</span>
                  {organizer.dni && organizer.dni !== organizer.identifier && (
                    <div className="cell-sub">{organizer.dni}</div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{organizer.fullName}</td>
                {isParticipants ? (
                  <>
                    <td>{organizer.role}</td>
                    <td>
                      <span className="cell-clamp" title={organizer.team || undefined}>
                        {organizer.team || '—'}
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{organizer.role}</td>
                    <td>{organizer.area || organizer.team || '—'}</td>
                  </>
                )}
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label
                      className={`toggle-switch${isGenerated ? ' toggle-switch-disabled' : ''}`}
                      title={
                        isGenerated
                          ? 'Certificado ya generado en Google Drive. Para modificarlo, usa Regenerar.'
                          : organizer.sendCertificate
                          ? 'Desactivar emisión'
                          : 'Activar emisión'
                      }
                    >
                      <input
                        type="checkbox"
                          checked={organizer.sendCertificate}
                          aria-label={`Emitir certificado de ${organizer.fullName}`}
                        disabled={isGenerated || isLocked}
                        onChange={() =>
                          onToggleSendCertificate(
                            organizer.identifier,
                            organizer.sendCertificate
                          )
                        }
                      />
                      <span className="toggle-track" />
                    </label>
                    {isGenerated && (
                      <span className="cell-lock-hint" title="Certificado generado">
                        <Icon name="lock" size={11} />
                      </span>
                    )}
                    {toggleErrors[organizer.identifier] && (
                      <span className="toggle-error">
                        {toggleErrors[organizer.identifier]}
                      </span>
                    )}
                  </div>
                </td>
                {onEmissionTypeChange && (
                  <td>
                    <div className="certificate-template-cell" aria-busy={savingTemplateIds.has(organizer.identifier)}>
                      <select
                        className={`emission-type-select${templateClassName}`}
                        aria-label={`Tipo de emisión de ${organizer.fullName}`}
                        aria-invalid={Boolean(templateErrors[organizer.identifier])}
                        aria-describedby={`template-feedback-${organizer.identifier}`}
                        value={emissionTypeMap?.[organizer.identifier] || ''}
                        disabled={isLocked || savingTemplateIds.has(organizer.identifier)}
                        onChange={(e) => onEmissionTypeChange(organizer.identifier, e.target.value as OrgEmissionType)}
                      >
                        <option value="" disabled>Seleccionar tipo</option>
                        {(Object.entries(ORG_EMISSION_LABELS) as [OrgEmissionType, string][]).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <div id={`template-feedback-${organizer.identifier}`} className="certificate-template-feedback" aria-live="polite">
                        {savingTemplateIds.has(organizer.identifier) && <span>Guardando…</span>}
                        {templateErrors[organizer.identifier] && <span className="toggle-error" role="alert">{templateErrors[organizer.identifier]}</span>}
                        {isGenerated && <span>El PDF actual no cambia. Regenera para aplicar el tipo.</span>}
                      </div>
                    </div>
                  </td>
                )}
                <td>
                  {renderGenerationBadge(organizer)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {confirmTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="regenerate-dialog-title">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="status-step-icon" style={{ width: '32px', height: '32px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                  <Icon name="refresh" size={16} />
                </div>
                <h3 id="regenerate-dialog-title" className="modal-title" style={{ margin: 0, fontSize: '1rem' }}>
                  ¿Regenerar certificado?
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setConfirmTarget(null)}
                aria-label="Cerrar modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="modal-body certificate-regenerate-modal-body" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 10px 0' }}>
                Se reiniciará el estado de <strong>{confirmTarget.fullName}</strong> a <strong>Pendiente</strong> y se borrará el enlace al PDF actual para que puedas emitir uno nuevo.
              </p>
              <p className="certificate-regenerate-identifier" style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Identificador: <code className="cell-monospace">{confirmTarget.identifier}</code>
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmRegenerate}
              >
                <Icon name="refresh" size={14} />
                <span>Confirmar y regenerar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

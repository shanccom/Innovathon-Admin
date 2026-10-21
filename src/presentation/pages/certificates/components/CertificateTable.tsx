import React from 'react';
import { Icon } from '../../../components/common/Icon';

export interface OrganizerHoursConfig {
  includeHours: boolean;
  hours: number;
}

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
  hoursMap: Record<string, OrganizerHoursConfig>;
  onToggleSendCertificate: (identifier: string, currentValue: boolean) => void;
  onToggleIncludeHours: (identifier: string, currentValue: boolean) => void;
  onChangeHours: (identifier: string, hours: number) => void;
  onApplyBulkHours: () => void;
  onRegenerateCertificate?: (identifier: string) => void;
  regeneratingIds?: Set<string>;
  toggleErrors: Record<string, string>;
  activeCount: number;
  totalCount: number;
  populationLabel?: string;
  population?: 'organizadores' | 'participantes';
  isLocked?: boolean;
}

export const CertificateTable: React.FC<CertificateTableProps> = ({
  organizers,
  hoursMap,
  onToggleSendCertificate,
  onToggleIncludeHours,
  onChangeHours,
  onApplyBulkHours,
  onRegenerateCertificate,
  regeneratingIds = new Set(),
  toggleErrors,
  activeCount,
  totalCount,
  populationLabel = 'Organizadores',
  population = 'organizadores',
  isLocked = false,
}) => {
  const isParticipants = population === 'participantes';

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
    <div className="table-container">
      <div className="table-bulk-toolbar">
        <span className="table-bulk-info">
          {populationLabel} seleccionados para emisión: <strong>{activeCount} de {totalCount}</strong>
        </span>
        <button
          type="button"
          className="btn-link-action"
          onClick={onApplyBulkHours}
          disabled={activeCount === 0 || isLocked}
          title={`Configura 120 horas lectivas a todos los ${populationLabel.toLowerCase()} que tienen la emisión activa`}
        >
          <Icon name="clock" size={14} />
          <span>Aplicar 120 hrs a seleccionados</span>
        </button>
      </div>

      <table className="table-mock">
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
            <th style={{ width: '190px' }}>Horas lectivas</th>
            <th style={{ width: '130px' }}>Estado Drive</th>
          </tr>
        </thead>
        <tbody>
          {organizers.map((organizer) => {
            const hoursConfig = hoursMap[organizer.identifier] || {
              includeHours: false,
              hours: 120,
            };
            const isGenerated = organizer.generationStatus?.trim().toLowerCase() === 'generado' || organizer.generationStatus?.trim().toLowerCase() === 'emitido';

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
                    <td>
                      <span
                        className="badge badge-subtle cell-clamp"
                        title={organizer.role || undefined}
                      >
                        {organizer.role || 'Sin rol'}
                      </span>
                    </td>
                    <td>
                      <span className="cell-clamp" title={organizer.team || undefined}>
                        {organizer.team || '—'}
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <span className="badge badge-subtle">{organizer.role || 'Sin rol'}</span>
                    </td>
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
                <td>
                  {organizer.sendCertificate ? (
                    <div className="hours-cell-control">
                      <label className="toggle-switch toggle-switch-sm" title="Activar/desactivar inclusión de horas en el certificado">
                        <input
                          type="checkbox"
                          checked={hoursConfig.includeHours}
                          disabled={isLocked}
                          onChange={(e) =>
                            onToggleIncludeHours(
                              organizer.identifier,
                              e.target.checked
                            )
                          }
                        />
                        <span className="toggle-track" />
                      </label>

                      {hoursConfig.includeHours ? (
                        <div className="hours-input-wrapper">
                          <input
                            type="number"
                            min={1}
                            max={1000}
                            step={10}
                            disabled={isLocked}
                            className="hours-number-input"
                            value={hoursConfig.hours || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              onChangeHours(
                                organizer.identifier,
                                isNaN(val) ? 0 : val
                              );
                            }}
                          />
                          <span className="hours-unit">hrs</span>
                        </div>
                      ) : (
                        <span className="hours-no-badge">Sin horas</span>
                      )}
                    </div>
                  ) : (
                    <span className="hours-cell-muted" title="Activa 'Emitir cert.' para configurar horas">
                      —
                    </span>
                  )}
                </td>
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

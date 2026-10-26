import React from 'react';
import { Icon } from '../../../components/common/Icon';

interface CertificateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  uniqueRoles: string[];
  roleFilters: Set<string>;
  onRoleFilterChange: (role: string, checked: boolean) => void;
  uniqueAreas: string[];
  areaFilters: Set<string>;
  onAreaFilterChange: (area: string, checked: boolean) => void;
  sendFilter: 'all' | 'yes' | 'no';
  onSendFilterChange: (value: 'all' | 'yes' | 'no') => void;
  onClearFilters: () => void;
  readyCount: number;
  onOpenBatchModal: () => void;
  hasFiltersApplied: boolean;
  showFilters: boolean;
  roleFilterLabel?: string;
  areaFilterLabel?: string;
  driveFolderId?: string;
  spreadsheetId?: string;
  isBulkUpdating?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CertificateFilters: React.FC<CertificateFiltersProps> = ({
  search,
  onSearchChange,
  uniqueRoles,
  roleFilters,
  onRoleFilterChange,
  uniqueAreas,
  areaFilters,
  onAreaFilterChange,
  sendFilter,
  onSendFilterChange,
  onClearFilters,
  readyCount,
  onOpenBatchModal,
  hasFiltersApplied,
  showFilters,
  roleFilterLabel = 'Rol',
  areaFilterLabel = 'Área',
  driveFolderId,
  spreadsheetId,
  isBulkUpdating = false,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="filter-panel">
      <div className="filter-top-row">
        <div className="filter-input" style={{ flex: 1, maxWidth: '420px' }}>
          <Icon name="search" />
          <input
            type="text"
            placeholder="Buscar por nombre, identificador o DNI..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
          {onRefresh && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onRefresh}
              disabled={isLoading || isBulkUpdating}
              title="Recargar datos desde Google Sheets"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span className={isLoading ? 'spinning' : ''} style={{ display: 'inline-flex' }}>
                <Icon name="refresh" />
              </span>
              <span>{isLoading ? 'Recargando...' : 'Recargar'}</span>
            </button>
          )}
          {spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              title="Abrir hoja de cálculo vinculada en Google Sheets"
            >
              <Icon name="table" />
              <span>Abrir Google Sheet ↗</span>
            </a>
          )}
          {driveFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${encodeURIComponent(driveFolderId)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              title="Abrir carpeta de certificados en Google Drive"
            >
              <Icon name="folder" />
              <span>Abrir carpeta en Drive ↗</span>
            </a>
          )}
          <button
            type="button"
            className={`btn ${readyCount > 0 && !isBulkUpdating ? 'btn-primary' : 'btn-secondary btn-disabled'}`}
            disabled={readyCount === 0 || isBulkUpdating || isLoading}
            onClick={onOpenBatchModal}
          >
            <Icon name="award" />
            <span>Generar certificados ({readyCount})</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-select-row">
          {uniqueRoles.length > 0 && (
            <label className="filter-select-field">
              <span className="filter-chip-label">{roleFilterLabel}</span>
              <details className={`filter-multi${roleFilters.size > 0 ? ' active' : ''}`}>
                <summary>{roleFilterLabel}: {roleFilters.size ? `${roleFilters.size} seleccionados` : 'Todos'}</summary>
                <div className="filter-multi-options">
                  {uniqueRoles.map((role) => (
                    <label key={role}>
                      <input
                        type="checkbox"
                        checked={roleFilters.has(role)}
                        onChange={(event) => onRoleFilterChange(role, event.target.checked)}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </details>
            </label>
          )}

          {uniqueAreas.length > 0 && (
            <label className="filter-select-field">
              <span className="filter-chip-label">{areaFilterLabel}</span>
              <details className={`filter-multi${areaFilters.size > 0 ? ' active' : ''}`}>
                <summary>{areaFilterLabel}: {areaFilters.size ? `${areaFilters.size} seleccionados` : 'Todas'}</summary>
                <div className="filter-multi-options">
                  {uniqueAreas.map((area) => (
                    <label key={area}>
                      <input
                        type="checkbox"
                        checked={areaFilters.has(area)}
                        onChange={(event) => onAreaFilterChange(area, event.target.checked)}
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </details>
            </label>
          )}

          <div className="filter-select-field">
            <span className="filter-chip-label">Certificado</span>
            <div className="filter-seg">
              <button
                type="button"
                className={`filter-seg-btn${sendFilter === 'all' ? ' active' : ''}`}
                onClick={() => onSendFilterChange('all')}
              >
                Todos
              </button>
              <button
                type="button"
                className={`filter-seg-btn${sendFilter === 'yes' ? ' active' : ''}`}
                onClick={() => onSendFilterChange('yes')}
              >
                Sí
              </button>
              <button
                type="button"
                className={`filter-seg-btn${sendFilter === 'no' ? ' active' : ''}`}
                onClick={() => onSendFilterChange('no')}
              >
                No
              </button>
            </div>
          </div>

          {hasFiltersApplied && (
            <button
              type="button"
              className="filter-chip"
              style={{
                marginLeft: 'auto',
                borderColor: 'var(--status-danger-border)',
                color: 'var(--status-danger-text)',
                backgroundColor: 'var(--status-danger-bg)',
              }}
              onClick={onClearFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useOrganizers } from '../../../application/hooks/useOrganizers';
import { useParticipantCertificates } from '../../../application/hooks/useParticipantCertificates';
import { Organizer } from '../../../domain/models/organizer.model';
import { ParticipantCertificate } from '../../../domain/models/participant-certificate.model';
import { appsScriptOrganizerRepository } from '../../../infrastructure/repositories/apps-script-organizer.repository';
import { appsScriptParticipantCertificateRepository } from '../../../infrastructure/repositories/apps-script-participant-certificate.repository';
import { CertificateGenerationItem } from '../../../domain/repositories/organizer.repository';
import { GOOGLE_SHEETS_CONFIG } from '../../../infrastructure/config/endpoints.config';
import {
  CertificateStatusCards,
  CertificateFilters,
  CertificateTable,
  CertificateTableSkeleton,
  GenerateBatchModal,
  DriveConfigModal,
  OrganizerHoursConfig,
  getDriveConfig,
} from './components';

export const CertificatesPage: React.FC = () => {
  const { organizers, loading: loadingOrganizers, error: errorOrganizers, refetch: refetchOrganizers } = useOrganizers();
  const { participants, loading: loadingParticipants, error: errorParticipants, refetch: refetchParticipants } = useParticipantCertificates();

  useEffect(() => {
    document.title = 'Gestión de Certificados - Innovathon Manager';
  }, []);

  const [activeTab, setActiveTab] = useState<'organizers' | 'participants'>('organizers');
  const [driveFolderId, setDriveFolderId] = useState<string>(() => getDriveConfig().folderId);

  // Filters state
  const [search, setSearch] = useState('');
  const [roleFilters, setRoleFilters] = useState<Set<string>>(new Set());
  const [areaFilters, setAreaFilters] = useState<Set<string>>(new Set());
  const [sendFilter, setSendFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});

  // Datasets state
  const [orgState, setOrgState] = useState<Organizer[]>([]);
  const [partState, setPartState] = useState<ParticipantCertificate[]>([]);
  const [hoursMap, setHoursMap] = useState<Record<string, OrganizerHoursConfig>>({});

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDriveConfigOpen, setIsDriveConfigOpen] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccessNotice, setBatchSuccessNotice] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());

  // Sync organizers data
  useEffect(() => {
    setOrgState(organizers);
    // Initialize hours map with default includeHours: false, hours: 120
    setHoursMap((prev) => {
      const next = { ...prev };
      organizers.forEach((o) => {
        if (!next[o.identifier]) {
          next[o.identifier] = { includeHours: false, hours: 120 };
        }
      });
      return next;
    });
  }, [organizers]);

  // Sync participants data into ParticipantCertificate
  useEffect(() => {
    setPartState(participants);
    setHoursMap((prev) => {
      const next = { ...prev };
      participants.forEach((p) => {
        if (!next[p.identifier]) {
          next[p.identifier] = { includeHours: false, hours: 120 };
        }
      });
      return next;
    });
  }, [participants]);

  // Listen or refresh drive config when modal closes or saves
  const refreshDriveFolder = () => {
    setDriveFolderId(getDriveConfig().folderId);
  };

  // Determine current active population dataset and loading/error
  const isOrganizersTab = activeTab === 'organizers';
  const activeSpreadsheetId = isOrganizersTab
    ? GOOGLE_SHEETS_CONFIG.organizersSpreadsheetId
    : GOOGLE_SHEETS_CONFIG.participantsSpreadsheetId;

  const currentList = isOrganizersTab ? orgState : partState;
  const currentLoading = isOrganizersTab ? loadingOrganizers : loadingParticipants;
  const currentError = isOrganizersTab ? errorOrganizers : errorParticipants;

  // Filter options for current active tab
  const uniqueRoles = useMemo(
    () => Array.from(new Set(currentList.map((item) => item.role).filter(Boolean))).sort(),
    [currentList]
  );

  const uniqueAreasOrTeams = useMemo(() => {
    if (isOrganizersTab) {
      return Array.from(new Set((orgState).map((o) => o.area).filter(Boolean))).sort();
    }
    return Array.from(new Set((partState).map((p) => p.team).filter(Boolean))).sort();
  }, [isOrganizersTab, orgState, partState]);

  // Filtered dataset
  const filtered = useMemo(() => {
    return currentList.filter((item) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesId = item.identifier.toLowerCase().includes(q);
        const matchesDni = (item.dni || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDni) return false;
      }
      if (roleFilters.size > 0 && !roleFilters.has(item.role)) return false;

      if (areaFilters.size > 0) {
        const groupVal = isOrganizersTab ? (item as Organizer).area : (item as ParticipantCertificate).team;
        if (!areaFilters.has(groupVal)) return false;
      }

      if (sendFilter === 'yes' && !item.sendCertificate) return false;
      if (sendFilter === 'no' && item.sendCertificate) return false;

      return true;
    });
  }, [currentList, search, roleFilters, areaFilters, isOrganizersTab, sendFilter]);

  // Status metrics for current list
  const totalCount = currentList.length;
  const generatedCount = useMemo(() => {
    return currentList.filter((item) => {
      const st = item.generationStatus?.trim().toLowerCase();
      return st === 'generado' || st === 'emitido';
    }).length;
  }, [currentList]);

  const pendingCount = useMemo(() => {
    return currentList.filter((item) => {
      const st = item.generationStatus?.trim().toLowerCase();
      return item.sendCertificate && st !== 'generado' && st !== 'emitido';
    }).length;
  }, [currentList]);

  const omittedCount = useMemo(() => {
    return currentList.filter((item) => !item.sendCertificate).length;
  }, [currentList]);

  const readyCount = pendingCount;

  const selectableFilteredCount = useMemo(() => {
    return filtered.filter(
      (item) => item.generationStatus?.trim().toLowerCase() !== 'generado' && item.generationStatus?.trim().toLowerCase() !== 'emitido'
    ).length;
  }, [filtered]);

  const cancelBatchRef = React.useRef(false);

  function handleCancelBatch() {
    cancelBatchRef.current = true;
    setBatchSuccessNotice('Cancelando emisión... esperando a que termine el lote en curso.');
  }

  // Toggle handlers
  async function handleToggleSendCertificate(identifier: string, currentValue: boolean) {
    const newValue = !currentValue;
    setToggleErrors((prev) => ({ ...prev, [identifier]: '' }));

    if (isOrganizersTab) {
      const prevOrg = orgState.find((o) => o.identifier === identifier);
      const isAlreadyGen = prevOrg?.generationStatus?.trim().toLowerCase() === 'generado';
      if (isAlreadyGen) return;

      setOrgState((prev) =>
        prev.map((o) =>
          o.identifier === identifier
            ? { ...o, sendCertificate: newValue, generationStatus: newValue ? 'Pendiente' : '' }
            : o
        )
      );
      try {
        await appsScriptOrganizerRepository.updateSendCertificate(identifier, newValue);
      } catch (err) {
        setOrgState((prev) =>
          prev.map((o) => (o.identifier === identifier ? (prevOrg || o) : o))
        );
        setToggleErrors((prev) => ({
          ...prev,
          [identifier]: err instanceof Error ? err.message : 'Error al actualizar.',
        }));
      }
    } else {
      const prevPart = partState.find((p) => p.identifier === identifier);
      const isAlreadyGen = prevPart?.generationStatus?.trim().toLowerCase() === 'generado';
      if (isAlreadyGen) return;

      setPartState((prev) =>
        prev.map((p) =>
          p.identifier === identifier
            ? { ...p, sendCertificate: newValue, generationStatus: newValue ? 'Pendiente' : '' }
            : p
        )
      );
      try {
        await appsScriptParticipantCertificateRepository.updateSendCertificate(identifier, newValue);
      } catch (err) {
        setPartState((prev) =>
          prev.map((p) => (p.identifier === identifier ? (prevPart || p) : p))
        );
        setToggleErrors((prev) => ({
          ...prev,
          [identifier]: err instanceof Error ? err.message : 'Error al actualizar.',
        }));
      }
    }
  }

  // Bulk actions for current tab with real sheet persistence
  async function handleSelectAllFiltered() {
    const targets = filtered.filter(
      (item) => item.generationStatus?.trim().toLowerCase() !== 'generado'
    );
    const ids = targets.map((item) => item.identifier);
    if (ids.length === 0) return;

    const previousOrgState = [...orgState];
    const previousPartState = [...partState];

    setIsBulkUpdating(true);
    if (isOrganizersTab) {
      const idSet = new Set(ids);
      setOrgState((prev) =>
        prev.map((o) =>
          idSet.has(o.identifier)
            ? {
                ...o,
                sendCertificate: true,
                generationStatus: o.generationStatus?.trim().toLowerCase() === 'generado' ? o.generationStatus : 'Pendiente',
              }
            : o
        )
      );
      try {
        await appsScriptOrganizerRepository.updateBulkSendCertificate(ids, true);
        setBatchSuccessNotice(`Se seleccionaron ${ids.length} organizadores correctamente.`);
        setTimeout(() => setBatchSuccessNotice(null), 4000);
      } catch (err) {
        setOrgState(previousOrgState);
        setBatchSuccessNotice(`Error al guardar en Google Sheet: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setIsBulkUpdating(false);
      }
    } else {
      const idSet = new Set(ids);
      setPartState((prev) =>
        prev.map((p) =>
          idSet.has(p.identifier)
            ? {
                ...p,
                sendCertificate: true,
                generationStatus: p.generationStatus?.trim().toLowerCase() === 'generado' ? p.generationStatus : 'Pendiente',
              }
            : p
        )
      );
      try {
        await appsScriptParticipantCertificateRepository.updateBulkSendCertificate(ids, true);
        setBatchSuccessNotice(`Se seleccionaron ${ids.length} participantes correctamente.`);
        setTimeout(() => setBatchSuccessNotice(null), 4000);
      } catch (err) {
        setPartState(previousPartState);
        setBatchSuccessNotice(`Error al guardar en Google Sheet: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setIsBulkUpdating(false);
      }
    }
  }

  async function handleDeselectAll() {
    // Only deselect records that are NOT already 'Generado'
    const targets = currentList.filter(
      (item) => item.sendCertificate && item.generationStatus?.trim().toLowerCase() !== 'generado'
    );
    const ids = targets.map((item) => item.identifier);
    if (ids.length === 0) return;

    const previousOrgState = [...orgState];
    const previousPartState = [...partState];

    setIsBulkUpdating(true);
    if (isOrganizersTab) {
      const idSet = new Set(ids);
      setOrgState((prev) =>
        prev.map((o) =>
          idSet.has(o.identifier)
            ? { ...o, sendCertificate: false, generationStatus: '' }
            : o
        )
      );
      try {
        await appsScriptOrganizerRepository.updateBulkSendCertificate(ids, false);
        setBatchSuccessNotice(`Se desmarcaron ${ids.length} organizadores correctamente.`);
        setTimeout(() => setBatchSuccessNotice(null), 4000);
      } catch (err) {
        setOrgState(previousOrgState);
        setBatchSuccessNotice(`Error al actualizar en Google Sheet: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setIsBulkUpdating(false);
      }
    } else {
      const idSet = new Set(ids);
      setPartState((prev) =>
        prev.map((p) =>
          idSet.has(p.identifier)
            ? { ...p, sendCertificate: false, generationStatus: '' }
            : p
        )
      );
      try {
        await appsScriptParticipantCertificateRepository.updateBulkSendCertificate(ids, false);
        setBatchSuccessNotice(`Se desmarcaron ${ids.length} participantes correctamente.`);
        setTimeout(() => setBatchSuccessNotice(null), 4000);
      } catch (err) {
        setPartState(previousPartState);
        setBatchSuccessNotice(`Error al actualizar en Google Sheet: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setIsBulkUpdating(false);
      }
    }
  }

  async function handleRegenerateCertificate(identifier: string) {
    setRegeneratingIds((prev) => new Set(prev).add(identifier));
    if (isOrganizersTab) {
      try {
        await appsScriptOrganizerRepository.regenerateCertificate(identifier);
        setOrgState((prev) =>
          prev.map((o) =>
            o.identifier === identifier
              ? { ...o, sendCertificate: true, generationStatus: 'Pendiente', drivePdfUrl: undefined }
              : o
          )
        );
        setBatchSuccessNotice('Certificado reiniciado a Pendiente para volver a emitir.');
        setTimeout(() => setBatchSuccessNotice(null), 5000);
      } catch (err) {
        setBatchSuccessNotice(`Error al reiniciar certificado: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setRegeneratingIds((prev) => {
          const next = new Set(prev);
          next.delete(identifier);
          return next;
        });
      }
    } else {
      try {
        await appsScriptParticipantCertificateRepository.regenerateCertificate(identifier);
        setPartState((prev) =>
          prev.map((p) =>
            p.identifier === identifier
              ? { ...p, sendCertificate: true, generationStatus: 'Pendiente', drivePdfUrl: undefined }
              : p
          )
        );
        setBatchSuccessNotice('Certificado reiniciado a Pendiente para volver a emitir.');
        setTimeout(() => setBatchSuccessNotice(null), 5000);
      } catch (err) {
        setBatchSuccessNotice(`Error al reiniciar certificado: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setRegeneratingIds((prev) => {
          const next = new Set(prev);
          next.delete(identifier);
          return next;
        });
      }
    }
  }

  function handleToggleIncludeHours(identifier: string, includeHours: boolean) {
    setHoursMap((prev) => ({
      ...prev,
      [identifier]: {
        hours: prev[identifier]?.hours ?? 120,
        includeHours,
      },
    }));
  }

  function handleChangeHours(identifier: string, hours: number) {
    setHoursMap((prev) => ({
      ...prev,
      [identifier]: {
        includeHours: prev[identifier]?.includeHours ?? false,
        hours,
      },
    }));
  }

  function handleApplyBulkHours() {
    setHoursMap((prev) => {
      const next = { ...prev };
      currentList.forEach((item) => {
        if (item.sendCertificate) {
          next[item.identifier] = {
            includeHours: true,
            hours: 120,
          };
        }
      });
      return next;
    });
  }

  function handleRoleFilterChange(role: string, checked: boolean) {
    setRoleFilters((current) => {
      const next = new Set(current);
      if (checked) next.add(role);
      else next.delete(role);
      return next;
    });
  }

  function handleAreaFilterChange(area: string, checked: boolean) {
    setAreaFilters((current) => {
      const next = new Set(current);
      if (checked) next.add(area);
      else next.delete(area);
      return next;
    });
  }

  function handleClearFilters() {
    setSearch('');
    setRoleFilters(new Set());
    setAreaFilters(new Set());
    setSendFilter('all');
  }

  function handleTabChange(tab: 'organizers' | 'participants') {
    setActiveTab(tab);
    handleClearFilters();
  }

  async function handleConfirmBatch() {
    const targets = currentList.filter(
      (item) => item.sendCertificate && item.generationStatus?.trim().toLowerCase() !== 'generado'
    );
    if (targets.length === 0) {
      setIsBatchModalOpen(false);
      setBatchSuccessNotice('No hay personas pendientes para emitir certificados.');
      setTimeout(() => setBatchSuccessNotice(null), 4000);
      return;
    }

    const allItems: CertificateGenerationItem[] = targets.map((item) => {
      const cfg = hoursMap[item.identifier];
      return {
        identifier: item.identifier,
        fullName: item.fullName,
        role: item.role,
        area: isOrganizersTab ? (item as Organizer).area : (item as ParticipantCertificate).team,
        hours: cfg?.includeHours && (cfg.hours ?? 0) > 0 ? cfg.hours : 0,
      };
    });

    const CHUNK_SIZE = 5;
    const totalChunks = Math.ceil(allItems.length / CHUNK_SIZE);
    let totalGenerated = 0;
    cancelBatchRef.current = false;

    setIsProcessingBatch(true);
    setIsBatchModalOpen(false);

    try {
      for (let i = 0; i < allItems.length; i += CHUNK_SIZE) {
        if (cancelBatchRef.current) {
          setBatchSuccessNotice(
            `Generación cancelada por el usuario. Se emitieron ${totalGenerated} certificados antes de cancelar.`
          );
          setTimeout(() => setBatchSuccessNotice(null), 7000);
          return;
        }

        const chunk = allItems.slice(i, i + CHUNK_SIZE);
        const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
        setBatchSuccessNotice(
          `Generando lote ${chunkIndex} de ${totalChunks} (${Math.min(i + CHUNK_SIZE, allItems.length)} de ${allItems.length})...`
        );

        const response = isOrganizersTab
          ? await appsScriptOrganizerRepository.generateCertificates(chunk)
          : await appsScriptParticipantCertificateRepository.generateCertificates(chunk);

        totalGenerated += response.generatedCount;

        const generatedMap = new Map<string, string>();
        (response.results || []).forEach((res) => {
          if (res.pdfUrl) {
            generatedMap.set(res.identifier, res.pdfUrl);
          }
        });

        if (isOrganizersTab) {
          setOrgState((prev) =>
            prev.map((o) =>
              generatedMap.has(o.identifier)
                ? { ...o, generationStatus: 'Generado', drivePdfUrl: generatedMap.get(o.identifier) }
                : o
            )
          );
        } else {
          setPartState((prev) =>
            prev.map((p) =>
              generatedMap.has(p.identifier)
                ? { ...p, generationStatus: 'Generado', drivePdfUrl: generatedMap.get(p.identifier) }
                : p
            )
          );
        }
      }

      setBatchSuccessNotice(
        `¡Proceso completado! Se generaron ${totalGenerated} certificados en Google Drive.`
      );
      setTimeout(() => setBatchSuccessNotice(null), 6000);
    } catch (err) {
      setBatchSuccessNotice(
        `Generación interrumpida: ${err instanceof Error ? err.message : 'Error desconocido'}. Los generados previamente quedaron guardados.`
      );
      setTimeout(() => setBatchSuccessNotice(null), 8000);
    } finally {
      setIsProcessingBatch(false);
    }
  }

  const hasFiltersApplied = Boolean(
    roleFilters.size > 0 || areaFilters.size > 0 || sendFilter !== 'all' || search
  );

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Gestión de certificados</h1>
          <p className="page-subtitle">
            Supervisa la configuración y emisión automática de certificados en PDF guardados en Google Drive.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsDriveConfigOpen(true)}
            title="Configurar carpeta destino de Drive y plantilla de Google Slides"
          >
            <Icon name="settings" />
            <span>Configurar Drive</span>
          </button>
          <Link to="/" className="btn btn-secondary">
            <Icon name="arrowLeft" />
            <span>Volver al panel</span>
          </Link>
        </div>
      </div>

      {isProcessingBatch ? (
        <div className="notice-banner certificate-batch-progress" role="status">
          <div className="certificate-batch-progress-message">
            <span className="spinning certificate-batch-progress-icon">
              <Icon name="refresh" size={18} />
            </span>
            <span style={{ fontWeight: 600 }}>
              {batchSuccessNotice || 'Emitiendo certificados en Google Drive...'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm certificate-batch-cancel"
            onClick={handleCancelBatch}
          >
            Cancelar emisión
          </button>
        </div>
      ) : batchSuccessNotice && (
        <div className="notice-banner notice-success" role="status">
          <Icon name="checkCircle" />
          <span>{batchSuccessNotice}</span>
        </div>
      )}

      {/* Tabs de población (Organizadores vs Participantes) */}
      <div className="cert-population-tabs" role="tablist" aria-label="Población de certificados">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'organizers'}
          className={`cert-tab-btn${activeTab === 'organizers' ? ' active' : ''}`}
          onClick={() => handleTabChange('organizers')}
        >
          <Icon name="users" size={18} />
          <span>Organizadores</span>
          <span className="cert-tab-badge">{orgState.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'participants'}
          className={`cert-tab-btn${activeTab === 'participants' ? ' active' : ''}`}
          onClick={() => handleTabChange('participants')}
        >
          <Icon name="award" size={18} />
          <span>Participantes</span>
          <span className="cert-tab-badge">{partState.length}</span>
        </button>
      </div>

      {/* Tarjetas de estado / métricas */}
      <CertificateStatusCards
        totalCount={totalCount}
        pendingCount={pendingCount}
        generatedCount={generatedCount}
        omittedCount={omittedCount}
        populationLabel={isOrganizersTab ? 'organizadores' : 'participantes'}
      />

      {/* Panel de filtros y control de lote */}
      <CertificateFilters
        search={search}
        onSearchChange={setSearch}
        uniqueRoles={uniqueRoles}
        roleFilters={roleFilters}
        onRoleFilterChange={handleRoleFilterChange}
        uniqueAreas={uniqueAreasOrTeams}
        areaFilters={areaFilters}
        onAreaFilterChange={handleAreaFilterChange}
        sendFilter={sendFilter}
        onSendFilterChange={setSendFilter}
        onClearFilters={handleClearFilters}
        readyCount={readyCount}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        hasFiltersApplied={hasFiltersApplied}
        showFilters={!currentLoading && !currentError && currentList.length > 0}
        roleFilterLabel={isOrganizersTab ? 'Rol' : 'Reto / Eje'}
        areaFilterLabel={isOrganizersTab ? 'Área' : 'Institución'}
        driveFolderId={driveFolderId}
        spreadsheetId={activeSpreadsheetId}
        onSelectAllFiltered={handleSelectAllFiltered}
        onDeselectAll={handleDeselectAll}
        isBulkUpdating={isBulkUpdating || isProcessingBatch}
        filteredCount={selectableFilteredCount}
        onRefresh={() => {
          if (isOrganizersTab) {
            refetchOrganizers();
          } else {
            refetchParticipants();
          }
        }}
        isLoading={currentLoading}
      />

      {/* Contenido principal: Tabla o estados vacíos */}
      <div className="content-box">
        {currentLoading ? (
          <CertificateTableSkeleton
            populationLabel={isOrganizersTab ? 'Organizadores' : 'Participantes'}
            population={isOrganizersTab ? 'organizadores' : 'participantes'}
          />
        ) : currentError ? (
          <p role="alert">{currentError}</p>
        ) : currentList.length === 0 ? (
          <p>No hay {isOrganizersTab ? 'organizadores registrados' : 'participantes registrados'}.</p>
        ) : (
          <CertificateTable
            organizers={filtered}
            hoursMap={hoursMap}
            onToggleSendCertificate={handleToggleSendCertificate}
            onToggleIncludeHours={handleToggleIncludeHours}
            onChangeHours={handleChangeHours}
            onApplyBulkHours={handleApplyBulkHours}
            onRegenerateCertificate={handleRegenerateCertificate}
            regeneratingIds={regeneratingIds}
            toggleErrors={toggleErrors}
            activeCount={readyCount}
            totalCount={totalCount}
            populationLabel={isOrganizersTab ? 'Organizadores' : 'Participantes'}
            population={isOrganizersTab ? 'organizadores' : 'participantes'}
            isLocked={isProcessingBatch || isBulkUpdating}
          />
        )}

        {currentList.length === 0 && !currentLoading && !currentError && (
          <div className="empty-state">
            <div className="empty-icon-box">
              <Icon name="fileText" />
            </div>
            <h3 className="empty-title">Sin certificados procesados</h3>
            <p className="empty-desc">
              Configura la plantilla en <strong>Google Slides</strong> y la carpeta de destino en <strong>Google Drive</strong> para emitir certificados en PDF para {isOrganizersTab ? 'el equipo organizador' : 'los participantes'}.
            </p>
            <div className="integration-preview-badge">
              <Icon name="info" />
              <span>Estado: Módulo de generación en Drive preparado</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para generación de lote */}
      <GenerateBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        organizers={currentList}
        hoursMap={hoursMap}
        onConfirm={handleConfirmBatch}
        isProcessing={isProcessingBatch}
        populationLabel={isOrganizersTab ? 'organizadores' : 'participantes'}
      />

      {/* Modal de configuración de Google Drive */}
      <DriveConfigModal
        isOpen={isDriveConfigOpen}
        onClose={() => {
          setIsDriveConfigOpen(false);
          refreshDriveFolder();
        }}
        onSave={() => {
          refreshDriveFolder();
        }}
      />
    </>
  );
};

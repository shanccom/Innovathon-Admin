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
import { AREA_DIRECTOR_ROLE_KEY, OrgEmissionType } from '../../../domain/models/certificate-type.model';
import { filterCertificateRecords, getBulkCertificateTargets } from './certificate-table.utils';
import {
  CertificateStatusCards,
  CertificateFilters,
  CertificateTable,
  CertificateTableSkeleton,
  GenerateBatchModal,
  DriveConfigModal,
  getDriveConfig,
  EmptyStatePending,
} from './components';

export const CertificatesPage: React.FC = () => {
  const { organizers, loading: loadingOrganizers, error: errorOrganizers, refetch: refetchOrganizers } = useOrganizers();
  const { participants, loading: loadingParticipants, error: errorParticipants, refetch: refetchParticipants } = useParticipantCertificates();

  useEffect(() => {
    document.title = 'Gestión de Certificados - Innovathon Manager';
  }, []);

  const [activeTab, setActiveTab] = useState<'organizers' | 'participants' | 'speakers' | 'sponsors'>('organizers');
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

  // Sub-lists derived from orgState
  const areaDirectorState = useMemo(
    () => orgState.filter((o) => o.role.toLowerCase() === AREA_DIRECTOR_ROLE_KEY),
    [orgState]
  );

  const orgVolState = useMemo(
    () => orgState.filter((o) => o.role.toLowerCase() !== AREA_DIRECTOR_ROLE_KEY),
    [orgState]
  );

  // Per-person emission type preference for the Org/Vol section
  const emissionTypeMap = useMemo(() => Object.fromEntries(
    orgState.filter(o => o.templateType === 'organizer' || o.templateType === 'volunteer')
      .map(o => [o.identifier, o.templateType as OrgEmissionType])
  ), [orgState]);
  const [savingTemplateIds, setSavingTemplateIds] = useState<Set<string>>(new Set());
  const [templateErrors, setTemplateErrors] = useState<Record<string, string>>({});

  async function handleEmissionTypeChange(identifier: string, type: OrgEmissionType) {
    setSavingTemplateIds(prev => new Set(prev).add(identifier));
    setTemplateErrors(prev => ({ ...prev, [identifier]: '' }));
    try {
      await appsScriptOrganizerRepository.updateTemplateType(identifier, type);
      setOrgState(prev => prev.map(o => o.identifier === identifier ? { ...o, templateType: type } : o));
    } catch (error) {
      setTemplateErrors(prev => ({ ...prev, [identifier]: error instanceof Error ? error.message : 'No se pudo guardar el tipo de emisión. Intenta de nuevo.' }));
    } finally {
      setSavingTemplateIds(prev => {
        const next = new Set(prev);
        next.delete(identifier);
        return next;
      });
    }
  }

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDriveConfigOpen, setIsDriveConfigOpen] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccessNotice, setBatchSuccessNotice] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkActionTable, setBulkActionTable] = useState<'directors' | 'organizers' | 'participants' | null>(null);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());

  // Sync organizers data
  useEffect(() => {
    setOrgState(organizers);
  }, [organizers]);

  // Sync participants data into ParticipantCertificate
  useEffect(() => {
    setPartState(participants);
  }, [participants]);

  // Listen or refresh drive config when modal closes or saves
  const refreshDriveFolder = () => {
    setDriveFolderId(getDriveConfig().folderId);
  };

  // Determine current active population dataset and loading/error
  const isOrganizersTab = activeTab === 'organizers';
  const isParticipantsTab = activeTab === 'participants';
  const activeSpreadsheetId = isOrganizersTab
    ? GOOGLE_SHEETS_CONFIG.organizersSpreadsheetId
    : GOOGLE_SHEETS_CONFIG.participantsSpreadsheetId;

  const currentList = isOrganizersTab ? orgState : isParticipantsTab ? partState : [];
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

  // Shared filters apply to the entire active population before it is split into tables.
  const filtered = useMemo<Array<Organizer | ParticipantCertificate>>(() => {
    const filters = {
      search,
      roles: roleFilters,
      areas: areaFilters,
      sendFilter,
    };
    if (isOrganizersTab) {
      return filterCertificateRecords(orgState, filters, (item) => item.area);
    }
    if (isParticipantsTab) {
      return filterCertificateRecords(partState, filters, (item) => item.team);
    }
    return [];
  }, [isOrganizersTab, isParticipantsTab, orgState, partState, search, roleFilters, areaFilters, sendFilter]);

  const filteredAreaDirectors = useMemo(
    () => isOrganizersTab ? filtered.filter((item) => item.role.toLowerCase() === AREA_DIRECTOR_ROLE_KEY) : [],
    [filtered, isOrganizersTab]
  );
  const filteredOrgVol = useMemo(
    () => isOrganizersTab ? filtered.filter((item) => item.role.toLowerCase() !== AREA_DIRECTOR_ROLE_KEY) : [],
    [filtered, isOrganizersTab]
  );

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

  // Each table passes only its filtered rows; the repository persists each action in one Sheet request.
  async function handleBulkUpdateTable(
    targets: Array<Organizer | ParticipantCertificate>,
    select: boolean,
    table: 'directors' | 'organizers' | 'participants'
  ) {
    const eligibleTargets = getBulkCertificateTargets(targets, select);
    const ids = eligibleTargets.map((item) => item.identifier);
    if (ids.length === 0 || isBulkUpdating) return;

    const previousOrgState = [...orgState];
    const previousPartState = [...partState];

    setIsBulkUpdating(true);
    setBulkActionTable(table);
    if (isOrganizersTab) {
      const idSet = new Set(ids);
      setOrgState((prev) =>
        prev.map((o) =>
          idSet.has(o.identifier)
            ? {
                ...o,
                sendCertificate: select,
                generationStatus: select ? 'Pendiente' : '',
              }
            : o
        )
      );
      try {
        const updatedCount = await appsScriptOrganizerRepository.updateBulkSendCertificate(ids, select);
        const label = table === 'directors' ? 'directores de área' : 'organizadores y voluntarios';
        setBatchSuccessNotice(`${select ? 'Se seleccionaron' : 'Se desmarcaron'} ${updatedCount} ${label}.`);
        setTimeout(() => setBatchSuccessNotice(null), 4000);
      } catch (err) {
        setOrgState(previousOrgState);
        setBatchSuccessNotice(`Error al actualizar en Google Sheet: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setIsBulkUpdating(false);
        setBulkActionTable(null);
      }
    } else {
      const idSet = new Set(ids);
      setPartState((prev) =>
        prev.map((p) =>
          idSet.has(p.identifier)
            ? {
                ...p,
                sendCertificate: select,
                generationStatus: select ? 'Pendiente' : '',
              }
            : p
        )
      );
      try {
        const updatedCount = await appsScriptParticipantCertificateRepository.updateBulkSendCertificate(ids, select);
        setBatchSuccessNotice(`${select ? 'Se seleccionaron' : 'Se desmarcaron'} ${updatedCount} participantes.`);
        setTimeout(() => setBatchSuccessNotice(null), 4000);
      } catch (err) {
        setPartState(previousPartState);
        setBatchSuccessNotice(`Error al actualizar en Google Sheet: ${err instanceof Error ? err.message : 'Fallo'}`);
        setTimeout(() => setBatchSuccessNotice(null), 6000);
      } finally {
        setIsBulkUpdating(false);
        setBulkActionTable(null);
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

  function handleTabChange(tab: 'organizers' | 'participants' | 'speakers' | 'sponsors') {
    setActiveTab(tab);
    handleClearFilters();
  }

  async function handleConfirmBatch() {
    const targets = currentList.filter(
      (item) => item.sendCertificate && !['generado', 'emitido'].includes(item.generationStatus?.trim().toLowerCase() || '')
    );
    if (targets.length === 0) {
      setIsBatchModalOpen(false);
      setBatchSuccessNotice('No hay personas pendientes para emitir certificados.');
      setTimeout(() => setBatchSuccessNotice(null), 4000);
      return;
    }

    const missingTypes = isOrganizersTab
      ? targets.filter(item => item.role.toLowerCase() !== AREA_DIRECTOR_ROLE_KEY && !emissionTypeMap[item.identifier])
      : [];
    if (savingTemplateIds.size || missingTypes.length) {
      setIsBatchModalOpen(false);
      setBatchSuccessNotice(savingTemplateIds.size
        ? 'Espera a que termine de guardarse el tipo de emisión antes de generar.'
        : `Selecciona el tipo de emisión para ${missingTypes.map(item => item.fullName).join(', ')} antes de generar.`);
      return;
    }

    const allItems: CertificateGenerationItem[] = targets.map((item) => {
      return {
        identifier: item.identifier,
        fullName: item.fullName,
        role: item.role,
        templateType: isParticipantsTab
          ? 'participant'
          : item.role.toLowerCase() === AREA_DIRECTOR_ROLE_KEY
            ? 'area_director'
            : emissionTypeMap[item.identifier],
        area: isOrganizersTab ? (item as Organizer).area : (item as ParticipantCertificate).team,
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
  const isBatchNoticeError = /^(Error|Generación interrumpida|Selecciona|Espera)/.test(batchSuccessNotice || '');

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
        <div className={`notice-banner ${isBatchNoticeError ? 'certificate-notice-error' : 'notice-success'}`} role={isBatchNoticeError ? 'alert' : 'status'}>
          <Icon name={isBatchNoticeError ? 'alertCircle' : 'checkCircle'} />
          <span>{batchSuccessNotice}</span>
        </div>
      )}

      {/* Tabs de población (Organizadores vs Participantes) */}
      <div className="cert-population-tabs" role="tablist" aria-label="Tipo de certificado">
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
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'speakers'}
          className={`cert-tab-btn${activeTab === 'speakers' ? ' active' : ''} cert-tab-btn-pending`}
          onClick={() => handleTabChange('speakers')}
        >
          <Icon name="mic" size={18} />
          <span>Speakers</span>
          <span className="cert-tab-badge cert-tab-badge-pending">Próx.</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sponsors'}
          className={`cert-tab-btn${activeTab === 'sponsors' ? ' active' : ''} cert-tab-btn-pending`}
          onClick={() => handleTabChange('sponsors')}
        >
          <Icon name="star" size={18} />
          <span>Auspicios</span>
          <span className="cert-tab-badge cert-tab-badge-pending">Próx.</span>
        </button>
      </div>

      {/* Tarjetas de estado / métricas */}
      {(isOrganizersTab || isParticipantsTab) && (
        <CertificateStatusCards
          totalCount={totalCount}
          pendingCount={pendingCount}
          generatedCount={generatedCount}
          omittedCount={omittedCount}
          populationLabel={isOrganizersTab ? 'organizadores' : 'participantes'}
        />
      )}

      {/* Panel de filtros y control de lote */}
      {(isOrganizersTab || isParticipantsTab) && (
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
            isBulkUpdating={isBulkUpdating || isProcessingBatch}
          onRefresh={() => {
            if (isOrganizersTab) {
              refetchOrganizers();
            } else {
              refetchParticipants();
            }
          }}
          isLoading={currentLoading}
        />
      )}

      {/* Contenido principal: Tabla o estados vacíos */}

      {/* Sección 1 — Directores de Área (solo en tab organizadores) */}
      {isOrganizersTab && areaDirectorState.length > 0 && (
        <div className="content-box" style={{ marginBottom: '16px' }}>
          <div className="cert-section-header">
            <div className="cert-section-label cert-section-label-director">
              <Icon name="shield" size={14} />
              <h2>Directores de Área</h2>
            </div>
            <span className="cert-section-count">
              {hasFiltersApplied ? `${filteredAreaDirectors.length} de ${areaDirectorState.length}` : areaDirectorState.length} persona{areaDirectorState.length !== 1 ? 's' : ''}
            </span>
          </div>
          {loadingOrganizers ? (
            <CertificateTableSkeleton populationLabel="Directores de Área" population="organizadores" />
          ) : (
            <CertificateTable
              organizers={filteredAreaDirectors}
              onToggleSendCertificate={handleToggleSendCertificate}
              onRegenerateCertificate={handleRegenerateCertificate}
              regeneratingIds={regeneratingIds}
              toggleErrors={toggleErrors}
              activeCount={filteredAreaDirectors.filter(o => o.sendCertificate).length}
              totalCount={filteredAreaDirectors.length}
              populationLabel="Directores de Área"
              population="organizadores"
              isLocked={isProcessingBatch || isBulkUpdating}
              onSelectAllVisible={() => void handleBulkUpdateTable(filteredAreaDirectors, true, 'directors')}
              onDeselectAllVisible={() => void handleBulkUpdateTable(filteredAreaDirectors, false, 'directors')}
              selectableCount={getBulkCertificateTargets(filteredAreaDirectors, true).length}
              deselectableCount={getBulkCertificateTargets(filteredAreaDirectors, false).length}
              bulkActionPending={bulkActionTable === 'directors'}
            />
          )}
        </div>
      )}

      {/* Sección 2 — Organizadores & Voluntarios (solo en tab organizadores) */}
      {isOrganizersTab && (
        <div className="content-box">
          <div className="cert-section-header">
            <div className="cert-section-label">
              <Icon name="users" size={14} />
              <h2>Organizadores &amp; Voluntarios</h2>
            </div>
            <span className="cert-section-count">
              {hasFiltersApplied ? `${filteredOrgVol.length} de ${orgVolState.length}` : orgVolState.length} persona{orgVolState.length !== 1 ? 's' : ''}
            </span>
          </div>
          {loadingOrganizers ? (
            <CertificateTableSkeleton populationLabel="Organizadores" population="organizadores" />
          ) : errorOrganizers ? (
            <p role="alert">{errorOrganizers}</p>
          ) : orgVolState.length === 0 ? (
            <p>No hay organizadores registrados.</p>
          ) : (
            <CertificateTable
              organizers={filteredOrgVol}
              onToggleSendCertificate={handleToggleSendCertificate}
              onRegenerateCertificate={handleRegenerateCertificate}
              regeneratingIds={regeneratingIds}
              toggleErrors={toggleErrors}
              activeCount={filteredOrgVol.filter(o => o.sendCertificate).length}
              totalCount={filteredOrgVol.length}
              populationLabel="Organizadores"
              population="organizadores"
              isLocked={isProcessingBatch || isBulkUpdating}
              emissionTypeMap={emissionTypeMap}
              onEmissionTypeChange={handleEmissionTypeChange}
              savingTemplateIds={savingTemplateIds}
              templateErrors={templateErrors}
              onSelectAllVisible={() => void handleBulkUpdateTable(filteredOrgVol, true, 'organizers')}
              onDeselectAllVisible={() => void handleBulkUpdateTable(filteredOrgVol, false, 'organizers')}
              selectableCount={getBulkCertificateTargets(filteredOrgVol, true).length}
              deselectableCount={getBulkCertificateTargets(filteredOrgVol, false).length}
              bulkActionPending={bulkActionTable === 'organizers'}
            />
          )}
        </div>
      )}

      {/* Sección — Participantes */}
      {isParticipantsTab && (
        <div className="content-box">
          {loadingParticipants ? (
            <CertificateTableSkeleton
              populationLabel="Participantes"
              population="participantes"
            />
          ) : errorParticipants ? (
            <p role="alert">{errorParticipants}</p>
          ) : partState.length === 0 ? (
            <>
              <p>No hay participantes registrados.</p>
              <div className="empty-state">
                <div className="empty-icon-box">
                  <Icon name="fileText" />
                </div>
                <h3 className="empty-title">Sin certificados procesados</h3>
                <p className="empty-desc">
                  Configura la plantilla en <strong>Google Slides</strong> y la carpeta de destino en <strong>Google Drive</strong> para emitir certificados en PDF para los participantes.
                </p>
                <div className="integration-preview-badge">
                  <Icon name="info" />
                  <span>Estado: Módulo de generación en Drive preparado</span>
                </div>
              </div>
            </>
          ) : (
            <CertificateTable
              organizers={filtered}
              onToggleSendCertificate={handleToggleSendCertificate}
              onRegenerateCertificate={handleRegenerateCertificate}
              regeneratingIds={regeneratingIds}
              toggleErrors={toggleErrors}
              activeCount={filtered.filter((p) => p.sendCertificate).length}
              totalCount={filtered.length}
              populationLabel="Participantes"
              population="participantes"
              isLocked={isProcessingBatch || isBulkUpdating}
              onSelectAllVisible={() => void handleBulkUpdateTable(filtered, true, 'participants')}
              onDeselectAllVisible={() => void handleBulkUpdateTable(filtered, false, 'participants')}
              selectableCount={getBulkCertificateTargets(filtered, true).length}
              deselectableCount={getBulkCertificateTargets(filtered, false).length}
              bulkActionPending={bulkActionTable === 'participants'}
            />
          )}
        </div>
      )}

      {/* Tabs pendientes */}
      {activeTab === 'speakers' && (
        <EmptyStatePending
          title="Speakers — Próximamente"
          description="La hoja de Google Sheets para Speakers aún no está vinculada. Una vez integrada, podrás gestionar y emitir certificados de ponencia desde aquí."
          iconName="mic"
        />
      )}

      {activeTab === 'sponsors' && (
        <EmptyStatePending
          title="Auspicios & Patrocinios — Próximamente"
          description="La hoja de Google Sheets para Auspicios y Patrocinios aún no está vinculada. Una vez integrada, podrás gestionar y emitir certificados de reconocimiento desde aquí."
          iconName="star"
        />
      )}

      {/* Modal de confirmación para generación de lote */}
      <GenerateBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        organizers={currentList}
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

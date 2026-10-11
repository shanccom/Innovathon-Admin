import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AnnouncementCampaign,
  AnnouncementRecipient,
  CampaignSendProgress,
  EmailTemplate,
  SpamEvaluation,
  TestEmailResult,
} from '../../domain/models/announcement.model';
import { useParticipants } from './useParticipants';
import { toTitleCase, extractFirstName, isValidEmail } from '../../infrastructure/utils/text-formatter';
import { optimizeImage } from '../../infrastructure/utils/image-optimizer';
import { evaluateSpamScore } from '../../infrastructure/utils/spam-checker';
import { sendAnnouncementUseCase } from '../use-cases/send-announcement.use-case';
import { previewAnnouncementUseCase } from '../use-cases/preview-announcement.use-case';

const DEFAULT_SUBJECT = '¡Información Importante! - Innovathon Mollendo 2026';
const DEFAULT_BODY = `Hola {{primer_nombre}},

Te escribimos desde el Comité Organizador de la Innovathon Mollendo 2026 para saludarte y compartir información relevante sobre tu participación.

Tu inscripción ha sido verificada en el equipo {{equipo | asignado en la jornada de apertura}} con el rol de {{rol}}.

Por favor, revisa el cronograma de actividades y mantente atento a los canales oficiales. Si necesitas actualizar algún dato o tienes consultas, responde directamente a este correo.

¡Nos vemos en Mollendo para innovar juntos!

Atentamente,
Comité Organizador Innovathon Mollendo 2026`;

export function useAnnouncements() {
  const { participants, loading: participantsLoading, refresh: refreshParticipants } = useParticipants();

  // Plantilla de correo
  const [template, setTemplate] = useState<EmailTemplate>({
    asunto: DEFAULT_SUBJECT,
    cuerpo: DEFAULT_BODY,
  });

  // Filtros
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyValidEmails, setOnlyValidEmails] = useState<boolean>(true);

  // Selección manual de destinatarios
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isManualSelectionMode, setIsManualSelectionMode] = useState<boolean>(false);

  // Índice de vista previa
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Estado de envío
  const [isSending, setIsSending] = useState<boolean>(false);
  const [progress, setProgress] = useState<CampaignSendProgress>({
    current: 0,
    total: 0,
    ultimoCorreo: '',
    porcentaje: 0,
    enviados: 0,
    errores: 0,
  });
  const [campaignResult, setCampaignResult] = useState<AnnouncementCampaign | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<AnnouncementCampaign[]>([]);

  // Notificaciones y retroalimentación
  const [testResult, setTestResult] = useState<TestEmailResult | null>(null);
  const [testSending, setTestSending] = useState<boolean>(false);
  const [imageOptimizationInfo, setImageOptimizationInfo] = useState<string | null>(null);

  // Mapear participantes reales de Sheets a destinatarios tipados con Title Case
  const allRecipients: AnnouncementRecipient[] = useMemo(() => {
    return participants.map((p) => {
      const nombreLimpio = toTitleCase(p.nombre);
      const primerNombre = extractFirstName(nombreLimpio);
      return {
        id: p.id,
        dni: p.dni,
        nombre: nombreLimpio,
        primerNombre,
        apellido: '',
        correo: p.correo,
        equipo: p.equipo,
        rol: p.rol,
        estado: p.estado,
      };
    });
  }, [participants]);

  // Obtener lista única de equipos y roles para los selects
  const availableTeams = useMemo(() => {
    const set = new Set<string>();
    allRecipients.forEach(r => {
      if (r.equipo && r.equipo !== 'Sin equipo asignado') set.add(r.equipo);
    });
    return Array.from(set).sort();
  }, [allRecipients]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    allRecipients.forEach(r => {
      if (r.rol) set.add(r.rol);
    });
    return Array.from(set).sort();
  }, [allRecipients]);

  // Destinatarios filtrados
  const filteredRecipients = useMemo(() => {
    return allRecipients.filter((r) => {
      if (teamFilter !== 'all' && r.equipo !== teamFilter) return false;
      if (roleFilter !== 'all' && r.rol !== roleFilter) return false;
      if (onlyValidEmails && (!r.correo || r.correo === '—' || !isValidEmail(r.correo))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.nombre.toLowerCase().includes(q);
        const matchesDni = r.dni.toLowerCase().includes(q);
        const matchesEmail = r.correo.toLowerCase().includes(q);
        const matchesTeam = r.equipo.toLowerCase().includes(q);
        if (!matchesName && !matchesDni && !matchesEmail && !matchesTeam) return false;
      }

      return true;
    });
  }, [allRecipients, teamFilter, roleFilter, onlyValidEmails, searchQuery]);

  // Destinatarios finales elegidos
  const targetRecipients = useMemo(() => {
    if (!isManualSelectionMode) {
      return filteredRecipients;
    }
    return filteredRecipients.filter(r => selectedIds.has(r.id));
  }, [filteredRecipients, isManualSelectionMode, selectedIds]);

  // Evaluación algorítmica Anti-Spam
  const spamEvaluation: SpamEvaluation = useMemo(() => {
    return evaluateSpamScore(template.asunto, template.cuerpo, Boolean(template.imagenBase64));
  }, [template.asunto, template.cuerpo, template.imagenBase64]);

  // Destinatario de muestra actual para vista previa
  const currentPreviewRecipient = useMemo(() => {
    if (targetRecipients.length === 0) {
      return {
        id: 'sample',
        dni: '72819203',
        nombre: 'Carlos Benavides Ríos',
        primerNombre: 'Carlos',
        apellido: '',
        correo: 'carlos.benavides@ejemplo.com',
        equipo: 'EcoInnovación Islay',
        rol: 'Líder de Equipo',
        estado: 'Registrado',
      };
    }
    const safeIdx = Math.max(0, Math.min(previewIndex, targetRecipients.length - 1));
    return targetRecipients[safeIdx];
  }, [targetRecipients, previewIndex]);

  // Generación de vista previa compilada
  const renderedPreview = useMemo(() => {
    return previewAnnouncementUseCase.generatePreview(template, currentPreviewRecipient);
  }, [template, currentPreviewRecipient]);

  // Cargar historial
  const loadHistory = useCallback(async () => {
    const hist = await sendAnnouncementUseCase.getHistory();
    setCampaignHistory(hist);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Acciones de edición de plantilla
  const setAsunto = (asunto: string) => setTemplate(t => ({ ...t, asunto }));
  const setCuerpo = (cuerpo: string) => setTemplate(t => ({ ...t, cuerpo }));

  const insertVariable = (varName: string) => {
    setTemplate(t => ({
      ...t,
      cuerpo: `${t.cuerpo} {{${varName}}}`,
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const opt = await optimizeImage(file, 800, 800, 0.82);
      setTemplate(t => ({
        ...t,
        imagenBase64: opt.base64,
        imagenTipo: opt.mimeType,
        imagenNombre: opt.fileName,
        imagenTamanoBytes: opt.sizeBytes,
      }));
      setImageOptimizationInfo(
        `Imagen optimizada: ${opt.width}x${opt.height} px, ${Math.round(opt.sizeBytes / 1024)} KB (-${opt.reductionPercent}% respecto al original).`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al procesar la imagen.');
    }
  };

  const removeImage = () => {
    setTemplate(t => ({
      ...t,
      imagenBase64: undefined,
      imagenTipo: undefined,
      imagenNombre: undefined,
      imagenTamanoBytes: undefined,
    }));
    setImageOptimizationInfo(null);
  };

  // Acciones de selección
  const toggleSelectRecipient = (id: string) => {
    if (!isManualSelectionMode) {
      setIsManualSelectionMode(true);
      const newSet = new Set(filteredRecipients.map(r => r.id));
      newSet.delete(id);
      setSelectedIds(newSet);
      return;
    }

    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    setIsManualSelectionMode(false);
    setSelectedIds(new Set(filteredRecipients.map(r => r.id)));
  };

  const deselectAll = () => {
    setIsManualSelectionMode(true);
    setSelectedIds(new Set());
  };

  // Enviar prueba individual
  const sendTest = async (testEmail: string) => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await sendAnnouncementUseCase.sendTest(template, testEmail, currentPreviewRecipient);
      setTestResult(res);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar la prueba';
      const failRes: TestEmailResult = { success: false, message, destinatario: testEmail };
      setTestResult(failRes);
      return failRes;
    } finally {
      setTestSending(false);
    }
  };

  // Despacho masivo con candado
  const sendCampaign = async (campaignName: string, confirmationWord: string) => {
    if (confirmationWord.trim().toUpperCase() !== 'ENVIAR') {
      throw new Error('Debes escribir "ENVIAR" para confirmar el despacho masivo.');
    }

    setIsSending(true);
    setProgress({
      current: 0,
      total: targetRecipients.length,
      ultimoCorreo: '',
      porcentaje: 0,
      enviados: 0,
      errores: 0,
    });

    try {
      const campaign = await sendAnnouncementUseCase.execute(
        campaignName,
        template,
        targetRecipients,
        confirmationWord,
        (prog) => {
          setProgress({
            current: prog.current,
            total: prog.total,
            ultimoCorreo: prog.ultimoCorreo,
            porcentaje: Math.round((prog.current / prog.total) * 100),
            enviados: prog.enviados,
            errores: prog.errores,
          });
        }
      );
      setCampaignResult(campaign);
      await loadHistory();
      return campaign;
    } finally {
      setIsSending(false);
    }
  };

  return {
    // Datos y listas
    allRecipients,
    filteredRecipients,
    targetRecipients,
    availableTeams,
    availableRoles,
    participantsLoading,
    refreshParticipants,

    // Filtros
    teamFilter,
    setTeamFilter,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    onlyValidEmails,
    setOnlyValidEmails,

    // Selección
    selectedIds,
    isManualSelectionMode,
    toggleSelectRecipient,
    selectAll,
    deselectAll,

    // Plantilla
    template,
    setAsunto,
    setCuerpo,
    insertVariable,
    handleImageUpload,
    removeImage,
    imageOptimizationInfo,

    // Semáforo Anti-Spam
    spamEvaluation,

    // Vista previa
    previewIndex,
    setPreviewIndex,
    previewDevice,
    setPreviewDevice,
    currentPreviewRecipient,
    renderedPreview,

    // Envíos
    testSending,
    testResult,
    sendTest,
    isSending,
    progress,
    campaignResult,
    sendCampaign,

    // Historial
    campaignHistory,
    loadHistory,
  };
}

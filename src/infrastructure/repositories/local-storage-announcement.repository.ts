import {
  AnnouncementCampaign,
  AnnouncementRecipient,
  EmailTemplate,
  TestEmailResult,
} from '../../domain/models/announcement.model';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { renderTemplate, textToHtml, htmlToPlainText, isValidEmail } from '../utils/text-formatter';

const STORAGE_KEY = 'innovathon_announcements_history';

export class LocalStorageAnnouncementRepository implements AnnouncementRepository {
  async getCampaignHistory(): Promise<AnnouncementCampaign[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        }
      }
    } catch (e) {
      console.warn('Error al leer historial de campañas desde localStorage:', e);
    }
    return [];
  }

  async saveCampaignToHistory(campaign: AnnouncementCampaign): Promise<void> {
    try {
      const history = await this.getCampaignHistory();
      const updated = [campaign, ...history.filter(c => c.id !== campaign.id)];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error al guardar campaña en localStorage:', e);
    }
  }

  async sendTestEmail(
    template: EmailTemplate,
    destinatarioPrueba: string,
    muestra: AnnouncementRecipient
  ): Promise<TestEmailResult> {
    if (!isValidEmail(destinatarioPrueba)) {
      return {
        success: false,
        message: `El correo de prueba "${destinatarioPrueba}" tiene un formato inválido.`,
        destinatario: destinatarioPrueba,
      };
    }

    // Renderizar con datos de la muestra (mismo asunto que el envío oficial, sin prefijos)
    const renderedSubject = renderTemplate(template.asunto, muestra);
    const renderedBody = renderTemplate(template.cuerpo, muestra);
    const renderedHtml = textToHtml(renderedBody, template.imagenBase64, template.imagenTipo);
    const plainText = htmlToPlainText(renderedHtml);

    // En entorno de navegador local / demo, simulamos el despacho exitoso
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      message: `Correo de prueba generado correctamente para ${destinatarioPrueba}. Asunto: "${renderedSubject}" (${plainText.length} caracteres de texto plano).`,
      destinatario: destinatarioPrueba,
    };
  }

  async sendCampaign(
    campanaNombre: string,
    template: EmailTemplate,
    destinatarios: AnnouncementRecipient[],
    onProgress?: (progress: {
      current: number;
      total: number;
      ultimoCorreo: string;
      enviados: number;
      errores: number;
    }) => void
  ): Promise<AnnouncementCampaign> {
    const total = destinatarios.length;
    let enviados = 0;
    let errores = 0;
    let omitidos = 0;
    const detalles: AnnouncementCampaign['detalles'] = [];

    const campaignId = `CMP_${Date.now()}`;
    const timestamp = new Date().toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    for (let i = 0; i < total; i++) {
      const recipient = destinatarios[i];

      if (!recipient.correo || recipient.correo === '—' || !isValidEmail(recipient.correo)) {
        omitidos++;
        detalles.push({
          correo: recipient.correo || 'sin-correo',
          nombre: recipient.nombre,
          estado: 'OMITIDO',
          error: 'Correo electrónico inexistente o inválido',
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        // Simulación controlada con pacing
        await new Promise(resolve => setTimeout(resolve, 150));
        enviados++;
        detalles.push({
          correo: recipient.correo,
          nombre: recipient.nombre,
          estado: 'ENVIADO',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          ultimoCorreo: recipient.correo || recipient.nombre,
          enviados,
          errores,
        });
      }
    }

    const campaign: AnnouncementCampaign = {
      id: campaignId,
      nombre: campanaNombre || `Comunicado - ${timestamp}`,
      asunto: template.asunto,
      cuerpo: template.cuerpo,
      imagenAdjunta: Boolean(template.imagenBase64),
      totalDestinatarios: total,
      enviados,
      errores,
      omitidos,
      fecha: timestamp,
      estado: errores > 0 ? (enviados > 0 ? 'parcial' : 'fallido') : 'completado',
      detalles,
    };

    await this.saveCampaignToHistory(campaign);
    return campaign;
  }
}

export const localAnnouncementRepository = new LocalStorageAnnouncementRepository();

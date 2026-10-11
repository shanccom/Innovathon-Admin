import {
  AnnouncementCampaign,
  AnnouncementRecipient,
  EmailTemplate,
  TestEmailResult,
} from '../../domain/models/announcement.model';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { configRepository } from './local-storage-config.repository';
import { localAnnouncementRepository } from './local-storage-announcement.repository';
import { renderTemplate, textToHtml, htmlToPlainText, isValidEmail } from '../utils/text-formatter';

export class AppsScriptAnnouncementRepository implements AnnouncementRepository {
  async getCampaignHistory(): Promise<AnnouncementCampaign[]> {
    return localAnnouncementRepository.getCampaignHistory();
  }

  async saveCampaignToHistory(campaign: AnnouncementCampaign): Promise<void> {
    return localAnnouncementRepository.saveCampaignToHistory(campaign);
  }

  async sendTestEmail(
    template: EmailTemplate,
    destinatarioPrueba: string,
    muestra: AnnouncementRecipient
  ): Promise<TestEmailResult> {
    const config = configRepository.getConfig();

    if (!isValidEmail(destinatarioPrueba)) {
      return {
        success: false,
        message: `El correo de prueba "${destinatarioPrueba}" no tiene un formato válido.`,
        destinatario: destinatarioPrueba,
      };
    }

    // Renderizar plantilla para prueba
    const renderedSubject = `[PRUEBA] ${renderTemplate(template.asunto, muestra)}`;
    const renderedBody = renderTemplate(template.cuerpo, muestra);
    const renderedHtml = textToHtml(renderedBody, template.imagenBase64, template.imagenTipo);
    const plainText = htmlToPlainText(renderedHtml);

    if (config.appsScriptUrl && config.appsScriptUrl.trim()) {
      try {
        const payload = {
          action: 'send_test',
          to: destinatarioPrueba.trim(),
          subject: renderedSubject,
          htmlBody: renderedHtml,
          plainBody: plainText,
          imageBase64: template.imagenBase64,
          imageMimeType: template.imagenTipo,
        };

        const res = await fetch(config.appsScriptUrl.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json().catch(() => ({ success: true }));
          if (json.success !== false) {
            return {
              success: true,
              message: `Correo de prueba enviado con éxito vía Gmail / Apps Script a ${destinatarioPrueba}.`,
              destinatario: destinatarioPrueba,
            };
          } else {
            throw new Error(json.error || 'Error reportado por Apps Script al enviar prueba.');
          }
        }
      } catch (err) {
        console.warn('Apps Script Web App no disponible para prueba, usando fallback local:', err);
      }
    }

    // Fallback a simulación local
    return localAnnouncementRepository.sendTestEmail(template, destinatarioPrueba, muestra);
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
    const config = configRepository.getConfig();

    if (config.appsScriptUrl && config.appsScriptUrl.trim()) {
      try {
        // Enviar lote hacia Google Apps Script
        const preparedBatch = destinatarios.map(d => ({
          correo: d.correo,
          nombre: d.nombre,
          primerNombre: d.primerNombre,
          asunto: renderTemplate(template.asunto, d),
          htmlBody: textToHtml(renderTemplate(template.cuerpo, d), template.imagenBase64, template.imagenTipo),
          plainBody: htmlToPlainText(renderTemplate(template.cuerpo, d)),
        }));

        const payload = {
          action: 'send_campaign',
          campaignName: campanaNombre,
          template: {
            asunto: template.asunto,
            cuerpo: template.cuerpo,
            imageBase64: template.imagenBase64,
            imageMimeType: template.imagenTipo,
          },
          destinatarios: preparedBatch,
        };

        const res = await fetch(config.appsScriptUrl.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.success !== false && json.campaign) {
            await this.saveCampaignToHistory(json.campaign);
            return json.campaign;
          }
        }
      } catch (err) {
        console.warn('Fallo al despachar por Apps Script Web App, ejecutando simulador:', err);
      }
    }

    // Fallback con animación de progreso
    return localAnnouncementRepository.sendCampaign(campanaNombre, template, destinatarios, onProgress);
  }
}

export const appsScriptAnnouncementRepository = new AppsScriptAnnouncementRepository();

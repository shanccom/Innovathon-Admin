import {
  AnnouncementCampaign,
  AnnouncementRecipient,
  EmailTemplate,
  TestEmailResult,
} from '../../domain/models/announcement.model';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
// URL específica de la implementación de Google Apps Script proporcionada por el usuario
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ26zi71Dvp0Yz7wluEj5X30gYrjOqGB1NaweJ7H0Vt6iaM84LmQ_kx4k35pa8RmEH/exec';
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
    if (!isValidEmail(destinatarioPrueba)) {
      return {
        success: false,
        message: `El correo de prueba "${destinatarioPrueba}" no tiene un formato válido.`,
        destinatario: destinatarioPrueba,
      };
    }

    // Renderizar plantilla para prueba (mismo asunto que el envío oficial, sin prefijos)
    const renderedSubject = renderTemplate(template.asunto, muestra);
    const renderedBody = renderTemplate(template.cuerpo, muestra);
    const renderedHtml = textToHtml(renderedBody, template.imagenBase64, template.imagenTipo);
    const plainText = htmlToPlainText(renderedHtml);

    const appsScriptUrl = APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return {
        success: false,
        message: `No se envió correo real a ${destinatarioPrueba}: no hay una URL de Google Apps Script Web App configurada. Ve a «Configuración» para conectar tu endpoint de Gmail.`,
        destinatario: destinatarioPrueba,
      };
    }

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

      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let json: { success?: boolean; error?: string; message?: string } = {};

      try {
        json = JSON.parse(responseText);
      } catch {
        // Si Apps Script devuelve HTML, generalmente es página de error o autorización
        if (responseText.includes('No se pudo abrir el archivo') || responseText.includes('ServiceLogin')) {
          return {
            success: false,
            message: `Error de Google Apps Script: la Web App requiere autorización o no tiene permisos de ejecución pública. Abre la hoja de cálculo y verifica la implementación.`,
            destinatario: destinatarioPrueba,
          };
        }
        throw new Error(`Respuesta no válida del servidor Apps Script: ${responseText.slice(0, 120)}...`);
      }

      if (json.success === true) {
        return {
          success: true,
          message: json.message || `Correo de prueba enviado con éxito vía Gmail / Apps Script a ${destinatarioPrueba}.`,
          destinatario: destinatarioPrueba,
        };
      } else {
        return {
          success: false,
          message: `Google Apps Script rechazó el envío: ${json.error || 'Error desconocido'}. Recuerda actualizar e implementar la nueva versión del script en Google Sheets.`,
          destinatario: destinatarioPrueba,
        };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Fallo al conectar con Google Apps Script:', err);
      return {
        success: false,
        message: `Error de conexión al enviar correo: ${errMsg}. Verifica que la URL de Apps Script sea correcta y esté publicada como "Cualquier persona".`,
        destinatario: destinatarioPrueba,
      };
    }
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
    }) => void,
    opciones: { modoPrueba?: boolean } = {}
  ): Promise<AnnouncementCampaign> {
    const appsScriptUrl = APPS_SCRIPT_URL;

    // Validación: asegurar que el nombre de campaña no esté vacío
    if (!campanaNombre || campanaNombre.trim().length === 0) {
      campanaNombre = `Comunicado - ${new Date().toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short',
      })}`;
    }

    const modoPrueba = opciones.modoPrueba === true;

    // Preparar destinatarios renderizados
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
        modoPrueba: modoPrueba,
        imageBase64: template.imagenBase64,
        imageMimeType: template.imagenTipo,
      },
      destinatarios: preparedBatch,
    };

    try {
      if (onProgress) {
        onProgress({
          current: 1,
          total: destinatarios.length,
          ultimoCorreo: 'Conectando con Google Apps Script...',
          enviados: 0,
          errores: 0,
        });
      }

      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let json: { success?: boolean; campaign?: AnnouncementCampaign; error?: string } = {};

      try {
        json = JSON.parse(responseText);
      } catch {
        throw new Error(`Respuesta no válida de Apps Script: ${responseText.slice(0, 120)}...`);
      }

      if (json.success && json.campaign) {
        if (onProgress) {
          onProgress({
            current: destinatarios.length,
            total: destinatarios.length,
            ultimoCorreo: 'Completado',
            enviados: json.campaign.enviados,
            errores: json.campaign.errores,
          });
        }
        await this.saveCampaignToHistory(json.campaign);
        return json.campaign;
      } else {
        throw new Error(json.error || 'Error devuelto por Apps Script al procesar la campaña.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Error al despachar campaña:', err);
      throw new Error(`No se pudo completar el despacho masivo: ${errMsg}`);
    }
  }
}

export const appsScriptAnnouncementRepository = new AppsScriptAnnouncementRepository();

import {
  AnnouncementCampaign,
  AnnouncementRecipient,
  EmailTemplate,
  TestEmailResult,
} from '../../domain/models/announcement.model';
import { AnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { appsScriptAnnouncementRepository } from '../../infrastructure/repositories/apps-script-announcement.repository';

export class SendAnnouncementUseCase {
  constructor(private repo: AnnouncementRepository = appsScriptAnnouncementRepository) {}

  async sendTest(
    template: EmailTemplate,
    destinatarioPrueba: string,
    muestra: AnnouncementRecipient
  ): Promise<TestEmailResult> {
    if (!destinatarioPrueba || !destinatarioPrueba.trim()) {
      return {
        success: false,
        message: 'Debes ingresar un correo de destino para la prueba.',
        destinatario: '',
      };
    }
    return this.repo.sendTestEmail(template, destinatarioPrueba.trim(), muestra);
  }

  async execute(
    nombreCampana: string,
    template: EmailTemplate,
    destinatarios: AnnouncementRecipient[],
    tokenConfirmacion: string,
    onProgress?: (progress: {
      current: number;
      total: number;
      ultimoCorreo: string;
      enviados: number;
      errores: number;
    }) => void
  ): Promise<AnnouncementCampaign> {
    // Candado de seguridad "A prueba de tontos"
    if (tokenConfirmacion.trim().toUpperCase() !== 'ENVIAR') {
      throw new Error('Confirmación de seguridad no válida. Debes escribir "ENVIAR" para autorizar el despacho masivo.');
    }

    if (!template.asunto || !template.asunto.trim()) {
      throw new Error('El asunto del comunicado no puede estar vacío.');
    }

    if (!template.cuerpo || !template.cuerpo.trim()) {
      throw new Error('El cuerpo del comunicado no puede estar vacío.');
    }

    if (!destinatarios || destinatarios.length === 0) {
      throw new Error('No hay destinatarios seleccionados para enviar.');
    }

    return this.repo.sendCampaign(nombreCampana, template, destinatarios, onProgress);
  }

  async getHistory(): Promise<AnnouncementCampaign[]> {
    return this.repo.getCampaignHistory();
  }
}

export const sendAnnouncementUseCase = new SendAnnouncementUseCase();

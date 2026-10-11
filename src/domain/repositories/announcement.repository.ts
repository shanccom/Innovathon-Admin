import {
  AnnouncementCampaign,
  AnnouncementRecipient,
  EmailTemplate,
  TestEmailResult,
} from '../models/announcement.model';

export interface AnnouncementRepository {
  sendTestEmail(
    template: EmailTemplate,
    destinatarioPrueba: string,
    muestra: AnnouncementRecipient
  ): Promise<TestEmailResult>;

  sendCampaign(
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
  ): Promise<AnnouncementCampaign>;

  getCampaignHistory(): Promise<AnnouncementCampaign[]>;

  saveCampaignToHistory(campaign: AnnouncementCampaign): Promise<void>;
}

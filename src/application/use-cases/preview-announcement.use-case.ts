import { AnnouncementRecipient, EmailTemplate } from '../../domain/models/announcement.model';
import { renderTemplate, textToHtml, htmlToPlainText } from '../../infrastructure/utils/text-formatter';
import { evaluateSpamScore } from '../../infrastructure/utils/spam-checker';

export interface RenderedPreview {
  asunto: string;
  cuerpoHtml: string;
  cuerpoPlano: string;
  recipient: AnnouncementRecipient;
}

export class PreviewAnnouncementUseCase {
  generatePreview(template: EmailTemplate, recipient: AnnouncementRecipient): RenderedPreview {
    const renderedSubject = renderTemplate(template.asunto, recipient);
    const renderedBody = renderTemplate(template.cuerpo, recipient);
    const renderedHtml = textToHtml(renderedBody, template.imagenBase64, template.imagenTipo);
    const plainText = htmlToPlainText(renderedHtml);

    return {
      asunto: renderedSubject || '(Sin asunto)',
      cuerpoHtml: renderedHtml,
      cuerpoPlano: plainText,
      recipient,
    };
  }

  evaluateSpam(template: EmailTemplate) {
    return evaluateSpamScore(template.asunto, template.cuerpo, Boolean(template.imagenBase64));
  }
}

export const previewAnnouncementUseCase = new PreviewAnnouncementUseCase();

import { describe, it, expect, beforeEach } from 'vitest';
import {
  toTitleCase,
  extractFirstName,
  isValidEmail,
  renderTemplate,
  textToHtml,
  htmlToPlainText,
} from '../infrastructure/utils/text-formatter';
import { evaluateSpamScore } from '../infrastructure/utils/spam-checker';
import { LocalStorageAnnouncementRepository } from '../infrastructure/repositories/local-storage-announcement.repository';
import { AnnouncementRecipient } from '../domain/models/announcement.model';

// Mock storage para entorno de pruebas Node
function createStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

(globalThis as unknown as { localStorage: unknown }).localStorage = createStorageMock();

describe('Sistema de Comunicados - Infrastructure & Domain Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Text Formatter & Name Normalization', () => {
    it('should convert ALL CAPS names to clean Title Case respecting Spanish particles', () => {
      expect(toTitleCase('JUAN CARLOS DE LA TORRE')).toBe('Juan Carlos de la Torre');
      expect(toTitleCase('MARIA DEL CARMEN SANCHEZ Y GOMEZ')).toBe('Maria del Carmen Sanchez y Gomez');
      expect(toTitleCase('pedro perez')).toBe('Pedro Perez');
      expect(toTitleCase('')).toBe('');
    });

    it('should extract first name properly for humanized email greetings', () => {
      expect(extractFirstName('JUAN CARLOS PÉREZ')).toBe('Juan');
      expect(extractFirstName('ana lucía')).toBe('Ana');
      expect(extractFirstName('Fernando')).toBe('Fernando');
      expect(extractFirstName('')).toBe('');
    });

    it('should validate email format and reject typos like .con', () => {
      expect(isValidEmail('usuario@gmail.com')).toBe(true);
      expect(isValidEmail('fgarambel@unsa.edu.pe')).toBe(true);
      expect(isValidEmail('invalido@gmail.con')).toBe(false); // typo .con
      expect(isValidEmail('sin-arroba.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should interpolate template variables and support fallbacks', () => {
      const recipient: AnnouncementRecipient = {
        id: 'p-1',
        dni: '72819203',
        nombre: 'Carlos Benavides Ríos',
        primerNombre: 'Carlos',
        apellido: '',
        correo: 'carlos@example.com',
        equipo: 'EcoInnovación Islay',
        rol: 'Líder',
        estado: 'Registrado',
      };

      const template = 'Hola {{primer_nombre}}, tu equipo es {{equipo}} y tu DNI es {{dni}}.';
      const rendered = renderTemplate(template, recipient);
      expect(rendered).toBe('Hola Carlos, tu equipo es EcoInnovación Islay y tu DNI es 72819203.');
    });

    it('should use fallback value when recipient field is empty', () => {
      const recipientWithoutTeam: AnnouncementRecipient = {
        id: 'p-2',
        dni: '12345678',
        nombre: 'Ana López',
        primerNombre: 'Ana',
        apellido: '',
        correo: 'ana@example.com',
        equipo: '', // sin equipo
        rol: 'Participante',
        estado: 'Registrado',
      };

      const template = 'Bienvenida {{primer_nombre}}, tu equipo es {{equipo | asignado en la apertura}}.';
      const rendered = renderTemplate(template, recipientWithoutTeam);
      expect(rendered).toBe('Bienvenida Ana, tu equipo es asignado en la apertura.');
    });

    it('should convert line breaks into proper HTML paragraphs avoiding squashed text', () => {
      const rawText = 'Primer párrafo de bienvenida.\n\nSegundo párrafo con detalles.\nLínea siguiente.';
      const html = textToHtml(rawText);

      expect(html).toContain('<p style="margin: 0 0 16px 0; line-height: 1.65; color: #2d3748; font-size: 15px;">Primer párrafo de bienvenida.</p>');
      expect(html).toContain('Segundo párrafo con detalles.<br />Línea siguiente.');
      expect(html).toContain('Comité Organizador Innovathon Mollendo 2026');
    });

    it('should extract clean plain text for multipart RFC compliance', () => {
      const html = '<p>Hola Carlos,</p><p>Bienvenido al evento.</p>';
      const plain = htmlToPlainText(html);
      expect(plain).toBe('Hola Carlos,\n\nBienvenido al evento.');
    });
  });

  describe('Spam Score Evaluator', () => {
    it('should give high safe score to clean institutional templates', () => {
      const asunto = '¡Información oficial sobre tu equipo! - Innovathon Mollendo 2026';
      const cuerpo = `Hola {{primer_nombre}},\n\nTe escribimos desde el Comité Organizador para confirmar los detalles de tu participación en el evento.\n\nPor favor revisa el cronograma de actividades en Mollendo.\n\nSaludos cordiales,\nEquipo Innovathon`;

      const result = evaluateSpamScore(asunto, cuerpo, false);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.nivel).toBe('safe');
      expect(result.advertencias).toHaveLength(0);
    });

    it('should heavily penalize ALL CAPS subjects and excessive punctuation', () => {
      const asunto = '¡¡¡URGENTE PARTICIPANTES RECLAMAR PREMIO AHORA!!!';
      const cuerpo = 'Hola gana dinero gratis con nosotros.';

      const result = evaluateSpamScore(asunto, cuerpo, false);
      expect(result.score).toBeLessThan(60);
      expect(result.nivel).toBe('danger');
      expect(result.advertencias.some(a => a.id === 'asunto_mayusculas')).toBe(true);
      expect(result.advertencias.some(a => a.id === 'palabras_spam')).toBe(true);
    });

    it('should warn when there is an image but very little text (image-only spam pattern)', () => {
      const asunto = 'Información del evento';
      const cuerpo = 'Hola Carlos, mira esta foto adjunta.';

      const result = evaluateSpamScore(asunto, cuerpo, true);
      expect(result.advertencias.some(a => a.id === 'ratio_texto_imagen')).toBe(true);
    });
  });

  describe('Announcement Repository & Storage Persistence', () => {
    const repo = new LocalStorageAnnouncementRepository();

    it('should handle test email generation with valid syntax', async () => {
      const recipient: AnnouncementRecipient = {
        id: 'p-1',
        dni: '72819203',
        nombre: 'Carlos Benavides',
        primerNombre: 'Carlos',
        apellido: '',
        correo: 'carlos@example.com',
        equipo: 'Alpha',
        rol: 'Líder',
        estado: 'Registrado',
      };

      const res = await repo.sendTestEmail(
        { asunto: 'Prueba {{primer_nombre}}', cuerpo: 'Hola {{primer_nombre}}' },
        'organizador@unsa.edu.pe',
        recipient
      );

      expect(res.success).toBe(true);
      expect(res.destinatario).toBe('organizador@unsa.edu.pe');
    });

    it('should reject test email with invalid address', async () => {
      const recipient: AnnouncementRecipient = {
        id: 'p-1',
        dni: '72819203',
        nombre: 'Carlos',
        primerNombre: 'Carlos',
        apellido: '',
        correo: 'carlos@example.com',
        equipo: 'Alpha',
        rol: 'Líder',
        estado: 'Registrado',
      };

      const res = await repo.sendTestEmail(
        { asunto: 'Prueba', cuerpo: 'Hola' },
        'correo-invalido.con',
        recipient
      );

      expect(res.success).toBe(false);
    });

    it('should save campaigns to history and retrieve them', async () => {
      const campaign = {
        id: 'CMP_12345',
        nombre: 'Campaña Inauguración',
        asunto: 'Bienvenidos',
        cuerpo: 'Hola a todos',
        imagenAdjunta: false,
        totalDestinatarios: 10,
        enviados: 10,
        errores: 0,
        omitidos: 0,
        fecha: '11/10/2026, 00:00:00',
        estado: 'completado' as const,
        detalles: [],
      };

      await repo.saveCampaignToHistory(campaign);
      const history = await repo.getCampaignHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('CMP_12345');
      expect(history[0].nombre).toBe('Campaña Inauguración');
    });
  });
});

import { AnnouncementRecipient } from '../../domain/models/announcement.model';

const LOWERCASE_PARTICLES = new Set([
  'de', 'del', 'la', 'las', 'los', 'y', 'e', 'o', 'san', 'santa'
]);

/**
 * Normaliza nombres a formato Title Case respetando partículas del español.
 * Ej: "JUAN CARLOS DE LA TORRE" -> "Juan Carlos de la Torre"
 */
export function toTitleCase(input: string): string {
  if (!input) return '';
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  const words = trimmed.toLowerCase().split(' ');
  return words
    .map((word, index) => {
      if (index > 0 && LOWERCASE_PARTICLES.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Extrae de forma limpia el primer nombre de pila.
 * Ej: "Juan Carlos Pérez" -> "Juan"
 */
export function extractFirstName(fullName: string): string {
  if (!fullName) return '';
  const cleaned = toTitleCase(fullName);
  const first = cleaned.split(' ')[0] || '';
  return first.trim();
}

/**
 * Valida si un formato de correo electrónico es seguro y tiene sintaxis válida.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Evitar dominios truncados comunes como .con
  if (/\.con$/i.test(trimmed)) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Reemplaza variables en plantillas de texto admitiendo alias y valores por defecto.
 * Sintaxis admitida:
 *   {{primer_nombre}}
 *   {{nombre_completo}}
 *   {{equipo | Sin equipo asignado}}
 */
export function renderTemplate(template: string, recipient: AnnouncementRecipient): string {
  if (!template) return '';

  return template.replace(/\{\{([^{}]+)\}\}/g, (_, expression: string) => {
    const parts = expression.split('|').map(p => p.trim());
    const varKey = parts[0].toLowerCase();
    const fallbackValue = parts.length > 1 ? parts[1] : '';

    let resolvedValue = '';

    switch (varKey) {
      case 'primer_nombre':
      case 'primernombre':
      case 'nombre_pila':
        resolvedValue = recipient.primerNombre || extractFirstName(recipient.nombre);
        break;
      case 'nombre_completo':
      case 'nombre':
      case 'participante':
        resolvedValue = recipient.nombre;
        break;
      case 'dni':
      case 'documento':
        resolvedValue = recipient.dni && recipient.dni !== '—' ? recipient.dni : '';
        break;
      case 'equipo':
      case 'proyecto':
      case 'grupo':
        resolvedValue = recipient.equipo && recipient.equipo !== 'Sin equipo asignado' ? recipient.equipo : '';
        break;
      case 'correo':
      case 'email':
      case 'correo_personal':
        resolvedValue = recipient.correo && recipient.correo !== '—' ? recipient.correo : '';
        break;
      case 'correo_institucional':
      case 'institucional':
        resolvedValue = recipient.correoInstitucional || '';
        break;
      case 'rol':
      case 'categoria':
        resolvedValue = recipient.rol;
        break;
      case 'estado':
        resolvedValue = recipient.estado;
        break;
      default:
        resolvedValue = '';
    }

    if (resolvedValue && resolvedValue.trim() !== '') {
      return resolvedValue.trim();
    }

    return fallbackValue;
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convierte texto plano con saltos de línea a HTML estructurado y responsivo con branding de Innovathon.
 * Soluciona el problema de los párrafos aplastados.
 */
export function textToHtml(
  rawBody: string,
  imageBase64?: string,
  imageMimeType?: string
): string {
  if (!rawBody) return '';

  const paragraphs = rawBody.split(/\r?\n\r?\n/);
  const formattedParagraphs = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      const withLineBreaks = escapeHtml(trimmed).replace(/\r?\n/g, '<br />');
      return `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #2d3748; font-size: 15px;">${withLineBreaks}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  let imageHtml = '';
  if (imageBase64) {
    const src = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`;
    imageHtml = `
      <div style="text-align: center; margin: 24px 0;">
        <img src="${src}" alt="Comunicado Oficial Innovathon Mollendo 2026" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; display: block; margin: 0 auto;" />
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Innovathon Mollendo 2026</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7fafc;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Cabecera Institucional -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">INNOVATHON MOLLENDO 2026</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Transformando ideas en soluciones frente al mar</p>
            </td>
          </tr>
          
          <!-- Contenido del Mensaje -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              ${formattedParagraphs}
              ${imageHtml}
            </td>
          </tr>
          
          <!-- Pie de Página Institucional -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">Comité Organizador Innovathon Mollendo 2026</p>
              <p style="margin: 0 0 8px 0;">Universidad Nacional de San Agustín · Municipalidad Provincial de Islay</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">Has recibido este comunicado oficial porque te encuentras postulado o registrado en la Innovathon Mollendo 2026. Si requieres rectificar datos, responde a este correo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Extrae texto plano limpio a partir del contenido HTML para el parámetro RFC multipart.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

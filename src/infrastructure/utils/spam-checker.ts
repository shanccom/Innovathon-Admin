import { SpamEvaluation, SpamWarning } from '../../domain/models/announcement.model';

const SPAM_TRIGGER_WORDS = [
  'urgente',
  'gratis',
  'gana',
  'ganador',
  'dinero',
  'reclamar',
  'premio',
  'click aqui',
  'clic aqui',
  'haz clic',
  'oferta exclusiva',
  '100% gratis',
  'garantizado',
  'sin costo',
  'beneficio economico',
  'inversion',
  'transferencia',
];

/**
 * Evalúa algorítmicamente el riesgo de que un comunicado sea clasificado como Spam
 * o enviado a la pestaña de Promociones por Gmail/Hotmail/Outlook.
 */
export function evaluateSpamScore(
  asunto: string,
  cuerpo: string,
  hasImage = false
): SpamEvaluation {
  let score = 100;
  const warnings: SpamWarning[] = [];

  const cleanSubject = (asunto || '').trim();
  const cleanBody = (cuerpo || '').trim();

  // 1. Asunto vacío o muy corto
  if (!cleanSubject) {
    score -= 40;
    warnings.push({
      id: 'asunto_vacio',
      tipo: 'danger',
      mensaje: 'El asunto del comunicado está vacío.',
      sugerencia: 'Escribe un asunto claro y descriptivo (ej. "Novedades sobre tu equipo - Innovathon Mollendo").',
    });
  } else if (cleanSubject.length < 5) {
    score -= 20;
    warnings.push({
      id: 'asunto_corto',
      tipo: 'warning',
      mensaje: 'El asunto es demasiado corto.',
      sugerencia: 'Usa al menos 15 caracteres para que los filtros no sospechen de un mensaje automatizado vacío.',
    });
  }

  // 2. Asunto en MAYÚSCULAS sostenidas
  if (cleanSubject.length >= 6) {
    const letters = cleanSubject.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '');
    if (letters.length > 0) {
      const upperCount = (letters.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
      const ratio = upperCount / letters.length;
      if (ratio > 0.6) {
        score -= 25;
        warnings.push({
          id: 'asunto_mayusculas',
          tipo: 'danger',
          mensaje: 'El asunto contiene demasiadas mayúsculas consecutivas.',
          sugerencia: 'Evita escribir en mayúsculas sostenidas ("URGENTE PARTICIPANTES"). Usa formato tipo oración.',
        });
      }
    }
  }

  // 3. Exceso de signos de exclamación o interrogación
  if (/[!¡]{2,}/.test(cleanSubject) || /[?¿]{2,}/.test(cleanSubject)) {
    score -= 15;
    warnings.push({
      id: 'signos_exclamacion_asunto',
      tipo: 'warning',
      mensaje: 'El asunto contiene signos de exclamación o interrogación repetidos ("!!!").',
      sugerencia: 'Usa como máximo un solo signo de exclamación al inicio o final.',
    });
  }

  // 4. Palabras disparadoras de filtros de spam (en asunto o cuerpo)
  const fullTextLower = `${cleanSubject} ${cleanBody}`.toLowerCase();
  const foundTriggers = SPAM_TRIGGER_WORDS.filter(w => fullTextLower.includes(w));
  if (foundTriggers.length > 0) {
    score -= Math.min(30, foundTriggers.length * 10);
    warnings.push({
      id: 'palabras_spam',
      tipo: 'danger',
      mensaje: `Contiene términos frecuentemente penalizados por filtros: "${foundTriggers.slice(0, 3).join('", "')}".`,
      sugerencia: 'Sustituye estas palabras por términos institucionales o académicos más naturales.',
    });
  }

  // 5. Cuerpo de texto vacío o muy corto
  if (!cleanBody) {
    score -= 40;
    warnings.push({
      id: 'cuerpo_vacio',
      tipo: 'danger',
      mensaje: 'El cuerpo del correo está vacío.',
      sugerencia: 'Redacta el mensaje institucional dirigido a los participantes.',
    });
  } else {
    const words = cleanBody.split(/\s+/).filter(Boolean);

    // 6. Desbalance de texto frente a imagen (Image-only spam)
    if (hasImage && words.length < 30) {
      score -= 25;
      warnings.push({
        id: 'ratio_texto_imagen',
        tipo: 'warning',
        mensaje: 'Hay una imagen adjunta pero el texto redactado es muy breve (menos de 30 palabras).',
        sugerencia: 'Los correos que son casi exclusivamente imágenes son penalizados. Añade al menos 2 párrafos explicativos.',
      });
    }

    // 7. Ausencia de personalización (Recomendación positiva)
    const hasPersonalization = /\{\{(primer_nombre|primerNombre|nombre_completo|nombre|participante)[^}]*\}\}/i.test(cleanBody);
    if (!hasPersonalization && words.length >= 10) {
      score -= 5;
      warnings.push({
        id: 'sin_personalizacion',
        tipo: 'info',
        mensaje: 'El mensaje no incluye variables de personalización como {{primer_nombre}}.',
        sugerencia: 'Saludar con el nombre de cada participante aumenta drásticamente la apertura y reduce quejas de spam.',
      });
    }
  }

  // Acotar el puntaje final
  const finalScore = Math.max(0, Math.min(100, score));

  let nivel: 'safe' | 'caution' | 'danger' = 'safe';
  if (finalScore < 60) {
    nivel = 'danger';
  } else if (finalScore < 85) {
    nivel = 'caution';
  }

  return {
    score: finalScore,
    nivel,
    advertencias: warnings,
  };
}

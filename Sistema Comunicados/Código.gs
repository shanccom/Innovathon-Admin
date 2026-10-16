/**
 * Innovathon Mollendo · Web App que recibe postulaciones y las guarda en Google Sheets.
 * Despliega como "Ejecutarse como:Yo" y "Quién tiene acceso:Cualquier persona".
 */

// Marcador de versión: permite verificar por URL que la implementación está al día.
function versionSistema() { return 'v3.7-comunicados-clean'; }

var REGISTRATION_CONFIG = {
  PRODUCTION_SPREADSHEET_ID: '1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8',
  SHEET_NAME: 'Registros',
  CODE_PREFIX: 'IM',
  FIELDS: [
    'fullName',
    'dni',
    'institutionalEmail',
    'personalEmail',
    'institution',
    'otherInstitution',
    'academicLevel',
    'sede',
    'otherSede',
    'career',
    'otherCareer',
    'skills',
    'contributionAreas',
    'challengeInterest',
    'referencePerson',
    'portfolioUrl',
    'availability',
    'termsAccepted',
    'source',
    'phone',
  ],
  HEADERS: [
    'Código',
    'Fecha de registro',
    'Nombres y apellidos',
    'DNI',
    'Correo institucional',
    'Correo personal',
    'Institución de procedencia',
    'Otra institución',
    'Nivel académico',
    'Sede',
    'Otra sede',
    'Carrera / Especialidad',
    'Otra carrera',
    'Habilidades principales',
    'Áreas de aporte',
    'Eje temático / Reto',
    'Compañero',
    'LinkedIn / Portafolio',
    'Disponibilidad presencial',
    'Aceptó términos',
    'Origen',
    'Número de celular',
  ],
};

// Health check y consulta de datos administrativos
function doGet(e) {
  if (e && e.parameter && (e.parameter.action === 'read_participants' || e.parameter.action === 'data')) {
    try {
      const sheet = getRegistrationSheet();
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return jsonResponse({ success: true, total: 0, data: [] });
      }
      const headers = data[0];
      const rows = data.slice(1).map(function(row) {
        var item = {};
        headers.forEach(function(h, i) {
          if (h) item[String(h).trim()] = row[i];
        });
        return item;
      });
      return jsonResponse({ success: true, total: rows.length, data: rows });
    } catch (err) {
      return jsonResponse({ success: false, error: err.message });
    }
  }

  if (e && e.parameter && e.parameter.action === 'last_debug') {
    const props = PropertiesService.getScriptProperties();
    return jsonResponse({
      version: versionSistema(),
      lastTest: safeJsonParse(props.getProperty('LAST_TEST_DEBUG')),
      lastCampaign: safeJsonParse(props.getProperty('LAST_CAMPAIGN_DEBUG'))
    });
  }

  return jsonResponse({
    success: true,
    version: versionSistema(),
    capabilities: { phone: true, atomicDuplicates: true, announcements: true },
    testMode: isTestMode(),
    testSpreadsheetId: isTestMode() ? PropertiesService.getScriptProperties().getProperty('QA_SPREADSHEET_ID') : undefined,
    message: 'Innovathon Mollendo · endpoint activo con soporte para Comunicados',
    headers: REGISTRATION_CONFIG.HEADERS,
  });
}

// Entrada principal: valida, verifica duplicados, guarda en Google Sheets y despacha comunicados o registros.
function doPost(event) {
  let lock;
  let locked = false;
  let saved = null;
  try {
    const body = event && event.postData && event.postData.contents;
    if (!body) return jsonResponse({ success: false, code: 'VALIDATION', error: 'Solicitud vacía o demasiado grande.' });
    
    const rawPayload = readPayload(event);
    const payload = rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) ? rawPayload : {};
    const action = payload.action || '';

    // 1. Acciones administrativas de Comunicados
    if (action === 'send_test') {
      return handleSendTest(payload);
    }
    if (action === 'send_campaign') {
      return handleSendCampaign(payload);
    }
    if (action === 'diagnose_campaign') {
      return diagnosticoCampana(payload);
    }
    if (action === 'diagnose_test') {
      return diagnosticoPrueba(payload);
    }

    // 2. Flujo de inscripción pública (con límite de tamaño para evitar abusos)
    if (body.length > 16384) return jsonResponse({ success: false, code: 'VALIDATION', error: 'Solicitud vacía o demasiado grande.' });
    const data = normalizePayload(payload);
    const invalidField = validate(data);
    if (invalidField) {
      return jsonResponse({ success: false, code: 'VALIDATION', error: invalidField });
    }
    lock = LockService.getScriptLock();
    locked = lock.tryLock(10000);
    if (!locked) return jsonResponse({ success: false, code: 'BUSY', retryable: true, error: 'Hay muchas inscripciones en este momento. Espera unos segundos y vuelve a intentar con los mismos datos.' });
    const sheet = getRegistrationSheet();
    const headers = ensureHeaders(sheet);
    // La consulta y la escritura comparten el mismo bloqueo: solo un ganador.
    const duplicate = findDuplicate(sheet, data, headers);
    if (duplicate) {
      return jsonResponse({
        success: false,
        isDuplicate: true,
        code: 'DUPLICATE',
        error: 'Este correo o DNI ya ha sido registrado previamente. La postulación ya fue recibida y está en proceso de revisión.',
      });
    }

    const code = nextRegistrationCode(sheet, headers);
    const now = new Date();
    const row = new Array(headers.length).fill('');
    row[headers.indexOf('Código')] = code;
    row[headers.indexOf('Fecha de registro')] = now;
    REGISTRATION_CONFIG.FIELDS.forEach(function(field, index) {
      row[headerIndex(headers, REGISTRATION_CONFIG.HEADERS[index + 2])] = formatValue(data[field]);
    });
    const nextRow = sheet.getLastRow() + 1;
    if (nextRow > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    // Impide perder el cero inicial del DNI y mantiene el celular como texto.
    const dniCol = headers.indexOf('DNI') + 1;
    if (dniCol > 0) sheet.getRange(nextRow, dniCol).setNumberFormat('@');
    const phoneCol = headers.indexOf('Número de celular') + 1;
    if (phoneCol > 0) sheet.getRange(nextRow, phoneCol).setNumberFormat('@');
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    SpreadsheetApp.flush();
    saved = { data: data, code: code, registeredAt: now.toISOString() };
  } catch (error) {
    console.error('No se pudo completar el registro: ' + error.name);
    return jsonResponse({ success: false, code: 'STORAGE_ERROR', retryable: true, error: 'No pudimos confirmar el registro. Reintenta con el mismo DNI y correo.' });
  } finally {
    if (locked) lock.releaseLock();
  }
  // El correo nunca mantiene el bloqueo de Sheets ni invalida un registro guardado.
  let emailSent = false;
  if (!isTestMode()) {
    try { emailSent = sendConfirmationEmail(saved.data, saved.code) === true; }
    catch (_error) { console.warn('Inscripción guardada; correo pendiente.'); }
  }
  return jsonResponse({ success: true, registrationId: saved.code, registeredAt: saved.registeredAt, emailSent: emailSent });
}

// Busca si el DNI o el correo personal ya existen en los registros previos de la hoja.
function findDuplicate(sheet, data, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null; // Solo cabeceras

  const cleanDni = data.dni;
  const emails = [data.personalEmail, data.institutionalEmail].map(emailIdentity).filter(Boolean);
  const width = Math.max(headers.indexOf('DNI'), headers.indexOf('Correo institucional'), headers.indexOf('Correo personal')) + 1;
  const range = sheet.getRange(2, 1, lastRow - 1, width);
  const rows = range.getValues();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const value = row[headers.indexOf('DNI')];
    const existingDni = typeof value === 'number' ? String(value).padStart(8, '0') : String(value || '').trim();
    const existingInstEmail = emailIdentity(row[headers.indexOf('Correo institucional')]);
    const existingPersEmail = emailIdentity(row[headers.indexOf('Correo personal')]);

    if (cleanDni && existingDni === cleanDni) {
      return { type: 'dni' };
    }

    if (emails.some(function(email) { return email === existingPersEmail || email === existingInstEmail; })) {
      return { type: 'email' };
    }
  }

  return null;
}

function emailIdentity(value) {
  const email = String(value || '').trim().toLowerCase();
  const parts = email.split('@');
  if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
    return parts[0].split('+')[0].replace(/\./g, '') + '@gmail.com';
  }
  return email;
}

function normalizePayload(input) {
  const data = {};
  REGISTRATION_CONFIG.FIELDS.forEach(function(field) {
    const val = input ? input[field] : '';
    data[field] = val !== undefined && val !== null ? String(val).trim() : '';
  });
  data.personalEmail = data.personalEmail.toLowerCase();
  data.institutionalEmail = data.institutionalEmail.toLowerCase();
  data.contributionAreas = input && Array.isArray(input.contributionAreas) ? input.contributionAreas.filter(function(v) { return typeof v === 'string' && v.trim(); }).map(function(v) { return v.trim(); }) : [];
  data.availability = Boolean(input && input.availability === true);
  data.termsAccepted = Boolean(input && input.termsAccepted === true);
  return data;
}

function headerIndex(headers, label) {
  const index = headers.indexOf(label);
  return index >= 0 ? index : label === 'Compañero' ? headers.indexOf('Compañero / Recomendación') : -1;
}

function ensureHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    sheet.appendRow(REGISTRATION_CONFIG.HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, REGISTRATION_CONFIG.HEADERS.length).setFontWeight('bold');
    return REGISTRATION_CONFIG.HEADERS.slice();
  }
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  // Reconoce el esquema de 18 columnas existente; nunca reordena sus datos.
  const missing = REGISTRATION_CONFIG.HEADERS.filter(function(header) { return headerIndex(headers, header) < 0; });
  if (missing.length) {
    const needed = headers.length + missing.length;
    if (needed > sheet.getMaxColumns()) sheet.insertColumnsAfter(sheet.getMaxColumns(), needed - sheet.getMaxColumns());
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold');
    return headers.concat(missing);
  }
  return headers;
}

function nextRegistrationCode(sheet, headers) {
  const prefix = REGISTRATION_CONFIG.CODE_PREFIX + '-' + new Date().getFullYear() + '-';
  const properties = PropertiesService.getScriptProperties();
  const key = 'SEQUENCE_' + sheet.getParent().getId() + '_' + prefix;
  let sequence = Number(properties.getProperty(key)) || 0;
  if (sheet.getLastRow() > 1) {
    const codeCol = headers.indexOf('Código') + 1;
    if (codeCol > 0) {
      sheet.getRange(2, codeCol, sheet.getLastRow() - 1, 1).getValues().forEach(function(row) {
        const code = String(row[0]);
        if (code.indexOf(prefix) === 0) sequence = Math.max(sequence, Number(code.slice(prefix.length)) || 0);
      });
    }
  }
  properties.setProperty(key, String(sequence + 1));
  return prefix + String(sequence + 1).padStart(4, '0');
}

function isTestMode() {
  return PropertiesService.getScriptProperties().getProperty('REGISTRATION_TEST_MODE') === 'true';
}

// Envía notificación por correo electrónico al participante tras registrarse con éxito.
function sendConfirmationEmail(data, code) {
  try {
    const recipient = String(data.personalEmail || data.institutionalEmail || '').trim();
    if (!recipient || !recipient.includes('@')) return;

    const fullName = String(data.fullName || 'Participante').trim();
    const dni = String(data.dni || '').trim();
    const sede = String(data.sede || 'Mollendo / Islay').trim();
    const career = String(data.career || '').trim();

    const subject = '¡Inscripción Recibida! · Innovathon Mollendo 2026';

    const topBannerUrl = 'https://innovathonmollendo.tech/assets/email-banner-top.png';
    const bottomBannerUrl = 'https://innovathonmollendo.tech/assets/email-banner-bottom.png';

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070a18; color: #ffffff; margin: 0; padding: 24px 12px;">
  <div style="max-width: 580px; margin: 0 auto; background: #0a0f26; border: 1px solid #1b254b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
    
    <!-- Top Hero Banner Oficial (banner_tally_25_oficial.png) -->
    <div style="background-color: #070c20; text-align: center; border-bottom: 1px solid #1b254b; line-height: 0;">
      <img src="${topBannerUrl}" alt="Innovathon Mollendo 2026" width="580" border="0" style="width: 100%; max-width: 580px; height: auto; display: block; margin: 0 auto; border: 0;" />
    </div>

    <!-- Header Section con Badge y Título -->
    <div style="background: linear-gradient(180deg, rgba(13, 22, 51, 0.9) 0%, rgba(10, 15, 38, 0.95) 100%); padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid #162044;">
      <span style="display: inline-block; background: rgba(203, 251, 69, 0.12); border: 1px solid rgba(203, 251, 69, 0.35); color: #cbfb45; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px;">
        Postulación Recibida
      </span>
      <h1 style="margin: 16px 0 6px; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">¡Inscripción Exitosa!</h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">Innovathon Mollendo 2026 · 17 y 18 de Diciembre</p>
    </div>

    <div style="padding: 28px 24px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0; font-size: 15px;">Hola <strong style="color: #ffffff;">${fullName}</strong>,</p>
      <p>Tu postulación para la <strong>Innovathon Mollendo 2026</strong> ha sido enviada y registrada correctamente en nuestro sistema.</p>

      <!-- Ficha de Datos Registrados -->
      <div style="background: #070a18; border: 1px solid #1e295d; border-radius: 14px; padding: 18px; margin: 20px 0;">
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">DNI</div>
          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${dni}</div>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Sede</div>
          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${sede}</div>
        </div>
        ${career ? `
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Carrera / Especialidad</div>
          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${career}</div>
        </div>` : ''}
        <div>
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Correo Registrado</div>
          <div style="font-size: 13px; font-weight: 600; color: #03c4c5;">${recipient}</div>
        </div>
      </div>

      <p><strong style="color: #ffffff;">¿Qué sigue ahora?</strong><br>
      El equipo organizador revisará tu postulación y te contactará a este correo electrónico con los detalles para unirte a la comunidad oficial de participantes.</p>

      <div style="text-align: center; margin: 26px 0 10px;">
        <a href="https://innovathonmollendo.tech" style="display: inline-block; background: #cbfb45; color: #070a18; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 28px; border-radius: 10px;">
          Visitar Web Oficial
        </a>
      </div>
    </div>

    <!-- Pie de Correo con Banner Castillo Forga (banner_tally_25_castillo.png) -->
    <div style="background-color: #060a1c; border-top: 1px solid #1b254b;">
      <div style="line-height: 0; text-align: center;">
        <img src="${bottomBannerUrl}" alt="Innovathon Mollendo 2026 · Castillo Forga" width="580" border="0" style="width: 100%; max-width: 580px; height: auto; display: block; margin: 0 auto; border: 0;" />
      </div>
      <div style="text-align: center; padding: 18px 24px 22px;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px; font-weight: 500;">
          <em>«Las ideas también tienen marea»</em>
        </p>
        <div style="font-size: 11px; color: #64748b; line-height: 1.5;">
          Innovathon Mollendo 2026 · Construyendo el futuro de Mollendo e Islay.<br>
          Este es un correo automático de confirmación de postulación.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const plainText = '¡Hola ' + fullName + '! Tu postulación para Innovathon Mollendo 2026 ha sido recibida con éxito.\n\n' +
      'DNI: ' + dni + '\n' +
      'Sede: ' + sede + '\n' +
      (career ? 'Carrera: ' + career + '\n' : '') +
      'Correo registrado: ' + recipient + '\n\n' +
      'Visita la web oficial: https://innovathonmollendo.tech';

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: plainText,
      htmlBody: htmlBody,
      name: 'Innovathon Mollendo 2026',
    });

    console.log('Correo de confirmación enviado para ' + code);
    return true;
  } catch (error) {
    // Si falla el envío (por cuotas diarias o filtros), la inscripción no se detiene.
    console.error('No se pudo enviar el correo de confirmación: ' + error.name);
    return false;
  }
}

// Crea la hoja con sus encabezados; ejecuta esta función una sola vez.
function setup() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getRegistrationSheet();
    ensureHeaders(sheet);
    sheet.setFrozenRows(1);
    SpreadsheetApp.flush();
    return REGISTRATION_CONFIG.SHEET_NAME;
  } finally {
    lock.releaseLock();
  }
}

// Devuelve la hoja de destino creándola si todavía no existe (blindado contra colisiones).
function getRegistrationSheet() {
  let book;
  if (isTestMode()) {
    const bound = SpreadsheetApp.getActive();
    const testId = PropertiesService.getScriptProperties().getProperty('QA_SPREADSHEET_ID');
    if (!testId || testId === REGISTRATION_CONFIG.PRODUCTION_SPREADSHEET_ID || (bound && testId === bound.getId())) throw new Error('QA necesita una hoja separada.');
    book = SpreadsheetApp.openById(testId);
  } else {
    // Un Web App no tiene una hoja activa: usa el destino fijo autorizado.
    book = SpreadsheetApp.openById(REGISTRATION_CONFIG.PRODUCTION_SPREADSHEET_ID);
  }
  if (!book) throw new Error('No hay hoja vinculada.');
  const sheet = book.getSheetByName(REGISTRATION_CONFIG.SHEET_NAME) || book.insertSheet(REGISTRATION_CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REGISTRATION_CONFIG.HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, REGISTRATION_CONFIG.HEADERS.length).setFontWeight('bold');
  }

  return sheet;
}

function getSheet(sheetName) {
  if (!sheetName || sheetName === REGISTRATION_CONFIG.SHEET_NAME) {
    return getRegistrationSheet();
  }
  const book = SpreadsheetApp.getActive() || SpreadsheetApp.openById(REGISTRATION_CONFIG.PRODUCTION_SPREADSHEET_ID);
  return book.getSheetByName(sheetName) || book.insertSheet(sheetName);
}

// Lee el cuerpo JSON enviado por el frontend.
function readPayload(event) {
  const body = event && event.postData && event.postData.contents;

  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
}

// Devuelve el primer error encontrado o una cadena vacía si todo está bien.
function validate(data) {
  if (!data.fullName || String(data.fullName).trim().length < 3) return 'Ingresa tus nombres y apellidos completos.';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(String(data.fullName).trim())) return 'El nombre solo debe contener letras y espacios (sin números).';
  if (!/^\d{8}$/.test(String(data.dni || '').trim())) return 'El DNI debe tener 8 dígitos numéricos.';
  if (!/^9\d{8}$/.test(data.phone)) return 'Ingresa un número de celular peruano de 9 dígitos que empiece con 9.';
  
  // Correo personal obligatorio
  const personalEmail = String(data.personalEmail || '').trim();
  if (!personalEmail) return 'El correo personal es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail) || personalEmail.indexOf('..') >= 0) return 'El correo personal no es válido.';
  if (/\.(con|cmo|comm|coom|cpm|col)$/i.test(personalEmail)) {
    return 'Revisa la terminación del correo personal (escribiste .con u otra errata en vez de .com).';
  }
  if (/@(gmai|gamil|gmial|gmaill|hotmial|hotmai|outlok|outloo)\.com$/i.test(personalEmail)) {
    return 'El dominio del correo personal contiene un error tipográfico común (ej. gmai en vez de gmail).';
  }

  // Correo institucional opcional
  const instEmail = String(data.institutionalEmail || '').trim();
  if (instEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instEmail) || instEmail.indexOf('..') >= 0) {
      return 'El formato del correo institucional no es válido.';
    }
    if (/\.(con|cmo|comm|coom|cpm|col)$/i.test(instEmail)) {
      return 'El formato del correo institucional contiene una terminación inválida.';
    }
  }

  if (!data.sede) return 'Selecciona una sede o localidad.';
  if (!data.career) return 'Selecciona tu carrera o área.';
  if (!data.institution) return 'Selecciona tu institución de procedencia.';
  if (!data.academicLevel) return 'Selecciona tu nivel académico.';
  if (data.sede === 'Otra localidad' && !data.otherSede) return 'Especifica tu localidad.';
  if (data.career === 'Otra carrera o especialidad' && !data.otherCareer) return 'Especifica tu carrera.';
  if (data.institution === 'Otra institución de educación superior' && !data.otherInstitution) return 'Especifica tu institución.';
  if (!data.contributionAreas.length) return 'Selecciona al menos un área de aporte.';
  if (!data.challengeInterest) return 'Selecciona un reto de interés.';
  if (!data.skills || String(data.skills).trim().length === 0) return 'Describe tus habilidades principales.';
  if (data.skills.length > 500) return 'Las habilidades no pueden superar los 500 caracteres.';
  if (!data.availability) return 'Debes confirmar tu disponibilidad presencial.';
  if (!data.termsAccepted) return 'Debes aceptar los términos y condiciones.';
  return '';
}

// Normaliza los valores antes de escribirlos en la hoja y previene Formula Injection.
function formatValue(value) {
  if (Array.isArray(value)) {
    return value.map(formatValue).join(', ');
  }
  if (value === true) return 'Sí';
  if (value === false || value === null || value === undefined || value === '') return '';

  const str = String(value).trim();

  // Neutraliza fórmulas no autorizadas (=, +, -, @, tabulaciones o retornos de carro)
  if (/^[=+\-@\t\r\n]/.test(str)) {
    return "'" + str;
  }

  return str;
}

// Siempre responde JSON para que el frontend pueda parsearlo.
function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function safeJsonParse(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch (e) { return String(value); }
}

// Función directa para forzar la ventana emergente de autorización de Google.
// Al ejecutarse SIN try/catch, Google detecta la llamada y muestra el diálogo modal de autorización.
function autorizarPermisos() {
  const miCorreo = Session.getActiveUser().getEmail() || 'fgarambelm@gmail.com';
  MailApp.sendEmail(miCorreo, 'Autorización exitosa · Innovathon Mollendo 2026', '¡Los permisos de envío de correos han sido autorizados correctamente!');
  Logger.log('¡Permisos autorizados y correo enviado a ' + miCorreo + '!');
}

// Función de prueba para enviar el correo completo con diseño HTML y banners.
function testEmail() {
  sendConfirmationEmail({
    fullName: 'Fernando Garambel',
    personalEmail: 'fgarambelm@gmail.com',
    dni: '73268408',
    phone: '958342111',
    sede: 'Mollendo / Provincia de Islay',
    career: 'Tecnología: Ingeniería de Sistemas, Software, Informática y afines'
  }, 'IM-2026-TEST');
  Logger.log('Proceso de testEmail finalizado. Revisa tu bandeja de entrada en fgarambelm@gmail.com');
}

// Función auxiliar para reiniciar el contador si limpias tu hoja de cálculo.
function resetearSecuencia() {
  const sheet = getRegistrationSheet();
  const prefix = REGISTRATION_CONFIG.CODE_PREFIX + '-' + new Date().getFullYear() + '-';
  const properties = PropertiesService.getScriptProperties();
  const key = 'SEQUENCE_' + sheet.getParent().getId() + '_' + prefix;
  properties.deleteProperty(key);
  Logger.log('Contador reiniciado. El próximo código generado será ' + prefix + '0001');
}

// Función para corregir el correo en Google Sheets y reenviar el ticket con código de barras a la participante
function reenviarConfirmacionParticipante() {
  const correoErroneo = 'avatariagirlz@gmail.con';
  const correoCorregido = 'avatariagirlz@gmail.com';
  
  const sheet = getRegistrationSheet();
  const headers = ensureHeaders(sheet);
  const emailCol = headers.indexOf('Correo personal') + 1;
  const dniCol = headers.indexOf('DNI') + 1;
  const nameCol = headers.indexOf('Nombres y apellidos') + 1;
  const codeCol = headers.indexOf('Código') + 1;
  const sedeCol = headers.indexOf('Sede') + 1;
  const careerCol = headers.indexOf('Carrera / Especialidad') + 1;
  
  const lastRow = sheet.getLastRow();
  let encontrada = false;
  
  for (let r = 2; r <= lastRow; r++) {
    const emailVal = String(sheet.getRange(r, emailCol).getValue()).trim().toLowerCase();
    if (emailVal === correoErroneo || emailVal === correoCorregido) {
      // 1. Corregir el correo en la hoja de Google Sheets
      sheet.getRange(r, emailCol).setValue(correoCorregido);
      SpreadsheetApp.flush();
      
      const code = String(sheet.getRange(r, codeCol).getValue()).trim();
      const fullName = String(sheet.getRange(r, nameCol).getValue()).trim();
      const dni = String(sheet.getRange(r, dniCol).getValue()).trim();
      const sede = String(sheet.getRange(r, sedeCol).getValue()).trim();
      const career = String(sheet.getRange(r, careerCol).getValue()).trim();
      
      // 2. Enviar el correo de confirmación oficial con su pase y código de barras
      sendConfirmationEmail({
        fullName: fullName,
        personalEmail: correoCorregido,
        dni: dni,
        sede: sede,
        career: career
      }, code);
      
      Logger.log('¡Éxito! Correo corregido en Sheets y ticket enviado a: ' + correoCorregido + ' (Código: ' + code + ')');
      encontrada = true;
      break;
    }
  }
  
  if (!encontrada) {
    Logger.log('No se encontró ninguna fila con ' + correoErroneo + ' ni ' + correoCorregido + '. Revisa manualmente la columna Correo personal.');
  }
}

// ==========================================
// MÓDULO DE COMUNICADOS (Innovathon-Admin)
// ==========================================

function handleSendTest(contents) {
  try {
    const to = String(contents.to || '').trim();
    const subject = String(contents.subject || 'Prueba de Comunicado · Innovathon Mollendo 2026').replace(/^\s*\[PRUEBA\]\s*/i, '').trim();
    const htmlBody = String(contents.htmlBody || '');
    const plainBody = String(contents.plainBody || '');
    const destinatario = to; // el frontend espera este campo en éxito

    try {
      PropertiesService.getScriptProperties().setProperty('LAST_TEST_DEBUG', JSON.stringify({
        version: versionSistema(),
        fecha: new Date().toISOString(),
        to: to,
        subjectRecibido: String(contents.subject || ''),
        subjectUsado: subject
      }));
    } catch (e) {}

    // Validación básica de correo
    if (!to || !to.includes('@')) {
      return jsonResponse({ success: false, code: 'VALIDATION', error: 'Correo de destinatario inválido.' });
    }

    let imageBlob = null;
    if (contents.imageBase64 && contents.imageMimeType && typeof Utilities !== 'undefined') {
      const raw = contents.imageBase64.indexOf(',') >= 0 ? contents.imageBase64.split(',')[1] : contents.imageBase64;
      imageBlob = Utilities.newBlob(Utilities.base64Decode(raw), contents.imageMimeType, 'imagen');
    }

    let html = htmlBody;
    const emailParams = {
      to: to,
      subject: subject,
      body: plainBody,
      name: 'Innovathon Mollendo 2026',
    };

    if (imageBlob) {
      html = html.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src="cid:imagen"');
      emailParams.inlineImages = { imagen: imageBlob };
    }
    if (html) {
      emailParams.htmlBody = html;
    }

    MailApp.sendEmail(emailParams);
    // Respuesta que el frontend espera: success + message + destinatario
    return jsonResponse({ success: true, message: 'Correo de prueba enviado con éxito a ' + destinatario, destinatario: destinatario });
  } catch (err) {
    console.error('Error enviando prueba: ' + err);
    // Respuesta de error que el frontend maneja (code + message)
    return jsonResponse({ success: false, code: 'MAIL_ERROR', error: 'Error al despachar correo: ' + (err.message || '') });
  }
}

function handleSendCampaign(contents) {
  try {
    // El frontend envía: campaignName, template: {asunto,cuerpo,imageBase64,imageMimeType}, destinatarios: [{correo,nombre,...}, ...]
    const campaignName = String(contents.campaignName || '').trim() || 'Campaña de Comunicados';
    const template = contents.template || {};
    const asunto = String(template.asunto || '').replace(/^\s*\[PRUEBA\]\s*/i, '').trim() || 'Comunicado Oficial Innovathon Mollendo 2026';
    const cuerpo = String(template.cuerpo || '').trim();
    const imageBase64 = template.imageBase64 || '';
    const imageMimeType = template.imageMimeType || 'image/jpeg';

    const recipients = Array.isArray(contents.destinatarios) ? contents.destinatarios : [];
    if (!recipients.length) {
      return jsonResponse({ success: false, error: 'No se recibieron destinatarios para la campaña.' });
    }

    // Sin hoja de historial: el resultado de la campaña se registra solo en memoria
    // (se devuelve en la respuesta y el panel Innovathon-Admin lo guarda localmente).

    // Prepara la imagen si viene base64
    let imageBlob = null;
    if (imageBase64 && typeof Utilities !== 'undefined') {
      const raw = imageBase64.indexOf(',') >= 0 ? imageBase64.split(',')[1] : imageBase64;
      imageBlob = Utilities.newBlob(Utilities.base64Decode(raw), imageMimeType || 'image/jpeg', 'imagen');
    }

    let enviados = 0;
    let errores = 0;
    const detalles = [];
    const subjectsDebug = [];

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      const targetEmail = String(r.correo || '').trim();
      const targetName = String(r.nombre || r.primerNombre || '').trim();
      // Nunca permitir el prefijo [PRUEBA] en un despacho oficial.
      const targetAsunto = String(r.asunto || asunto).replace(/^\s*\[PRUEBA\]\s*/i, '').trim();

      if (subjectsDebug.length < 8) {
        subjectsDebug.push({ correo: targetEmail, asuntoRecibido: String(r.asunto || ''), asuntoUsado: targetAsunto });
      }

      // Si no hay email, error y se omite
      if (!targetEmail || !targetEmail.includes('@')) {
        errores++;
        const errMsg = 'Email inválido';
        detalles.push({ correo: targetEmail, nombre: targetName || '', estado: 'ERROR', error: errMsg });
        continue;
      }

      try {
        let html = String(r.htmlBody || '');
        const emailParams = {
          to: targetEmail,
          subject: targetAsunto,
          body: String(r.plainBody || ''),
          name: 'Innovathon Mollendo 2026',
        };

        if (imageBlob) {
          html = html.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src="cid:imagen"');
          emailParams.inlineImages = { imagen: imageBlob };
        }
        if (html) {
          emailParams.htmlBody = html;
        }

        MailApp.sendEmail(emailParams);
        enviados++;
        detalles.push({ correo: targetEmail, nombre: targetName || '', estado: 'ENVIADO' });
      } catch (err) {
        errores++;
        const errMsg = err.message || 'Error desconocido';
        detalles.push({ correo: targetEmail, nombre: targetName || '', estado: 'ERROR', error: errMsg });
      }

      // Pausita para no apretar cuota de Gmail de golpe
      if (typeof Utilities !== 'undefined' && Utilities.sleep) {
        Utilities.sleep(1000);
      }
    }

    try {
      PropertiesService.getScriptProperties().setProperty('LAST_CAMPAIGN_DEBUG', JSON.stringify({
        version: versionSistema(),
        fecha: new Date().toISOString(),
        templateAsuntoRecibido: String(template.asunto || ''),
        templateAsuntoUsado: asunto,
        total: recipients.length,
        subjects: subjectsDebug
      }));
    } catch (e) {}

    // Construye el objeto `campaign` que el frontend Innovathon-Admin espera ver en la respuesta
    const campaign = {
      id: 'CMP_' + new Date().getTime(),
      nombre: campaignName,
      asunto: asunto,
      cuerpo: cuerpo,
      imagenAdjunta: !!imageBase64,
      totalDestinatarios: recipients.length,
      enviados: enviados,
      errores: errores,
      omitidos: recipients.length - enviados - errores, // los que no dieron error pero tampoco se cuentan como enviados explícitamente (colchón)
      fecha: new Date().toISOString(),
      // Estado según la cantidad de enviados vs total
      estado: (errores === 0 && enviados === recipients.length) ? 'completado' : (enviados > 0 && errores < enviados) ? 'parcial' : 'fallido',
      detalles: detalles
    };

    // Respuesta FINAL que el frontend ya tiene puesto en use-cases/send-announcement.use-case.ts
    // y en AnnouncementsPage.tsx (watch json.campaign ...)
    return jsonResponse({ success: true, campaign: campaign });
  } catch (err) {
    console.error('Error procesando campaña: ' + err);
    return jsonResponse({ success: false, error: 'Fallo al procesar campaña: ' + (err.message || '') });
  }
}

// Diagnóstico (NO envía correos): verifica qué asunto saldría realmente en una campaña
// y confirma que el prefijo [PRUEBA] nunca se aplica ni que se crea hoja de historial.
function diagnosticoCampana(contents) {
  const template = (contents && contents.template) || {};
  const asuntoLimpio = String(template.asunto || '').replace(/^\s*\[PRUEBA\]\s*/i, '').trim()
    || 'Comunicado Oficial Innovathon Mollendo 2026';
  const recipients = Array.isArray(contents && contents.destinatarios) ? contents.destinatarios : [];
  const muestras = recipients.slice(0, 5).map(function (r) {
    return {
      correo: String(r.correo || '').trim(),
      asuntoRecibido: String(r.asunto || ''),
      asuntoFinal: String(r.asunto || asuntoLimpio).replace(/^\s*\[PRUEBA\]\s*/i, '').trim()
    };
  });
  return jsonResponse({
    success: true,
    version: versionSistema(),
    creaHistorial: false,
    asuntoTemplateRecibido: String(template.asunto || ''),
    asuntoTemplateFinal: asuntoLimpio,
    muestras: muestras
  });
}

// Diagnóstico del correo de prueba (NO envía): confirma que el asunto sale sin [PRUEBA].
function diagnosticoPrueba(contents) {
  const recibido = String((contents && contents.subject) || '');
  return jsonResponse({
    success: true,
    version: versionSistema(),
    to: String((contents && contents.to) || ''),
    subjectRecibido: recibido,
    subjectFinal: recibido.replace(/^\s*\[PRUEBA\]\s*/i, '').trim()
  });
}
/**
 * Configuración centralizada de endpoints y servicios de Google Workspace
 * para Innovathon Mollendo 2026.
 *
 * Aquí puedes gestionar las URLs de Apps Script para cada módulo:
 * - Asistencias (lectura de la matriz «Matriz Asistencia»)
 * - Certificados (generación y firma de diplomas)
 * - Comunicados (envío masivo de correos vía Gmail / Apps Script)
 */

export const APPS_SCRIPT_ENDPOINTS = {
  /**
   * Endpoint de Google Apps Script para Asistencias y Participantes:
   * - Lectura de «Registros»
   * - Lectura de la matriz «Matriz Asistencia»
   */
  attendance: 'https://script.google.com/macros/s/AKfycbyw7LsfMZlhDWTDmCjXg-MhHlsqjIqWLnVUtQEaje1CJ-g7pgijFo2ayLeiMjrjuHx6VA/exec',

  /**
   * Endpoint futuro para Certificados (generación de PDFs en Google Drive, plantillas y firmas)
   */
  certificates: '',

  /**
   * Endpoint para Comunicados masivos (Gmail API / Apps Script MailApp)
   */
  announcements: 'https://script.google.com/macros/s/AKfycbzQ26zi71Dvp0Yz7wluEj5X30gYrjOqGB1NaweJ7H0Vt6iaM84LmQ_kx4k35pa8RmEH/exec',
} as const;

/**
 * Configuración de la hoja de cálculo principal de Google Sheets
 */
export const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8',
  sheetName: 'Registros',
  /**
   * Pestaña donde el formulario de Google + Apps Script depositan la asistencia.
   * Se lee en modo solo lectura (checkboxes por sesión) para mostrarla en el panel.
   */
  attendanceSheetName: 'Matriz Asistencia',
} as const;

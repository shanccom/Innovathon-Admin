/**
 * Configuración centralizada de endpoints y servicios de Google Workspace
 * para Innovathon Mollendo 2026.
 *
 * Aquí puedes gestionar las URLs de Apps Script para cada módulo:
 * - Asistencias (toma de asistencia, control de entradas y matriz)
 * - Certificados (generación y firma de diplomas)
 * - Comunicados (envío masivo de correos vía Gmail / Apps Script)
 */

export const APPS_SCRIPT_ENDPOINTS = {
  /**
   * Endpoint de Google Apps Script para Asistencias y Participantes:
   * - Lectura de «Registros»
   * - Marcado dinámico en matriz «Asistencias»
   */
  attendance: 'https://script.google.com/macros/s/AKfycbyKS4Q_zx9_UWkb5oYXztefEzBIiwKzH5uIC8w4LezO-pJkgF_-l_AotUOe1U4JUWVTPw/exec',

  /**
   * Endpoint futuro para Certificados (generación de PDFs en Google Drive, plantillas y firmas)
   */
  certificates: '',

  /**
   * Endpoint para Comunicados masivos (Gmail API / Apps Script MailApp)
   */
  announcements: 'https://script.google.com/macros/s/AKfycbxhYR57JU1ls9YBIGrV2whnxvehNJ2-nqvKuW60wN4OU1MiJXcLbjuJ9v8js97_wUsS/exec',
} as const;

/**
 * Configuración de la hoja de cálculo principal de Google Sheets
 */
export const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8',
  sheetName: 'Registros',
} as const;

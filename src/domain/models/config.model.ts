import { APPS_SCRIPT_ENDPOINTS, GOOGLE_SHEETS_CONFIG } from '../../infrastructure/config/endpoints.config';

export interface SheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  appsScriptUrl: string;
  /** Pestaña donde se deposita la asistencia (formulario + Apps Script). */
  attendanceSheetName: string;
}

export const DEFAULT_SHEETS_CONFIG: SheetsConfig = {
  spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
  sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
  appsScriptUrl: APPS_SCRIPT_ENDPOINTS.attendance,
  attendanceSheetName: GOOGLE_SHEETS_CONFIG.attendanceSheetName,
};

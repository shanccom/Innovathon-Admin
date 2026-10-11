import { APPS_SCRIPT_ENDPOINTS, GOOGLE_SHEETS_CONFIG } from '../../infrastructure/config/endpoints.config';

export interface SheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  appsScriptUrl: string;
}

export const DEFAULT_SHEETS_CONFIG: SheetsConfig = {
  spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
  sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
  appsScriptUrl: APPS_SCRIPT_ENDPOINTS.attendance,
};

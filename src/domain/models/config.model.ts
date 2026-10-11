export interface SheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  appsScriptUrl: string;
}

export const DEFAULT_SHEETS_CONFIG: SheetsConfig = {
  spreadsheetId: '1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8',
  sheetName: 'Registros',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxhYR57JU1ls9YBIGrV2whnxvehNJ2-nqvKuW60wN4OU1MiJXcLbjuJ9v8js97_wUsS/exec',
};

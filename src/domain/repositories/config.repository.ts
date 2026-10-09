import { SheetsConfig } from '../models/config.model';

export interface ConfigRepository {
  getConfig(): SheetsConfig;
  saveConfig(config: Partial<SheetsConfig>): SheetsConfig;
  getSpreadsheetUrl(): string;
}

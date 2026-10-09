import { DEFAULT_SHEETS_CONFIG, SheetsConfig } from '../../domain/models/config.model';
import { ConfigRepository } from '../../domain/repositories/config.repository';

const STORAGE_KEY = 'innovathon_sheets_config';

export class LocalStorageConfigRepository implements ConfigRepository {
  getConfig(): SheetsConfig {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_SHEETS_CONFIG, ...JSON.parse(stored) };
        }
      }
    } catch (e) {
      console.warn('Error reading sheets config from localStorage:', e);
    }
    return { ...DEFAULT_SHEETS_CONFIG };
  }

  saveConfig(newConfig: Partial<SheetsConfig>): SheetsConfig {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error saving sheets config:', e);
    }
    return updated;
  }

  getSpreadsheetUrl(): string {
    const config = this.getConfig();
    return `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit?usp=sharing`;
  }
}

export const configRepository = new LocalStorageConfigRepository();

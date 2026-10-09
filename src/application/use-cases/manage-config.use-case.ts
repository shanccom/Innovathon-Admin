import { SheetsConfig } from '../../domain/models/config.model';
import { ConfigRepository } from '../../domain/repositories/config.repository';
import { configRepository } from '../../infrastructure/repositories/local-storage-config.repository';

export class ManageConfigUseCase {
  constructor(private repo: ConfigRepository = configRepository) {}

  get(): SheetsConfig {
    return this.repo.getConfig();
  }

  save(config: Partial<SheetsConfig>): SheetsConfig {
    return this.repo.saveConfig(config);
  }

  getUrl(): string {
    return this.repo.getSpreadsheetUrl();
  }
}

export const manageConfigUseCase = new ManageConfigUseCase();

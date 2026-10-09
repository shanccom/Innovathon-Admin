import { SheetsConfig } from '../../domain/models/config.model';
import { ConfigRepository } from '../../domain/repositories/config.repository';
import { configRepository } from '../../infrastructure/repositories/local-storage-config.repository';
import { participantRepository } from '../../infrastructure/repositories/google-sheets-participant.repository';

export class ManageConfigUseCase {
  constructor(private repo: ConfigRepository = configRepository) {}

  get(): SheetsConfig {
    return this.repo.getConfig();
  }

  save(config: Partial<SheetsConfig>): SheetsConfig {
    const updated = this.repo.saveConfig(config);
    participantRepository.clearCache();
    return updated;
  }

  getUrl(): string {
    return this.repo.getSpreadsheetUrl();
  }
}

export const manageConfigUseCase = new ManageConfigUseCase();

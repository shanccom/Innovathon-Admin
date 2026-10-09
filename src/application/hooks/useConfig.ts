import { useCallback, useState } from 'react';
import { SheetsConfig } from '../../domain/models/config.model';
import { manageConfigUseCase } from '../use-cases/manage-config.use-case';

export function useConfig() {
  const [config, setConfig] = useState<SheetsConfig>(() => manageConfigUseCase.get());

  const saveConfig = useCallback((newConfig: Partial<SheetsConfig>) => {
    const updated = manageConfigUseCase.save(newConfig);
    setConfig(updated);
    return updated;
  }, []);

  const getSpreadsheetUrl = useCallback(() => {
    return manageConfigUseCase.getUrl();
  }, []);

  return {
    config,
    saveConfig,
    getSpreadsheetUrl,
  };
}

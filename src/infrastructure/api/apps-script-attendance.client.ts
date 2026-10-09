/**
 * Cliente para sincronizar en segundo plano las asistencias con Google Sheets (Formato Matriz)
 */

import { configRepository } from '../repositories/local-storage-config.repository';

export interface SyncAttendancePayload {
  action: 'markAttendance' | 'unmarkAttendance';
  codigo: string;
  dni: string;
  nombre: string;
  equipo: string;
  sessionId: string;
  sessionName: string;
  timestamp: string;
}

export class AppsScriptAttendanceClient {
  async syncToMatrix(payload: SyncAttendancePayload): Promise<boolean> {
    const config = configRepository.getConfig();
    if (!config.appsScriptUrl || !config.appsScriptUrl.trim()) {
      return false; // Sin URL de Apps Script configurada, solo almacena en local
    }

    const url = config.appsScriptUrl.trim();

    try {
      // Usar mode: 'no-cors' con text/plain para garantizar que Google Apps Script reciba
      // la petición POST sin restricciones de redirección de orígenes cruzados en GitHub Pages.
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });
      return true;
    } catch (e) {
      console.warn('Error al sincronizar asistencia con Google Apps Script:', e);
      return false;
    }
  }
}

export const appsScriptAttendanceClient = new AppsScriptAttendanceClient();

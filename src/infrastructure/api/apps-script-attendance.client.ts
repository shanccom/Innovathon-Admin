/**
 * Cliente de solo lectura para la matriz de asistencia.
 *
 * El panel administrativo NO escribe asistencia: el formulario de Google +
 * Apps Script alimentan la hoja «Matriz Asistencia». Este cliente únicamente
 * la LEE, primero vía el endpoint de Apps Script (?action=attendance) y, si no
 * está disponible, directamente vía el endpoint público GViz de Google Sheets.
 */

import { configRepository } from '../repositories/local-storage-config.repository';

export interface AttendanceMatrix {
  headers: string[];
  data: Array<Record<string, string>>;
}

interface GVizCell {
  v?: string | number | boolean | null;
  f?: string | null;
}

interface GVizColumn {
  label?: string;
  type?: string;
}

interface GVizResponse {
  status?: string;
  table?: {
    cols: GVizColumn[];
    rows: { c?: (GVizCell | null)[] }[];
  };
}

export class AppsScriptAttendanceClient {
  /**
   * Lee la matriz oficial de asistencia. Devuelve null si no se puede obtener.
   */
  async fetchMatrix(): Promise<AttendanceMatrix | null> {
    const fromScript = await this.fetchMatrixFromScript();
    if (fromScript && fromScript.headers.length) return fromScript;

    const sheetName = (configRepository.getConfig().attendanceSheetName || '').trim();
    if (sheetName) {
      const fromSheets = await this.fetchMatrixFromGviz(sheetName);
      if (fromSheets && fromSheets.headers.length) return fromSheets;
    }

    return null;
  }

  /** Lee la matriz vía el Web App de Apps Script (?action=attendance). */
  private async fetchMatrixFromScript(): Promise<AttendanceMatrix | null> {
    const config = configRepository.getConfig();
    if (!config.appsScriptUrl || !config.appsScriptUrl.trim()) return null;

    const url = config.appsScriptUrl.trim();
    const target = `${url}${url.includes('?') ? '&' : '?'}action=attendance`;

    try {
      const res = await fetch(target, { method: 'GET' });
      if (!res.ok) return null;
      const raw = (await res.json()) as { success?: boolean; headers?: unknown; data?: unknown };
      if (!raw || raw.success === false) return null;
      return {
        headers: Array.isArray(raw.headers) ? (raw.headers as string[]) : [],
        data: Array.isArray(raw.data) ? (raw.data as Array<Record<string, string>>) : [],
      };
    } catch (e) {
      console.warn('No se pudo leer la matriz vía Apps Script; se intentará GViz:', e);
      return null;
    }
  }

  /** Lee la matriz directamente desde Google Sheets (GViz, hoja pública). */
  private async fetchMatrixFromGviz(sheetName: string): Promise<AttendanceMatrix | null> {
    const config = configRepository.getConfig();
    if (!config.spreadsheetId) return null;

    const gvizUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

    try {
      const response = await fetch(gvizUrl, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' },
      });
      const rawText = await response.text();

      if (
        rawText.includes('ServiceLogin') ||
        rawText.includes('accounts.google.com') ||
        rawText.trim().startsWith('<html')
      ) {
        return null;
      }

      const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
      if (!match || !match[1]) return null;

      const parsed: GVizResponse = JSON.parse(match[1]);
      if (parsed.status === 'error') return null;

      const table = parsed.table;
      if (!table || !Array.isArray(table.cols)) return null;

      const cols = table.cols
        .map((c, idx) => ({
          label: c && c.label ? String(c.label).trim() : '',
          type: c && c.type ? String(c.type) : 'string',
          idx,
        }))
        .filter((c) => c.label.length > 0 && !/^col_\d+$/i.test(c.label));

      const headers = cols.map((c) => c.label);

      const data: Array<Record<string, string>> = [];
      (table.rows || []).forEach((row) => {
        if (!row || !row.c) return;
        const item: Record<string, string> = {};
        let hasValue = false;
        cols.forEach((col) => {
          const cell = row.c?.[col.idx] ?? null;
          let value = '';
          if (cell) {
            if (col.type === 'boolean') {
              value = cell.v === true ? 'TRUE' : '';
            } else {
              const raw = cell.f ?? cell.v ?? '';
              value = typeof raw === 'string' ? raw.trim() : String(raw);
            }
          }
          item[col.label] = value;
          if (value !== '') hasValue = true;
        });
        if (hasValue) data.push(item);
      });

      return { headers, data };
    } catch (e) {
      console.warn('No se pudo leer la matriz de asistencia vía GViz:', e);
      return null;
    }
  }
}

export const appsScriptAttendanceClient = new AppsScriptAttendanceClient();

import {
  Participant,
  ParticipantFetchResult,
  SyncStatus,
} from '../../domain/models/participant.model';
import { ParticipantRepository } from '../../domain/repositories/participant.repository';
import { configRepository } from './local-storage-config.repository';

const CACHE_KEY = 'innovathon_participants_cache';

interface GVizColumn {
  id?: string;
  label?: string;
  type?: string;
}

interface GVizCell {
  v?: string | number | null;
  f?: string | null;
}

interface GVizRow {
  c?: (GVizCell | null)[];
}

interface GVizResponse {
  status: string;
  errors?: { message: string }[];
  table?: {
    cols: GVizColumn[];
    rows: GVizRow[];
  };
}

export class GoogleSheetsParticipantRepository implements ParticipantRepository {
  private cachedData: Participant[] | null = null;
  private lastStatus: SyncStatus = {
    state: 'idle',
    message: '',
    count: 0,
    timestamp: null,
  };

  clearCache(): void {
    this.cachedData = null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(CACHE_KEY);
      }
    } catch {
      // Ignore quota/access errors
    }
  }

  isParticipantRow(row: Record<string, unknown>): boolean {
    const keys = Object.keys(row);
    const findKey = (...terms: string[]) => {
      for (const term of terms) {
        const match = keys.find(k => {
          const lower = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return lower.includes(term);
        });
        if (match) return match;
      }
      return undefined;
    };

    const dniKey = findKey('dni', 'documento', 'identificacion', 'cedula');
    const nameKey = findKey('nombre', 'participante');
    const correoKey = findKey('correo', 'email', 'mail');

    const hasVal = (k?: string) =>
      Boolean(k && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '');
    return hasVal(dniKey) || hasVal(nameKey) || hasVal(correoKey);
  }

  async fetchParticipants(forceRefresh = false): Promise<ParticipantFetchResult> {
    const config = configRepository.getConfig();

    if (forceRefresh) {
      this.clearCache();
    } else if (this.cachedData) {
      return {
        success: true,
        data: this.cachedData,
        count: this.cachedData.length,
        fromCache: true,
        status: this.lastStatus,
      };
    }

    // Try memory/session cache first if not forced
    if (!forceRefresh) {
      const sessionCached = this.getCachedParticipants();
      if (sessionCached) {
        this.cachedData = sessionCached;
        this.lastStatus = {
          state: 'connected',
          message: `Sincronizado desde caché (${sessionCached.length} participantes)`,
          count: sessionCached.length,
          timestamp: Date.now(),
        };
        return {
          success: true,
          data: sessionCached,
          count: sessionCached.length,
          fromCache: true,
          status: this.lastStatus,
        };
      }
    }

    this.lastStatus = {
      state: 'loading',
      message: 'Sincronizando con Google Sheets...',
      count: 0,
      timestamp: Date.now(),
    };

    // 1. Apps Script Web App (if configured)
    if (config.appsScriptUrl && config.appsScriptUrl.trim()) {
      try {
        const res = await fetch(config.appsScriptUrl.trim(), {
          method: 'GET',
          mode: 'cors',
        });
        if (res.ok) {
          const json = await res.json();
          const rows: Record<string, unknown>[] = Array.isArray(json)
            ? json
            : json.data || json.rows || [];
          const validRows = rows.filter(r => this.isParticipantRow(r));
          const normalized = this.normalizeRows(validRows);
          this.cachedData = normalized;
          this.lastStatus = {
            state: 'connected',
            message: 'Sincronizado vía Apps Script Web App',
            count: normalized.length,
            timestamp: Date.now(),
          };
          this.saveCache(normalized);
          return {
            success: true,
            data: normalized,
            count: normalized.length,
            status: this.lastStatus,
          };
        }
      } catch (err) {
        console.warn('Fallo al conectar con Apps Script Web App:', err);
      }
    }

    // 2. Direct Google Sheets GViz endpoint
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(config.sheetName)}`;

    try {
      const response = await fetch(gvizUrl, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' },
      });

      const rawText = await response.text();

      // If Google returns login HTML, sheet is private
      if (
        rawText.includes('ServiceLogin') ||
        rawText.includes('accounts.google.com') ||
        rawText.includes('<html')
      ) {
        this.clearCache();
        this.lastStatus = {
          state: 'error',
          errorType: 'PERMISSION_DENIED',
          message: 'La hoja de cálculo es privada. Requiere acceso público o Apps Script.',
          count: 0,
          timestamp: Date.now(),
        };
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: this.lastStatus.message,
          spreadsheetUrl: configRepository.getSpreadsheetUrl(),
          status: this.lastStatus,
        };
      }

      // Parse JSONP response: google.visualization.Query.setResponse({...})
      const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
      if (!match || !match[1]) {
        throw new Error('Formato de respuesta de Google Sheets no reconocido.');
      }

      const parsed: GVizResponse = JSON.parse(match[1]);
      if (parsed.status === 'error') {
        throw new Error(parsed.errors?.[0]?.message || 'Error en consulta de Google Sheets');
      }

      const table = parsed.table;
      if (!table || !table.cols || !table.rows) {
        throw new Error('Estructura de tabla vacía o no válida en la hoja.');
      }

      // Column headers
      const cols = table.cols.map((c, idx) =>
        c && c.label ? c.label.trim() : `Columna ${idx + 1}`
      );

      // Rows
      const rows: Record<string, unknown>[] = [];
      table.rows.forEach(row => {
        if (!row || !row.c) return;
        const obj: Record<string, unknown> = {};
        let hasAnyValue = false;
        row.c.forEach((cell, idx) => {
          const colName = cols[idx] || `col_${idx}`;
          const val =
            cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v ?? '') : '';
          obj[colName] = typeof val === 'string' ? val.trim() : val;
          if (val !== '' && val !== null && val !== undefined) {
            hasAnyValue = true;
          }
        });
        if (hasAnyValue) {
          rows.push(obj);
        }
      });

      const validRows = rows.filter(r => this.isParticipantRow(r));
      const normalized = this.normalizeRows(validRows);
      this.cachedData = normalized;
      this.lastStatus = {
        state: 'connected',
        message: `Sincronizado con hoja «${config.sheetName}» (${normalized.length} participantes)`,
        count: normalized.length,
        timestamp: Date.now(),
      };
      this.saveCache(normalized);

      return {
        success: true,
        data: normalized,
        count: normalized.length,
        status: this.lastStatus,
      };
    } catch (error: unknown) {
      this.clearCache();
      const errMessage = error instanceof Error ? error.message : 'Error al conectar con la hoja de Google Sheets';
      this.lastStatus = {
        state: 'error',
        errorType: 'FETCH_ERROR',
        message: errMessage,
        count: 0,
        timestamp: Date.now(),
      };
      return {
        success: false,
        error: 'FETCH_ERROR',
        message: this.lastStatus.message,
        status: this.lastStatus,
      };
    }
  }

  normalizeRows(rows: Record<string, unknown>[]): Participant[] {
    return rows.map((row, idx) => {
      const keys = Object.keys(row);
      const findKey = (...terms: string[]) => {
        for (const term of terms) {
          const match = keys.find(k => {
            const lower = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return lower.includes(term);
          });
          if (match) return match;
        }
        return undefined;
      };

      const dniKey = findKey('dni', 'documento', 'identificacion', 'cedula');
      const fullCombinedKey = findKey(
        'nombres y apellidos',
        'nombre y apellido',
        'apellidos y nombres',
        'nombre completo',
        'participante'
      );
      const nombresKey = findKey('nombres', 'nombre');
      const apellidosKey = findKey('apellidos', 'apellido');

      const equipoKey = findKey('equipo', 'proyecto', 'team', 'grupo', 'reto', 'eje', 'institucion');
      const correoKey = findKey('correo', 'email', 'mail');
      const celularKey = findKey('celular', 'telefono', 'whatsapp', 'movil');
      const rolKey = findKey('rol', 'categoria', 'tipo', 'modalidad');

      let nombre = '';
      if (fullCombinedKey && row[fullCombinedKey]) {
        nombre = String(row[fullCombinedKey]);
      } else if (nombresKey && apellidosKey && nombresKey !== apellidosKey) {
        const nom = row[nombresKey] || '';
        const ape = row[apellidosKey] || '';
        nombre = `${nom} ${ape}`.trim();
      } else if (nombresKey && row[nombresKey]) {
        nombre = String(row[nombresKey]);
      } else if (apellidosKey && row[apellidosKey]) {
        nombre = String(row[apellidosKey]);
      } else {
        nombre = `Participante #${idx + 1}`;
      }

      return {
        id: `p-${idx + 1}`,
        raw: row,
        dni: dniKey && row[dniKey] ? String(row[dniKey]).trim() : '—',
        nombre: nombre.trim(),
        equipo: equipoKey && row[equipoKey] ? String(row[equipoKey]).trim() : 'Sin equipo asignado',
        correo: correoKey && row[correoKey] ? String(row[correoKey]).trim() : '—',
        celular: celularKey && row[celularKey] ? String(row[celularKey]).trim() : '—',
        rol: rolKey && row[rolKey] ? String(row[rolKey]).trim() : 'Participante',
        estado: 'Registrado',
      };
    });
  }

  saveCache(data: Participant[]): void {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          count: data.length,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }

  getCachedParticipants(): Participant[] | null {
    if (this.cachedData) return this.cachedData;
    try {
      const stored = sessionStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cachedData = parsed.data;
        return parsed.data;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  getLastStatus(): SyncStatus {
    return this.lastStatus;
  }
}

export const participantRepository = new GoogleSheetsParticipantRepository();

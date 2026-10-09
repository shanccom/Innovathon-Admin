/**
 * Servicio de sincronización con Google Sheets para la hoja «Registros»
 * Admite lectura vía Google Visualization API (GViz) y vía Google Apps Script Web App
 */

const STORAGE_KEY = 'innovathon_sheets_config';
const CACHE_KEY = 'innovathon_participants_cache';

const DEFAULT_CONFIG = {
  spreadsheetId: '1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8',
  sheetName: 'Registros',
  appsScriptUrl: '',
};

export class ParticipantsService {
  constructor() {
    this.config = this.loadConfig();
    this.cachedData = null;
    this.lastStatus = {
      state: 'idle', // 'idle' | 'loading' | 'connected' | 'error'
      message: '',
      count: 0,
      timestamp: null,
    };
  }

  loadConfig() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        }
      }
    } catch (e) {
      console.warn('Error reading sheets config from localStorage:', e);
    }
    return { ...DEFAULT_CONFIG };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      }
    } catch (e) {
      console.error('Error saving sheets config:', e);
    }
  }

  getSpreadsheetUrl() {
    return `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/edit?usp=sharing`;
  }

  /**
   * Intenta obtener los participantes desde Apps Script o directamente de Google Sheets
   */
  async fetchParticipants(forceRefresh = false) {
    if (!forceRefresh && this.cachedData) {
      return {
        success: true,
        data: this.cachedData,
        count: this.cachedData.length,
        fromCache: true,
        status: this.lastStatus,
      };
    }

    this.lastStatus = {
      state: 'loading',
      message: 'Sincronizando con Google Sheets...',
      count: 0,
      timestamp: Date.now(),
    };

    // 1. Si existe URL de Google Apps Script configurada, probar primero
    if (this.config.appsScriptUrl && this.config.appsScriptUrl.trim()) {
      try {
        const res = await fetch(this.config.appsScriptUrl.trim(), {
          method: 'GET',
          mode: 'cors',
        });
        if (res.ok) {
          const json = await res.json();
          const rows = Array.isArray(json) ? json : (json.data || json.rows || []);
          const normalized = this.normalizeRows(rows);
          this.cachedData = normalized;
          this.lastStatus = {
            state: 'connected',
            message: 'Sincronizado vía Apps Script Web App',
            count: normalized.length,
            timestamp: Date.now(),
          };
          this.saveCache(normalized);
          return { success: true, data: normalized, count: normalized.length, status: this.lastStatus };
        }
      } catch (err) {
        console.warn('Fallo al conectar con Apps Script Web App:', err);
      }
    }

    // 2. Conexión directa a Google Sheets vía GViz endpoint
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(this.config.sheetName)}`;

    try {
      const response = await fetch(gvizUrl, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' },
      });

      const rawText = await response.text();

      // Si Google devuelve HTML de login, significa que la hoja está privada
      if (rawText.includes('ServiceLogin') || rawText.includes('accounts.google.com') || rawText.includes('<html')) {
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
          spreadsheetUrl: this.getSpreadsheetUrl(),
          status: this.lastStatus,
        };
      }

      // Procesar respuesta JSONP de GViz: google.visualization.Query.setResponse({...})
      const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
      if (!match || !match[1]) {
        throw new Error('Formato de respuesta de Google Sheets no reconocido.');
      }

      const parsed = JSON.parse(match[1]);
      if (parsed.status === 'error') {
        throw new Error(parsed.errors?.[0]?.message || 'Error en consulta de Google Sheets');
      }

      const table = parsed.table;
      if (!table || !table.cols || !table.rows) {
        throw new Error('Estructura de tabla vacía o no válida en la hoja.');
      }

      // Extraer nombres de columnas
      const cols = table.cols.map((c, idx) => (c && c.label ? c.label.trim() : `Columna ${idx + 1}`));

      // Extraer filas
      const rows = table.rows
        .map(row => {
          if (!row || !row.c) return null;
          const obj = {};
          let hasAnyValue = false;
          row.c.forEach((cell, idx) => {
            const colName = cols[idx] || `col_${idx}`;
            const val = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v ?? '') : '';
            obj[colName] = typeof val === 'string' ? val.trim() : val;
            if (val !== '' && val !== null && val !== undefined) {
              hasAnyValue = true;
            }
          });
          return hasAnyValue ? obj : null;
        })
        .filter(Boolean);

      const normalized = this.normalizeRows(rows);
      this.cachedData = normalized;
      this.lastStatus = {
        state: 'connected',
        message: `Sincronizado con hoja «${this.config.sheetName}»`,
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
    } catch (error) {
      this.lastStatus = {
        state: 'error',
        errorType: 'FETCH_ERROR',
        message: error.message || 'Error al conectar con la hoja de Google Sheets',
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

  /**
   * Normaliza los datos reconociendo columnas comunes
   */
  normalizeRows(rows) {
    return rows.map((row, idx) => {
      const keys = Object.keys(row);
      const findKey = (...terms) => {
        return keys.find(k => {
          const lower = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return terms.some(t => lower.includes(t));
        });
      };

      const dniKey = findKey('dni', 'documento', 'identificacion', 'cedula');
      
      // Detección de nombre completo combinado en una sola columna
      const fullCombinedKey = findKey('nombres y apellidos', 'nombre y apellido', 'apellidos y nombres', 'nombre completo', 'participante');
      const nombresKey = findKey('nombres', 'nombre');
      const apellidosKey = findKey('apellidos', 'apellido');
      
      const equipoKey = findKey('equipo', 'proyecto', 'team', 'grupo');
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

  saveCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
        count: data.length,
      }));
    } catch (e) {
      // Ignore quota errors
    }
  }

  getCachedData() {
    if (this.cachedData) return this.cachedData;
    try {
      const stored = sessionStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cachedData = parsed.data;
        return parsed.data;
      }
    } catch (e) {}
    return null;
  }

  getLastStatus() {
    return this.lastStatus;
  }
}

export const participantsService = new ParticipantsService();

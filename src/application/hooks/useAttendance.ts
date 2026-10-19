import { useCallback, useEffect, useRef, useState } from 'react';
import { AttendanceRecord, AttendanceSession, AttendanceSessionMap } from '../../domain/models/attendance.model';
import { Participant } from '../../domain/models/participant.model';
import { manageAttendanceUseCase } from '../use-cases/manage-attendance.use-case';
import {
  appsScriptAttendanceClient,
  AttendanceMatrix,
} from '../../infrastructure/api/apps-script-attendance.client';
import {
  DEFAULT_ATTENDANCE_SESSIONS,
  submitManualAttendanceToForm,
} from '../../infrastructure/config/attendance-forms.config';

/** Encabezados de la matriz que NO son columnas de sesión. */
const NON_SESSION_HEADERS = new Set(
  [
    'codigo',
    'dni',
    'nombres y apellidos',
    'nombres y apellido',
    'nombre',
    'nombres',
    'apellidos',
    'equipo',
    'total',
    'total asistencia',
    'total asistencias',
  ].map((h) => normalizeAttendanceCode(h))
);

/** Normaliza un código/DNI para cruzar la asistencia con el padrón. */
export function normalizeAttendanceCode(value: unknown): string {
  return String(value === null || value === undefined ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

/** Considera una celda como "presente" salvo que sea explícitamente falsa/vacía. */
function isMarked(value: unknown): boolean {
  const raw = String(value === null || value === undefined ? '' : value).trim().toUpperCase();
  if (!raw) return false;
  return raw !== 'FALSE' && raw !== '0' && raw !== 'NO' && raw !== 'FALSO';
}

/**
 * Convierte la matriz oficial (encabezados + filas) en sesiones y registros.
 * Mapea las columnas ("Asistencia 1" .. "6") a las sesiones oficiales ("dia-1-manana", etc.)
 */
export function buildFromMatrix(matrix: AttendanceMatrix): {
  sessions: AttendanceSession[];
  allRecords: AttendanceSessionMap;
} {
  const sessionNames = matrix.headers
    .filter((h) => {
      if (!h || !h.trim()) return false;
      const norm = normalizeAttendanceCode(h);
      if (NON_SESSION_HEADERS.has(norm)) return false;
      if (/^COL_\d+$/i.test(norm)) return false;
      return true;
    })
    .slice(0, DEFAULT_ATTENDANCE_SESSIONS.length);

  const sessions: AttendanceSession[] = sessionNames.map((name, i) => {
    const config = DEFAULT_ATTENDANCE_SESSIONS[i];
    return {
      id: config ? config.id : name,
      name: config ? config.name : name,
      createdAt: i,
    };
  });

  const allRecords: AttendanceSessionMap = {};
  sessions.forEach((s) => {
    allRecords[s.id] = {};
  });

  matrix.data.forEach((row) => {
    const code = normalizeAttendanceCode(row['Código'] ?? row['codigo'] ?? row['Codigo'] ?? '');
    const dni = normalizeAttendanceCode(row['DNI'] ?? row['dni'] ?? row['Documento'] ?? '');
    sessionNames.forEach((name, i) => {
      const targetId = sessions[i]?.id || name;
      if (isMarked(row[name])) {
        const rec: AttendanceRecord = { status: 'present', timestamp: '' };
        if (code) {
          if (!allRecords[targetId]) allRecords[targetId] = {};
          allRecords[targetId][code] = rec;
        }
        if (dni) {
          if (!allRecords[targetId]) allRecords[targetId] = {};
          allRecords[targetId][dni] = rec;
        }
      }
    });
  });

  return { sessions, allRecords };
}

export function useAttendance(_participants: Participant[] = [], initialSessionId?: string) {
  const [sessions, setSessions] = useState<AttendanceSession[]>(() => manageAttendanceUseCase.getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const all = manageAttendanceUseCase.getSessions();
    if (initialSessionId && all.some((s) => s.id === initialSessionId)) return initialSessionId;
    return all[0]?.id || 'dia-1-manana';
  });
  const [allRecords, setAllRecords] = useState<AttendanceSessionMap>(() => manageAttendanceUseCase.getAll());
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(
    () => manageAttendanceUseCase.getBySession(activeSessionId)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<'local' | 'sheets'>('local');

  const allRecordsRef = useRef(allRecords);
  useEffect(() => {
    allRecordsRef.current = allRecords;
  }, [allRecords]);
  const inFlightSubmissions = useRef<Set<string>>(new Set());

  const applyMatrix = useCallback((matrix: AttendanceMatrix) => {
    const { sessions: nextSessions, allRecords: nextRecords } = buildFromMatrix(matrix);
    setSessions(nextSessions);
    // Combina los registros de Sheets con cualquier marca local manual de respaldo
    setAllRecords((prev) => {
      const merged: AttendanceSessionMap = { ...nextRecords };
      Object.keys(prev).forEach((sId) => {
        if (!merged[sId]) merged[sId] = {};
        Object.keys(prev[sId] || {}).forEach((pKey) => {
          if (prev[sId][pKey]?.status === 'present' && !merged[sId][pKey]) {
            merged[sId][pKey] = prev[sId][pKey];
          }
        });
      });
      return merged;
    });
    setActiveSessionId((prev) =>
      nextSessions.some((s) => s.id === prev) ? prev : nextSessions[0]?.id || prev
    );
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const matrix = await appsScriptAttendanceClient.fetchMatrix();
      if (matrix && matrix.headers.length) {
        applyMatrix(matrix);
        setSource('sheets');
        return;
      }
      setSource('local');
    } finally {
      setLoading(false);
    }
  }, [applyMatrix]);

  const markManualAttendance = useCallback(
    (sessionId: string, participantCode: string, participantDni?: string, participantName?: string) => {
      const cleanCode = normalizeAttendanceCode(participantCode);
      const cleanDni = participantDni ? normalizeAttendanceCode(participantDni) : '';
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Verificamos el estado actual antes de mutar
      const currentSession = allRecordsRef.current[sessionId] || {};
      const isCurrentlyPresent =
        currentSession[cleanCode]?.status === 'present' ||
        (cleanDni ? currentSession[cleanDni]?.status === 'present' : false);
      const nextStatus = isCurrentlyPresent ? 'absent' : 'present';
      const nextRecord: AttendanceRecord = { status: nextStatus, timestamp: now };

      manageAttendanceUseCase.toggle(sessionId, cleanCode);

      setAllRecords((prev) => {
        const session = { ...(prev[sessionId] || {}) };
        session[cleanCode] = nextRecord;
        if (cleanDni) session[cleanDni] = nextRecord;
        return {
          ...prev,
          [sessionId]: session,
        };
      });

      // El envío a Google Forms se ejecuta FUERA del updater funcional de React
      // para garantizar que nunca se invoque 2 veces por React StrictMode ni por clics accidentales
      if (nextStatus === 'present' && cleanDni) {
        const flightKey = `${sessionId}_${cleanDni}`;
        if (!inFlightSubmissions.current.has(flightKey)) {
          inFlightSubmissions.current.add(flightKey);
          submitManualAttendanceToForm(sessionId, cleanDni, participantName).finally(() => {
            setTimeout(() => {
              inFlightSubmissions.current.delete(flightKey);
            }, 3000);
          });
        }
      }
    },
    []
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    setRecords(allRecords[activeSessionId] || {});
  }, [activeSessionId, allRecords]);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    records,
    allRecords,
    loading,
    source,
    refreshAll,
    markManualAttendance,
  };
}

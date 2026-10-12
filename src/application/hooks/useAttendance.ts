import { useCallback, useEffect, useState } from 'react';
import { AttendanceRecord, AttendanceSession, AttendanceSessionMap } from '../../domain/models/attendance.model';
import { Participant } from '../../domain/models/participant.model';
import { manageAttendanceUseCase } from '../use-cases/manage-attendance.use-case';
import {
  appsScriptAttendanceClient,
  AttendanceMatrix,
} from '../../infrastructure/api/apps-script-attendance.client';

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
 * Índice por Código normalizado.
 */
function buildFromMatrix(matrix: AttendanceMatrix): {
  sessions: AttendanceSession[];
  allRecords: AttendanceSessionMap;
} {
  const sessionNames = matrix.headers.filter(
    (h) => h && !NON_SESSION_HEADERS.has(normalizeAttendanceCode(h))
  );

  const sessions: AttendanceSession[] = sessionNames.map((name, i) => ({
    id: name,
    name,
    createdAt: i,
  }));

  const allRecords: AttendanceSessionMap = {};
  sessionNames.forEach((name) => {
    allRecords[name] = {};
  });

  matrix.data.forEach((row) => {
    const code = normalizeAttendanceCode(row['Código'] ?? row['codigo'] ?? '');
    if (!code) return;
    sessionNames.forEach((name) => {
      if (isMarked(row[name])) {
        allRecords[name][code] = { status: 'present', timestamp: '' };
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
    return all[0]?.id || 'asistencia-1';
  });
  const [allRecords, setAllRecords] = useState<AttendanceSessionMap>(() => manageAttendanceUseCase.getAll());
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(
    () => manageAttendanceUseCase.getBySession(activeSessionId)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<'local' | 'sheets'>('local');

  const applyMatrix = useCallback((matrix: AttendanceMatrix) => {
    const { sessions: nextSessions, allRecords: nextRecords } = buildFromMatrix(matrix);
    setSessions(nextSessions);
    setAllRecords(nextRecords);
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
  };
}

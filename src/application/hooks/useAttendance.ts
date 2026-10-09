import { useCallback, useEffect, useState } from 'react';
import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceSessionMap,
  AttendanceStatus,
} from '../../domain/models/attendance.model';
import { manageAttendanceUseCase } from '../use-cases/manage-attendance.use-case';

export function useAttendance(initialSessionId?: string) {
  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    return manageAttendanceUseCase.getSessions();
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (initialSessionId && sessions.some(s => s.id === initialSessionId)) {
      return initialSessionId;
    }
    return sessions[0]?.id || 'asistencia-1';
  });

  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() => {
    return manageAttendanceUseCase.getBySession(activeSessionId);
  });

  const [allRecords, setAllRecords] = useState<AttendanceSessionMap>(() => {
    return manageAttendanceUseCase.getAll();
  });

  // Sincronizar registros cuando cambia la sesión activa
  useEffect(() => {
    setRecords(manageAttendanceUseCase.getBySession(activeSessionId));
    setAllRecords(manageAttendanceUseCase.getAll());
  }, [activeSessionId]);

  const refreshAll = useCallback(() => {
    const currentSessions = manageAttendanceUseCase.getSessions();
    setSessions(currentSessions);
    setRecords(manageAttendanceUseCase.getBySession(activeSessionId));
    setAllRecords(manageAttendanceUseCase.getAll());
  }, [activeSessionId]);

  const addSession = useCallback((name?: string) => {
    const newSession = manageAttendanceUseCase.addSession(name);
    const updated = manageAttendanceUseCase.getSessions();
    setSessions(updated);
    setActiveSessionId(newSession.id);
    return newSession;
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    const success = manageAttendanceUseCase.deleteSession(sessionId);
    if (success) {
      const updated = manageAttendanceUseCase.getSessions();
      setSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0]?.id || 'asistencia-1');
      }
      setAllRecords(manageAttendanceUseCase.getAll());
    }
    return success;
  }, [activeSessionId]);

  const clearSession = useCallback((sessionId: string) => {
    manageAttendanceUseCase.clearSession(sessionId);
    if (activeSessionId === sessionId) {
      setRecords({});
    }
    setAllRecords(manageAttendanceUseCase.getAll());
  }, [activeSessionId]);

  const markPresent = useCallback((participantId: string) => {
    manageAttendanceUseCase.markPresent(activeSessionId, participantId);
    setRecords(manageAttendanceUseCase.getBySession(activeSessionId));
    setAllRecords(manageAttendanceUseCase.getAll());
  }, [activeSessionId]);

  const toggleAttendance = useCallback((participantId: string, currentStatus?: AttendanceStatus) => {
    manageAttendanceUseCase.toggle(activeSessionId, participantId, currentStatus);
    setRecords(manageAttendanceUseCase.getBySession(activeSessionId));
    setAllRecords(manageAttendanceUseCase.getAll());
  }, [activeSessionId]);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    addSession,
    deleteSession,
    clearSession,
    records,
    allRecords,
    markPresent,
    toggleAttendance,
    refreshAll,
  };
}

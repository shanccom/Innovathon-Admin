import { useCallback, useEffect, useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../domain/models/attendance.model';
import { manageAttendanceUseCase } from '../use-cases/manage-attendance.use-case';

export function useAttendance(sessionId: string) {
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() => {
    return manageAttendanceUseCase.getBySession(sessionId);
  });

  useEffect(() => {
    setRecords(manageAttendanceUseCase.getBySession(sessionId));
  }, [sessionId]);

  const reloadRecords = useCallback((newSessionId?: string) => {
    const sId = newSessionId || sessionId;
    setRecords(manageAttendanceUseCase.getBySession(sId));
  }, [sessionId]);

  const toggleAttendance = useCallback((participantId: string, currentStatus?: AttendanceStatus) => {
    manageAttendanceUseCase.toggle(sessionId, participantId, currentStatus);
    setRecords(manageAttendanceUseCase.getBySession(sessionId));
  }, [sessionId]);

  return {
    records,
    reloadRecords,
    toggleAttendance,
  };
}

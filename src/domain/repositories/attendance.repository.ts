import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceSessionMap,
  AttendanceStatus,
} from '../models/attendance.model';

export interface AttendanceRepository {
  getSessions(): AttendanceSession[];
  addSession(name?: string): AttendanceSession;
  deleteSession(sessionId: string): boolean;
  getAttendanceMap(): AttendanceSessionMap;
  getRecordsBySession(sessionId: string): Record<string, AttendanceRecord>;
  setAttendance(sessionId: string, participantId: string, status: AttendanceStatus): void;
  clearSessionRecords(sessionId: string): void;
}

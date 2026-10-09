import { AttendanceRecord, AttendanceSessionMap, AttendanceStatus } from '../models/attendance.model';

export interface AttendanceRepository {
  getAttendanceMap(): AttendanceSessionMap;
  getRecordsBySession(sessionId: string): Record<string, AttendanceRecord>;
  setAttendance(sessionId: string, participantId: string, status: AttendanceStatus): void;
}

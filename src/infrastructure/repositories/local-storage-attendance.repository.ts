import {
  AttendanceRecord,
  AttendanceSessionMap,
  AttendanceStatus,
} from '../../domain/models/attendance.model';
import { AttendanceRepository } from '../../domain/repositories/attendance.repository';

const ATTENDANCE_STORAGE_KEY = 'innovathon_attendance_records';

export class LocalStorageAttendanceRepository implements AttendanceRepository {
  getAttendanceMap(): AttendanceSessionMap {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AttendanceSessionMap) : {};
      }
    } catch (e) {
      console.warn('Error reading attendance records:', e);
    }
    return {};
  }

  getRecordsBySession(sessionId: string): Record<string, AttendanceRecord> {
    const map = this.getAttendanceMap();
    return map[sessionId] || {};
  }

  setAttendance(sessionId: string, participantId: string, status: AttendanceStatus): void {
    try {
      const all = this.getAttendanceMap();
      if (!all[sessionId]) {
        all[sessionId] = {};
      }
      all[sessionId][participantId] = {
        status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.error('Error saving attendance record:', e);
    }
  }
}

export const attendanceRepository = new LocalStorageAttendanceRepository();

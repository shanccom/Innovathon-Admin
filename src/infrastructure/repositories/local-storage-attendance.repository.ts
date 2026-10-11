import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceSessionMap,
  AttendanceStatus,
} from '../../domain/models/attendance.model';
import { AttendanceRepository } from '../../domain/repositories/attendance.repository';

const ATTENDANCE_STORAGE_KEY = 'innovathon_attendance_records';
const SESSIONS_STORAGE_KEY = 'innovathon_attendance_sessions';

const DEFAULT_SESSIONS: AttendanceSession[] = [
  { id: 'asistencia-1', name: 'Asistencia 1', createdAt: 1 },
  { id: 'asistencia-2', name: 'Asistencia 2', createdAt: 2 },
  { id: 'asistencia-3', name: 'Asistencia 3', createdAt: 3 },
  { id: 'asistencia-4', name: 'Asistencia 4', createdAt: 4 },
  { id: 'asistencia-5', name: 'Asistencia 5', createdAt: 5 },
  { id: 'asistencia-6', name: 'Asistencia 6', createdAt: 6 },
];

export class LocalStorageAttendanceRepository implements AttendanceRepository {
  getSessions(): AttendanceSession[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AttendanceSession[];
          if (Array.isArray(parsed) && parsed.length >= 6) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading attendance sessions:', e);
    }
    this.saveSessions(DEFAULT_SESSIONS);
    return DEFAULT_SESSIONS;
  }

  saveSessions(sessions: AttendanceSession[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      }
    } catch (e) {
      console.error('Error saving attendance sessions:', e);
    }
  }

  addSession(customName?: string): AttendanceSession {
    const sessions = this.getSessions();
    const nextNum = sessions.length + 1;
    const name = customName && customName.trim() ? customName.trim() : `Asistencia ${nextNum}`;
    const id = `asistencia-${Date.now()}`;
    const newSession: AttendanceSession = {
      id,
      name,
      createdAt: Date.now(),
    };
    const updated = [...sessions, newSession];
    this.saveSessions(updated);
    return newSession;
  }

  deleteSession(sessionId: string): boolean {
    const sessions = this.getSessions();
    if (sessions.length <= 1) {
      return false; // Conservar al menos una sesión
    }
    const updated = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(updated);

    // Limpiar registros de la sesión eliminada
    const all = this.getAttendanceMap();
    if (all[sessionId]) {
      delete all[sessionId];
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
        }
      } catch (e) {
        console.error('Error removing session records:', e);
      }
    }
    return true;
  }

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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.error('Error saving attendance record:', e);
    }
  }

  clearSessionRecords(sessionId: string): void {
    try {
      const all = this.getAttendanceMap();
      if (all[sessionId]) {
        all[sessionId] = {};
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
        }
      }
    } catch (e) {
      console.error('Error clearing session attendance:', e);
    }
  }
}

export const attendanceRepository = new LocalStorageAttendanceRepository();

import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceSessionMap,
  AttendanceStatus,
} from '../../domain/models/attendance.model';
import { AttendanceRepository } from '../../domain/repositories/attendance.repository';
import { attendanceRepository } from '../../infrastructure/repositories/local-storage-attendance.repository';

export class ManageAttendanceUseCase {
  constructor(private repo: AttendanceRepository = attendanceRepository) {}

  getSessions(): AttendanceSession[] {
    return this.repo.getSessions();
  }

  addSession(customName?: string): AttendanceSession {
    return this.repo.addSession(customName);
  }

  deleteSession(sessionId: string): boolean {
    return this.repo.deleteSession(sessionId);
  }

  clearSession(sessionId: string): void {
    this.repo.clearSessionRecords(sessionId);
  }

  getAll(): AttendanceSessionMap {
    return this.repo.getAttendanceMap();
  }

  getBySession(sessionId: string): Record<string, AttendanceRecord> {
    return this.repo.getRecordsBySession(sessionId);
  }

  markPresent(sessionId: string, participantId: string): void {
    this.repo.setAttendance(sessionId, participantId, 'present');
  }

  toggle(sessionId: string, participantId: string, currentStatus?: AttendanceStatus): AttendanceStatus {
    const nextStatus: AttendanceStatus = currentStatus === 'present' ? 'absent' : 'present';
    this.repo.setAttendance(sessionId, participantId, nextStatus);
    return nextStatus;
  }
}

export const manageAttendanceUseCase = new ManageAttendanceUseCase();

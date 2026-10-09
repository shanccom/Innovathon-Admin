import { AttendanceRecord, AttendanceSessionMap, AttendanceStatus } from '../../domain/models/attendance.model';
import { AttendanceRepository } from '../../domain/repositories/attendance.repository';
import { attendanceRepository } from '../../infrastructure/repositories/local-storage-attendance.repository';

export class ManageAttendanceUseCase {
  constructor(private repo: AttendanceRepository = attendanceRepository) {}

  getAll(): AttendanceSessionMap {
    return this.repo.getAttendanceMap();
  }

  getBySession(sessionId: string): Record<string, AttendanceRecord> {
    return this.repo.getRecordsBySession(sessionId);
  }

  toggle(sessionId: string, participantId: string, currentStatus?: AttendanceStatus): AttendanceStatus {
    const nextStatus: AttendanceStatus = currentStatus === 'present' ? 'absent' : 'present';
    this.repo.setAttendance(sessionId, participantId, nextStatus);
    return nextStatus;
  }
}

export const manageAttendanceUseCase = new ManageAttendanceUseCase();

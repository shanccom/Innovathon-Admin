export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  status: AttendanceStatus;
  timestamp: string;
}

export type AttendanceSessionMap = Record<string, Record<string, AttendanceRecord>>;

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  status: AttendanceStatus;
  timestamp: string;
}

export interface AttendanceSession {
  id: string;
  name: string;
  createdAt: number;
}

export type AttendanceSessionMap = Record<string, Record<string, AttendanceRecord>>;

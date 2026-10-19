import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAttendanceRepository } from '../infrastructure/repositories/local-storage-attendance.repository';
import { ManageAttendanceUseCase } from '../application/use-cases/manage-attendance.use-case';
import { normalizeAttendanceCode, buildFromMatrix } from '../application/hooks/useAttendance';
import {
  DEFAULT_ATTENDANCE_SESSIONS,
  MIN_ATTENDANCE_FOR_CERTIFICATE,
  saveCustomFormUrl,
  getEffectiveFormUrl,
  getCustomFormUrls,
  submitManualAttendanceToForm,
} from '../infrastructure/config/attendance-forms.config';

function createStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

(globalThis as unknown as { localStorage: unknown }).localStorage = createStorageMock();

describe('Attendance Module - 6 Sessions & Contingency Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Configuration & Session Metadata', () => {
    it('should configure exactly 6 official sessions for the 3-day hackathon', () => {
      expect(DEFAULT_ATTENDANCE_SESSIONS).toHaveLength(6);
      expect(DEFAULT_ATTENDANCE_SESSIONS.map((s) => s.name)).toEqual([
        'Día 1 - Mañana',
        'Día 1 - Tarde',
        'Día 2 - Mañana',
        'Día 2 - Tarde',
        'Día 3 - Mañana',
        'Día 3 - Tarde',
      ]);
      expect(MIN_ATTENDANCE_FOR_CERTIFICATE).toBe(5);
    });

    it('should allow overriding form URLs per session in localStorage', () => {
      const session = DEFAULT_ATTENDANCE_SESSIONS[0];
      expect(getEffectiveFormUrl(session)).toBe(session.defaultFormUrl);

      const customUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScEmergencyForm/viewform';
      saveCustomFormUrl(session.id, customUrl);

      expect(getCustomFormUrls()[session.id]).toBe(customUrl);
      expect(getEffectiveFormUrl(session)).toBe(customUrl);
    });
  });

  describe('Attendance Normalization & Cross-referencing', () => {
    it('should normalize uppercase, trim and remove accents from DNI/Codes', () => {
      expect(normalizeAttendanceCode(' im-2026-0003 ')).toBe('IM-2026-0003');
      expect(normalizeAttendanceCode('72859994')).toBe('72859994');
      expect(normalizeAttendanceCode(' José ')).toBe('JOSE');
      expect(normalizeAttendanceCode(null)).toBe('');
      expect(normalizeAttendanceCode(undefined)).toBe('');
    });

    it('should ignore non-session columns like col_9, Total, and empty headers', () => {
      const mockMatrix = {
        headers: [
          'Código',
          'Nombres y apellidos',
          'Asistencia 1',
          'Asistencia 2',
          'Asistencia 3',
          'Asistencia 4',
          'Asistencia 5',
          'Asistencia 6',
          'Total',
          'col_9',
          '',
        ],
        data: [
          {
            'Código': 'IM-2026-0001',
            'Nombres y apellidos': 'Ana Maria',
            'Asistencia 1': 'TRUE',
            'Total': '1',
            'col_9': '',
          },
        ],
      };

      const { sessions, allRecords } = buildFromMatrix(mockMatrix);

      // Must strictly yield the 6 hackathon sessions, never col_9 or Total
      expect(sessions).toHaveLength(6);
      expect(sessions.map((s) => s.id)).toEqual([
        'dia-1-manana',
        'dia-1-tarde',
        'dia-2-manana',
        'dia-2-tarde',
        'dia-3-manana',
        'dia-3-tarde',
      ]);
      expect(sessions.some((s) => s.id === 'col_9' || s.name === 'col_9')).toBe(false);
      expect(allRecords['dia-1-manana']['IM-2026-0001']?.status).toBe('present');
    });
  });

  describe('Contingency Manual Check-in Flow', () => {
    it('should register contingency check-in for a participant across sessions', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      const participantCode = 'IM-2026-0003';
      const cleanKey = normalizeAttendanceCode(participantCode);

      // Session 1: Día 1 - Mañana
      useCase.toggle('dia-1-manana', cleanKey);
      expect(useCase.getBySession('dia-1-manana')[cleanKey]?.status).toBe('present');

      // Session 2: Día 1 - Tarde
      useCase.toggle('dia-1-tarde', cleanKey);
      expect(useCase.getBySession('dia-1-tarde')[cleanKey]?.status).toBe('present');

      // Compute total across 6 sessions
      const sessions = useCase.getSessions();
      const all = useCase.getAll();
      const totalMarks = sessions.filter((s) => all[s.id]?.[cleanKey]?.status === 'present').length;

      expect(totalMarks).toBe(2);
      expect(totalMarks >= MIN_ATTENDANCE_FOR_CERTIFICATE).toBe(false);
    });

    it('should qualify for certificate when reaching 5 of 6 attendances', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);
      const cleanKey = 'IM-2026-0004';

      const sessionIds = [
        'dia-1-manana',
        'dia-1-tarde',
        'dia-2-manana',
        'dia-2-tarde',
        'dia-3-manana',
      ];

      sessionIds.forEach((id) => useCase.toggle(id, cleanKey));

      const sessions = useCase.getSessions();
      const all = useCase.getAll();
      const totalMarks = sessions.filter((s) => all[s.id]?.[cleanKey]?.status === 'present').length;

      expect(totalMarks).toBe(5);
      expect(totalMarks >= MIN_ATTENDANCE_FOR_CERTIFICATE).toBe(true);
    });

    it('should deduplicate multiple rapid calls to submitManualAttendanceToForm', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      const sessionId = 'dia-1-manana';
      const dni = '99998888';
      const name = 'Test Participant';

      // First call -> triggers fetch
      const result1 = await submitManualAttendanceToForm(sessionId, dni, name);
      // Second immediate call -> deduplicated, does not trigger fetch again
      const result2 = await submitManualAttendanceToForm(sessionId, dni, name);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });
  });
});

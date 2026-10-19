import { describe, it, expect, beforeEach } from 'vitest';
import { GoogleSheetsParticipantRepository } from '../infrastructure/repositories/google-sheets-participant.repository';
import { LocalStorageAttendanceRepository } from '../infrastructure/repositories/local-storage-attendance.repository';
import { LocalStorageConfigRepository } from '../infrastructure/repositories/local-storage-config.repository';
import { ManageAttendanceUseCase } from '../application/use-cases/manage-attendance.use-case';
import { ManageConfigUseCase } from '../application/use-cases/manage-config.use-case';

// Mock storage for Node test environment
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
(globalThis as unknown as { sessionStorage: unknown }).sessionStorage = createStorageMock();

describe('Clean Architecture - Domain & Infrastructure Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('GoogleSheetsParticipantRepository Normalization', () => {
    const repo = new GoogleSheetsParticipantRepository();

    it('should normalize row with Código and combined "Nombres y Apellidos"', () => {
      const rows = [
        {
          'Código': 'IM26-042',
          'DNI': '72819203',
          'Nombres y Apellidos': 'Carlos Benavides',
          'Equipo': 'Team Alpha',
          'Correo': 'carlos@example.com',
          'Celular': '987654321',
          'Rol': 'Líder',
        },
      ];

      const result = repo.normalizeRows(rows);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'p-1',
        codigo: 'IM26-042',
        dni: '72819203',
        nombre: 'Carlos Benavides',
        equipo: 'Team Alpha',
        correo: 'carlos@example.com',
        celular: '987654321',
        rol: 'Líder',
        estado: 'Registrado',
      });
    });

    it('should combine separate "Nombres" and "Apellidos"', () => {
      const rows = [
        {
          'Código': 'INN-100',
          'Documento': '12345678',
          'Nombre': 'Ana',
          'Apellido': 'López',
          'Proyecto': 'EcoCode',
        },
      ];

      const result = repo.normalizeRows(rows);
      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('INN-100');
      expect(result[0].nombre).toBe('Ana López');
      expect(result[0].equipo).toBe('EcoCode');
      expect(result[0].dni).toBe('12345678');
    });

    it('should fallback to defaults when columns are missing', () => {
      const rows = [{}];
      const result = repo.normalizeRows(rows);
      expect(result[0].codigo).toBe('P-1');
      expect(result[0].nombre).toBe('Participante #1');
      expect(result[0].dni).toBe('—');
      expect(result[0].equipo).toBe('Sin equipo asignado');
      expect(result[0].correo).toBe('—');
      expect(result[0].celular).toBe('—');
      expect(result[0].rol).toBe('Participante');
    });

    it('should prioritize "Correo personal" over "Correo institucional"', () => {
      const rows = [
        {
          'DNI': '72819203',
          'Nombres y Apellidos': 'Carlos Benavides',
          'Correo institucional': 'carlos@unsa.edu.pe',
          'Correo personal': 'carlos.personal@gmail.com',
        },
      ];

      const result = repo.normalizeRows(rows);
      expect(result[0].correo).toBe('carlos.personal@gmail.com');
      expect(result[0].correoInstitucional).toBe('carlos@unsa.edu.pe');
    });

    it('should fallback to "Correo institucional" if "Correo personal" is empty', () => {
      const rows = [
        {
          'DNI': '72819203',
          'Nombres y Apellidos': 'Carlos Benavides',
          'Correo institucional': 'carlos@unsa.edu.pe',
          'Correo personal': '',
        },
      ];

      const result = repo.normalizeRows(rows);
      expect(result[0].correo).toBe('carlos@unsa.edu.pe');
      expect(result[0].correoInstitucional).toBe('carlos@unsa.edu.pe');
    });

    it('should distinguish real participant rows from stray cells', () => {
      // Row with only an unrelated number in a random column
      const strayRow = { 'Nivel académico': 12 };
      expect(repo.isParticipantRow(strayRow)).toBe(false);

      // Row with Código
      const codeRow = { 'Código': 'IM-001' };
      expect(repo.isParticipantRow(codeRow)).toBe(true);

      // Row with DNI
      const dniRow = { 'DNI': '12345678' };
      expect(repo.isParticipantRow(dniRow)).toBe(true);

      // Row with Nombre
      const nameRow = { 'Nombres y apellidos': 'María Flores' };
      expect(repo.isParticipantRow(nameRow)).toBe(true);

      // Row with Correo
      const emailRow = { 'Correo personal': 'maria@gmail.com' };
      expect(repo.isParticipantRow(emailRow)).toBe(true);
    });

    it('should prioritize specific team terms over generic terms', () => {
      const row = {
        'Nombres': 'Pedro Gómez',
        'Reto': 'Turismo',
        'Equipo': 'Los Innovadores',
      };
      const result = repo.normalizeRows([row]);
      expect(result[0].equipo).toBe('Los Innovadores');
    });
  });

  describe('Attendance Repository & Dynamic Sessions Use Case', () => {
    it('should provide default 6 sessions and allow adding/deleting sessions', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      const sessions = useCase.getSessions();
      expect(sessions).toHaveLength(6);
      expect(sessions.map(s => s.name)).toEqual([
        'Día 1 - Mañana',
        'Día 1 - Tarde',
        'Día 2 - Mañana',
        'Día 2 - Tarde',
        'Día 3 - Mañana',
        'Día 3 - Tarde',
      ]);

      // Add 7th session
      const newSession = useCase.addSession();
      expect(newSession.name).toBe('Asistencia 7');
      expect(useCase.getSessions()).toHaveLength(7);

      // Delete session
      const deleted = useCase.deleteSession(newSession.id);
      expect(deleted).toBe(true);
      expect(useCase.getSessions()).toHaveLength(6);
    });

    it('should toggle attendance correctly and persist in storage', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      expect(useCase.getBySession('dia-1-manana')).toEqual({});

      // Toggle to present
      const firstStatus = useCase.toggle('dia-1-manana', 'p-1');
      expect(firstStatus).toBe('present');

      const s1Records = useCase.getBySession('dia-1-manana');
      expect(s1Records['p-1'].status).toBe('present');
      expect(s1Records['p-1'].timestamp).toBeDefined();

      // Toggle back to absent
      const secondStatus = useCase.toggle('dia-1-manana', 'p-1', 'present');
      expect(secondStatus).toBe('absent');
      expect(useCase.getBySession('dia-1-manana')['p-1'].status).toBe('absent');
    });

    it('should maintain independent records across different sessions', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      useCase.toggle('dia-1-manana', 'p-1');
      useCase.toggle('dia-1-tarde', 'p-2');

      expect(useCase.getBySession('dia-1-manana')['p-1']?.status).toBe('present');
      expect(useCase.getBySession('dia-1-manana')['p-2']).toBeUndefined();

      expect(useCase.getBySession('dia-1-tarde')['p-2']?.status).toBe('present');
      expect(useCase.getBySession('dia-1-tarde')['p-1']).toBeUndefined();
    });

    it('should clear records for a specific session without affecting others', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      useCase.toggle('dia-1-manana', 'p-1');
      useCase.toggle('dia-1-tarde', 'p-2');

      useCase.clearSession('dia-1-manana');
      expect(useCase.getBySession('dia-1-manana')).toEqual({});
      expect(useCase.getBySession('dia-1-tarde')['p-2']?.status).toBe('present');
    });
  });

  describe('Config Repository & Use Case', () => {
    it('should read default config and update fields', () => {
      const repo = new LocalStorageConfigRepository();
      const useCase = new ManageConfigUseCase(repo);

      const initial = useCase.get();
      expect(initial.spreadsheetId).toBe('1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8');
      expect(initial.sheetName).toBe('Registros');

      useCase.save({ sheetName: 'Registros_2026' });
      const updated = useCase.get();
      expect(updated.sheetName).toBe('Registros_2026');

      expect(useCase.getUrl()).toContain('1U48ftJJns3-4waJrt4A4uaI4OBNQoeyg1sOzzvXllI8');
    });
  });
});

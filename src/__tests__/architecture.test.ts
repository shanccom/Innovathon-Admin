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

    it('should normalize row with combined "Nombres y Apellidos"', () => {
      const rows = [
        {
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
          'Documento': '12345678',
          'Nombre': 'Ana',
          'Apellido': 'López',
          'Proyecto': 'EcoCode',
        },
      ];

      const result = repo.normalizeRows(rows);
      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Ana López');
      expect(result[0].equipo).toBe('EcoCode');
      expect(result[0].dni).toBe('12345678');
    });

    it('should fallback to defaults when columns are missing', () => {
      const rows = [{}];
      const result = repo.normalizeRows(rows);
      expect(result[0].nombre).toBe('Participante #1');
      expect(result[0].dni).toBe('—');
      expect(result[0].equipo).toBe('Sin equipo asignado');
      expect(result[0].correo).toBe('—');
      expect(result[0].celular).toBe('—');
      expect(result[0].rol).toBe('Participante');
    });

    it('should distinguish real participant rows from stray cells', () => {
      // Row with only an unrelated number in a random column
      const strayRow = { 'Nivel académico': 12 };
      expect(repo.isParticipantRow(strayRow)).toBe(false);

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

  describe('Attendance Repository & Use Case', () => {
    it('should toggle attendance correctly and persist in storage', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      expect(useCase.getBySession('s1')).toEqual({});

      // Toggle to present
      const firstStatus = useCase.toggle('s1', 'p-1');
      expect(firstStatus).toBe('present');

      const s1Records = useCase.getBySession('s1');
      expect(s1Records['p-1'].status).toBe('present');
      expect(s1Records['p-1'].timestamp).toBeDefined();

      // Toggle back to absent
      const secondStatus = useCase.toggle('s1', 'p-1', 'present');
      expect(secondStatus).toBe('absent');
      expect(useCase.getBySession('s1')['p-1'].status).toBe('absent');
    });

    it('should maintain independent records across different sessions', () => {
      const repo = new LocalStorageAttendanceRepository();
      const useCase = new ManageAttendanceUseCase(repo);

      useCase.toggle('s1', 'p-1');
      useCase.toggle('s2', 'p-2');

      expect(useCase.getBySession('s1')['p-1']?.status).toBe('present');
      expect(useCase.getBySession('s1')['p-2']).toBeUndefined();

      expect(useCase.getBySession('s2')['p-2']?.status).toBe('present');
      expect(useCase.getBySession('s2')['p-1']).toBeUndefined();
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

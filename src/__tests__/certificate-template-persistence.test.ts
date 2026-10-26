import { describe, expect, it, vi } from 'vitest';
import source from '../../apps-script/certificates/Code.gs?raw';

function setup(template: unknown = '') {
  const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'ROL QUE DESEMPEÑAS', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF', 'TIPO DE PLANTILLA'];
  const rows: unknown[][] = [['ORG-1', 'Ana', 'VOLUNTARIO', false, 'Generado', 'existing.pdf', template]];
  const writes = vi.fn();
  const sheet = {
    getLastRow: () => rows.length + 1,
    getLastColumn: () => headers.length,
    getRange: (row: number, col: number, count = 1, width = 1) => ({
      getValues: () => row === 1 ? [headers] : rows.slice(row - 2, row - 2 + count).map(r => r.slice(col - 1, col - 1 + width)),
      getValue: () => rows[row - 2]?.[col - 1],
      setValue: (value: unknown) => {
        writes(row, col, value);
        if (row === 1) headers[col - 1] = String(value);
        else rows[row - 2][col - 1] = value;
      },
    }),
  };
  const run = (parameter: Record<string, string> = {}) => {
    const output = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', 'e', `${source}; return doGet(e);`)(
      { getScriptProperties: () => ({ getProperty: () => 'configured' }) },
      { openById: () => ({ getSheetByName: () => sheet }) },
      { MimeType: { JSON: 'json' }, createTextOutput: (content: string) => ({ setMimeType: () => content }) },
      { parameter },
    );
    return JSON.parse(output);
  };
  return { run, writes, rows, headers };
}

describe('certificate template persistence', () => {
  it('saves template independently of role, checkbox, generation status and PDF, and reloads it', () => {
    const { run, writes } = setup();
    expect(run({ action: 'updateTemplateType', identifier: 'ORG-1', value: 'organizer' })).toEqual({ success: true });
    expect(writes.mock.calls).toEqual([[2, 7, 'Organizador']]);
    expect(run().organizers[0]).toMatchObject({ role: 'VOLUNTARIO', templateType: 'organizer', sendCertificate: false, generationStatus: 'Generado', drivePdfUrl: 'existing.pdf' });
  });

  it.each(['', 'invalid'])('rejects invalid template %j without writes', value => {
    const { run, writes } = setup();
    expect(run({ action: 'updateTemplateType', identifier: 'ORG-1', value })).toEqual({ success: false, error: 'Selecciona Organizador o Voluntario como tipo de emisión.' });
    expect(writes).not.toHaveBeenCalled();
  });

  it.each(['', 'invalid'])('loads %j as explicitly unselected without inferring from role', value => {
    expect(setup(value).run().organizers[0].templateType).toBe('');
  });

  it('creates the exact new header on first save and preserves unrelated cells', () => {
    const { run, writes, headers, rows } = setup();
    headers.pop();
    rows[0].pop();
    expect(run({ action: 'updateTemplateType', identifier: 'ORG-1', value: 'volunteer' })).toEqual({ success: true });
    expect(writes.mock.calls).toEqual([[1, 7, 'TIPO DE PLANTILLA'], [2, 7, 'Voluntario']]);
    expect(run().organizers[0]).toMatchObject({ role: 'VOLUNTARIO', templateType: 'volunteer', generationStatus: 'Generado', drivePdfUrl: 'existing.pdf' });
  });

  it('rejects unknown identifiers without creating the column or changing data', () => {
    const { run, writes, headers } = setup();
    headers.pop();
    expect(run({ action: 'updateTemplateType', identifier: 'missing', value: 'organizer' })).toEqual({ success: false, error: 'No se encontró el registro con identificador: missing' });
    expect(writes).not.toHaveBeenCalled();
  });

  it('does not invent a role when the sheet cell is empty', () => {
    const { run, rows } = setup();
    rows[0][2] = '';
    expect(run().organizers[0].role).toBe('');
  });
});

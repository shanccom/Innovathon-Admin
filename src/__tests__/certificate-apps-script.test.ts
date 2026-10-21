import { describe, expect, it, vi } from 'vitest';
import source from '../../apps-script/certificates/Code.gs?raw';

describe('certificate Apps Script response', () => {
  const makeContentService = (mimeTypes: Record<string, string>) => ({
    MimeType: mimeTypes,
    createTextOutput: (content: string) => ({ setMimeType: (mime: string) => ({ content, mime }) }),
  });

  const baseSetup = (
    headers: string[] = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO'],
    rows: unknown[][] = [
      ['ORG-TRUE', 'Ana', 'Uno', 'Directora', 'Tech', true],
      ['ORG-FALSE', 'Beto', 'Dos', 'Mentor', 'Design', false],
    ]
  ) => {
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount: number) => ({
        getValues: () => row === 1
          ? [headers]
          : rows.slice(row - 2, row - 2 + rowCount).map(values => [values[column - 1]]),
      }),
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    return { propertiesService, spreadsheetApp };
  };

  it('preserves checked and unchecked checkbox values as booleans', () => {
    const { propertiesService, spreadsheetApp } = baseSetup();
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });
    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet();`);

    const result = doGet(propertiesService, spreadsheetApp, contentService) as { content: string };
    const response = JSON.parse(result.content);
    expect(response.organizers.map(({ sendCertificate }: { sendCertificate: boolean }) => sendCertificate)).toEqual([true, false]);
  });

  it('returns JSON when no callback is provided', () => {
    const { propertiesService, spreadsheetApp } = baseSetup();
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });
    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet();`);

    const result = doGet(propertiesService, spreadsheetApp, contentService) as { content: string; mime: string };
    expect(result.mime).toBe('application/json');
    const parsed = JSON.parse(result.content);
    expect(parsed.success).toBe(true);
  });

  it('returns JSONP wrapping when callback parameter is provided', () => {
    const { propertiesService, spreadsheetApp } = baseSetup();
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });
    const e = { parameter: { callback: 'cb' } };
    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);

    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    expect(result.mime).toBe('application/javascript');
    expect(result.content).toMatch(/^cb\(/);
    expect(result.content).toMatch(/\);$/);
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.success).toBe(true);
    expect(Array.isArray(parsed.organizers)).toBe(true);
  });

  it('updateSendCertificate action updates the cell and returns { success: true } via JSONP', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO'];
    const rows = [
      ['ORG-001', 'Ana', 'Uno', 'Directora', 'Tech', false],
    ];
    const setValueSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          // Multi-row range (header read)
          return {
            getValues: () => row === 1
              ? [headers]
              : rows.slice(row - 2, row - 2 + rowCount).map(values => [values[column - 1]]),
          };
        }
        // Single-cell range (identifier lookup or setValue)
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = { parameter: { callback: 'cb', action: 'updateSendCertificate', identifier: 'ORG-001', value: 'true' } };
    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);

    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    expect(result.mime).toBe('application/javascript');
    expect(result.content).toMatch(/^cb\(/);
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.success).toBe(true);
    expect(setValueSpy).toHaveBeenCalledWith(true);
  });

  it('updateBulkSendCertificate updates multiple rows and protects Generado on false', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION'];
    const rows = [
      ['ORG-001', 'Ana', 'Uno', 'Directora', 'Tech', true, 'Generado'],
      ['ORG-002', 'Beto', 'Dos', 'Mentor', 'Tech', true, 'Pendiente'],
    ];
    const setValueSpy = vi.fn();
    const setValuesSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: setValuesSpy,
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    // Deselect all: ORG-001 (Generado) should be protected and NOT updated. ORG-002 should be updated to false.
    const e = {
      parameter: {
        callback: 'cb',
        action: 'updateBulkSendCertificate',
        identifiers: JSON.stringify(['ORG-001', 'ORG-002']),
        value: 'false',
      },
    };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(parsed.updatedCount).toBe(1);
    expect(setValuesSpy).toHaveBeenCalled();
  });

  it('regenerateCertificate action sets status to Pendiente and clears PDF URL', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF'];
    const rows = [
      ['ORG-001', 'Ana', 'Uno', 'Directora', 'Tech', true, 'Generado', 'https://drive.google.com/test.pdf'],
    ];
    const setValueSpy = vi.fn();
    const setValuesSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: setValuesSpy,
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = {
      parameter: {
        callback: 'cb',
        action: 'regenerateCertificate',
        identifier: 'ORG-001',
      },
    };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(setValueSpy).toHaveBeenCalledWith(true);
    expect(setValueSpy).toHaveBeenCalledWith('Pendiente');
    expect(setValueSpy).toHaveBeenCalledWith('');
  });

  it('updateSendCertificate action with unknown identifier returns { success: false } with error message', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO'];
    const rows = [
      ['ORG-001', 'Ana', 'Uno', 'Directora', 'Tech', false],
    ];
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () => row === 1
              ? [headers]
              : rows.slice(row - 2, row - 2 + rowCount).map(values => [values[column - 1]]),
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: vi.fn(),
        };
      },
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = { parameter: { callback: 'cb', action: 'updateSendCertificate', identifier: 'UNKNOWN-999', value: 'true' } };
    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);

    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.success).toBe(false);
    expect(typeof parsed.error).toBe('string');
    expect(parsed.error.length).toBeGreaterThan(0);
  });

  it('reads participants successfully when population=participants is passed', () => {
    const headers = ['Código', 'DNI', 'Nombres y apellidos', 'Rol', 'Equipo', 'Correo personal', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF'];
    const rows = [
      ['IM26-001', '71234567', 'Juan Pérez', 'Participante', 'Equipo Alfa', 'juan@example.com', true, 'Listo', 'https://drive.google.com/test.pdf'],
      ['IM26-002', '79876543', 'María García', 'Líder', 'Equipo Beta', 'maria@example.com', false, '', ''],
    ];
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount: number) => ({
        getValues: () =>
          row === 1
            ? [headers]
            : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
      }),
    };
    const propertiesService = {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          if (key === 'PARTICIPANTS_SPREADSHEET_ID') return 'mock-part-sheet-id';
          if (key === 'PARTICIPANTS_SHEET_NAME') return 'mock-part-sheet-name';
          return null;
        },
      }),
    };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });
    const e = { parameter: { callback: 'cb', population: 'participants' } };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(Array.isArray(parsed.participants)).toBe(true);
    expect(parsed.participants).toHaveLength(2);
    expect(parsed.participants[0]).toMatchObject({
      identifier: 'IM26-001',
      fullName: 'Juan Pérez',
      role: 'Participante',
      team: 'Equipo Alfa',
      email: 'juan@example.com',
      sendCertificate: true,
      generationStatus: 'Listo',
      drivePdfUrl: 'https://drive.google.com/test.pdf',
    });
    expect(parsed.participants[1].sendCertificate).toBe(false);
  });

  it('updates ENVIAR CERTIFICADO for participant when population=participants', () => {
    const headers = ['Código', 'DNI', 'Nombres y apellidos', 'Rol', 'Equipo', 'Correo personal', 'ENVIAR CERTIFICADO'];
    const rows = [
      ['IM26-001', '71234567', 'Juan Pérez', 'Participante', 'Equipo Alfa', 'juan@example.com', false],
    ];
    const setValueSpy = vi.fn();
    const setValuesSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: setValuesSpy,
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };
    const propertiesService = {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          if (key === 'PARTICIPANTS_SPREADSHEET_ID') return 'mock-part-sheet-id';
          if (key === 'PARTICIPANTS_SHEET_NAME') return 'mock-part-sheet-name';
          return null;
        },
      }),
    };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = {
      parameter: {
        callback: 'cb',
        action: 'updateSendCertificate',
        population: 'participants',
        identifier: 'IM26-001',
        value: 'true',
      },
    };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(setValueSpy).toHaveBeenCalledWith(true);
  });

  it('updateBulkSendCertificate updates multiple rows and protects Generado on false', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION'];
    const rows = [
      ['ORG-001', 'Ana', 'Uno', 'Directora', 'Tech', true, 'Generado'],
      ['ORG-002', 'Beto', 'Dos', 'Mentor', 'Tech', true, 'Pendiente'],
    ];
    const setValueSpy = vi.fn();
    const setValuesSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: setValuesSpy,
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    // Deselect all: ORG-001 (Generado) should be protected and NOT updated. ORG-002 should be updated to false.
    const e = {
      parameter: {
        callback: 'cb',
        action: 'updateBulkSendCertificate',
        identifiers: JSON.stringify(['ORG-001', 'ORG-002']),
        value: 'false',
      },
    };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(parsed.updatedCount).toBe(1);
    expect(setValuesSpy).toHaveBeenCalled();
  });

  it('regenerateCertificate action sets status to Pendiente and clears PDF URL', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF'];
    const rows = [
      ['ORG-001', 'Ana', 'Uno', 'Directora', 'Tech', true, 'Generado', 'https://drive.google.com/test.pdf'],
    ];
    const setValueSpy = vi.fn();
    const setValuesSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: setValuesSpy,
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };
    const propertiesService = { getScriptProperties: () => ({ getProperty: () => 'configured' }) };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = {
      parameter: {
        callback: 'cb',
        action: 'regenerateCertificate',
        identifier: 'ORG-001',
      },
    };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(setValueSpy).toHaveBeenCalledWith(true);
    expect(setValueSpy).toHaveBeenCalledWith('Pendiente');
    expect(setValueSpy).toHaveBeenCalledWith('');
  });

  it('executes generateCertificates action mocking DriveApp and SlidesApp', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF'];
    const rows = [
      ['ORG-001', 'Ana', 'García', 'Directora', 'Tech', true, '', ''],
    ];
    const setValueSpy = vi.fn();
    const setValuesSpy = vi.fn();
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: setValuesSpy,
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: setValueSpy,
        };
      },
    };

    const replaceAllTextSpy = vi.fn();
    const slideMock = { replaceAllText: replaceAllTextSpy };
    const slideDocMock = {
      getSlides: () => [slideMock],
      saveAndClose: vi.fn(),
    };
    const copyFileMock = {
      getId: () => 'slide-copy-id',
      getAs: () => ({ setName: vi.fn() }),
      setTrashed: vi.fn(),
    };
    const createdPdfMock = {
      getUrl: () => 'https://drive.google.com/pdf/test-certificate.pdf',
    };
    const personFolderMock = {
      createFile: vi.fn(() => createdPdfMock),
    };
    const createFolderSpy = vi.fn(() => personFolderMock);
    const getFoldersByNameSpy = vi.fn(() => ({ hasNext: () => false }));
    const targetFolderMock = {
      createFile: () => createdPdfMock,
      getFolders: () => ({ hasNext: () => false }),
      createFolder: createFolderSpy,
      getFoldersByName: getFoldersByNameSpy,
    };
    const templateFileMock = {
      makeCopy: () => copyFileMock,
    };

    const driveApp = {
      getFolderById: () => targetFolderMock,
      getFileById: () => templateFileMock,
    };
    const slidesApp = {
      openById: () => slideDocMock,
    };

    const propertiesService = {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          if (key === 'ORGANIZERS_SPREADSHEET_ID') return 'mock-org-sheet-id';
          if (key === 'ORGANIZERS_SHEET_NAME') return 'mock-org-sheet-name';
          if (key === 'DRIVE_FOLDER_ID') return 'mock-drive-folder-id';
          if (key === 'TEMPLATE_ORGANIZERS_ID') return 'mock-template-id';
          return null;
        },
      }),
    };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = {
      parameter: {
        callback: 'cb',
        action: 'generateCertificates',
        population: 'organizers',
        items: JSON.stringify([{ identifier: 'ORG-001', fullName: 'Ana García', hours: 120 }]),
      },
    };

    const doGet = new Function(
      'PropertiesService',
      'SpreadsheetApp',
      'ContentService',
      'DriveApp',
      'SlidesApp',
      `${source}; return doGet(arguments[5]);`
    );

    const result = doGet(propertiesService, spreadsheetApp, contentService, driveApp, slidesApp, e) as { content: string; mime: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(parsed.generatedCount).toBe(1);
    expect(parsed.results[0].status).toBe('Generado');
    expect(parsed.results[0].pdfUrl).toBe('https://drive.google.com/pdf/test-certificate.pdf');
    expect(createFolderSpy).toHaveBeenCalledWith('Ana García');
    expect(personFolderMock.createFile).toHaveBeenCalled();
    expect(replaceAllTextSpy).toHaveBeenCalledWith('{{NOMBRE}}', 'Ana García');
    expect(replaceAllTextSpy).toHaveBeenCalledWith('{{NOMBRE_COMPLETO}}', 'Ana García');
    expect(replaceAllTextSpy).toHaveBeenCalledWith('{{HORAS}}', '120 horas académicas');
    expect(copyFileMock.setTrashed).toHaveBeenCalledWith(true);
  });

  it('selects the slide with hours and removes the non-hours slide when person has hours', () => {
    const headers = ['IDENTIFICADOR', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF'];
    const rows = [
      ['ORG-002', 'Carlos', 'Paredes', 'Líder', 'Logística', true, '', ''],
    ];
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount?: number) => {
        if (rowCount !== undefined) {
          return {
            getValues: () =>
              row === 1
                ? [headers]
                : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
            setValues: vi.fn(),
          };
        }
        const cellValue = rows[row - 2]?.[column - 1] ?? '';
        return {
          getValue: () => cellValue,
          setValue: vi.fn(),
        };
      },
    };

    const removeSlideNoHours = vi.fn();
    const removeSlideWithHours = vi.fn();
    const replaceAllTextSlideWithHours = vi.fn();

    const slideWithoutHours = {
      getShapes: () => [{ getText: () => ({ asString: () => 'Texto general sin etiquetas' }) }],
      remove: removeSlideNoHours,
      replaceAllText: vi.fn(),
    };
    const slideWithHours = {
      getShapes: () => [{ getText: () => ({ asString: () => 'Certificado con {{HORAS}} incluidas' }) }],
      remove: removeSlideWithHours,
      replaceAllText: replaceAllTextSlideWithHours,
    };

    const slideDocMock = {
      getSlides: () => [slideWithoutHours, slideWithHours],
      saveAndClose: vi.fn(),
    };
    const copyFileMock = {
      getId: () => 'multi-slide-copy-id',
      getAs: () => ({ setName: vi.fn() }),
      setTrashed: vi.fn(),
    };
    const targetFolderMock = {
      createFile: () => ({ getUrl: () => 'https://drive.google.com/pdf/carlos.pdf' }),
    };
    const templateFileMock = {
      makeCopy: () => copyFileMock,
    };

    const driveApp = {
      getFolderById: () => targetFolderMock,
      getFileById: () => templateFileMock,
    };
    const slidesApp = {
      openById: () => slideDocMock,
    };

    const propertiesService = {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          if (key === 'ORGANIZERS_SPREADSHEET_ID') return 'mock-org-sheet-id';
          if (key === 'ORGANIZERS_SHEET_NAME') return 'mock-org-sheet-name';
          if (key === 'DRIVE_FOLDER_ID') return 'mock-drive-folder-id';
          if (key === 'TEMPLATE_ORGANIZERS_ID') return 'mock-template-id';
          return null;
        },
      }),
    };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });

    const e = {
      parameter: {
        callback: 'cb',
        action: 'generateCertificates',
        population: 'organizers',
        items: JSON.stringify([{ identifier: 'ORG-002', fullName: 'Carlos Paredes', hours: 80 }]),
      },
    };

    const doGet = new Function(
      'PropertiesService',
      'SpreadsheetApp',
      'ContentService',
      'DriveApp',
      'SlidesApp',
      `${source}; return doGet(arguments[5]);`
    );

    const result = doGet(propertiesService, spreadsheetApp, contentService, driveApp, slidesApp, e) as { content: string; mime: string };
    const parsed = JSON.parse(result.content.replace(/^cb\(/, '').replace(/\);$/, ''));

    expect(parsed.success).toBe(true);
    expect(removeSlideNoHours).toHaveBeenCalled();
    expect(removeSlideWithHours).not.toHaveBeenCalled();
    expect(replaceAllTextSlideWithHours).toHaveBeenCalledWith('{{NOMBRE_COMPLETO}}', 'Carlos Paredes');
    expect(replaceAllTextSlideWithHours).toHaveBeenCalledWith('{{HORAS}}', '80 horas académicas');
  });

  it('returns a distinct dni field for organizers read from the DNI column', () => {
    const headers = ['IDENTIFICADOR', 'DNI', 'NOMBRES COMPLETOS', 'APELLIDOS COMPLETOS', 'ROL QUE DESEMPEÑAS', 'AREA DE INTERES', 'ENVIAR CERTIFICADO'];
    const rows = [
      ['ORG-001', '71234567', 'Ana', 'Uno', 'Directora', 'Tech', true],
    ];
    const { propertiesService, spreadsheetApp } = baseSetup(headers, rows);
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });
    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet();`);

    const result = doGet(propertiesService, spreadsheetApp, contentService) as { content: string };
    const response = JSON.parse(result.content);

    expect(response.success).toBe(true);
    expect(response.organizers).toHaveLength(1);
    expect(response.organizers[0].identifier).toBe('ORG-001');
    expect(response.organizers[0].dni).toBe('71234567');
  });

  it('returns dni for participants without changing identifier fallback semantics', () => {
    const headers = ['Código', 'DNI', 'Nombres y apellidos', 'Rol', 'Equipo', 'Correo personal', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF'];
    const rows = [
      ['IM26-001', '71234567', 'Juan Pérez', 'Participante', 'Equipo Alfa', 'juan@example.com', true, '', ''],
      ['IM26-002', '', 'María García', 'Líder', 'Equipo Beta', 'maria@example.com', false, '', ''],
      ['', '55555555', 'Sin Código', 'Participante', 'Equipo Gamma', 'sincodigo@example.com', false, '', ''],
    ];
    const sheet = {
      getLastRow: () => rows.length + 1,
      getLastColumn: () => headers.length,
      getRange: (row: number, column: number, rowCount: number) => ({
        getValues: () =>
          row === 1
            ? [headers]
            : rows.slice(row - 2, row - 2 + rowCount).map((values) => [values[column - 1]]),
      }),
    };
    const propertiesService = {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          if (key === 'PARTICIPANTS_SPREADSHEET_ID') return 'mock-part-sheet-id';
          if (key === 'PARTICIPANTS_SHEET_NAME') return 'mock-part-sheet-name';
          return null;
        },
      }),
    };
    const spreadsheetApp = { openById: () => ({ getSheetByName: () => sheet }) };
    const contentService = makeContentService({ JSON: 'application/json', JAVASCRIPT: 'application/javascript' });
    const e = { parameter: { callback: 'cb', population: 'participants' } };

    const doGet = new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', `${source}; return doGet(arguments[3]);`);
    const result = doGet(propertiesService, spreadsheetApp, contentService, e) as { content: string };
    const jsonStr = result.content.replace(/^cb\(/, '').replace(/\);$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.success).toBe(true);
    expect(parsed.participants).toHaveLength(3);
    // DNI present: dni is a distinct field, identifier stays the código
    expect(parsed.participants[0].identifier).toBe('IM26-001');
    expect(parsed.participants[0].dni).toBe('71234567');
    // DNI missing: dni empty, identifier still falls back to código only
    expect(parsed.participants[1].identifier).toBe('IM26-002');
    expect(parsed.participants[1].dni).toBe('');
    // Identifier semantics unchanged: código empty → identifier = dni
    expect(parsed.participants[2].identifier).toBe('55555555');
    expect(parsed.participants[2].dni).toBe('55555555');
  });
});

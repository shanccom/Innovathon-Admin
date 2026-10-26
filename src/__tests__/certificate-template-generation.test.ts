import { describe, expect, it, vi } from 'vitest';
import source from '../../apps-script/certificates/Code.gs?raw';

function snapshotHash(snapshot: string): string {
  let hash = 2166136261;
  for (let index = 0; index < snapshot.length; index++) {
    hash = Math.imul(hash ^ snapshot.charCodeAt(index), 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function generate(notes: string[], options: { template?: string; role?: string; population?: string; status?: string; secondTemplate?: string; requestedTemplate?: unknown; secondRequestedTemplate?: unknown; duplicateRequest?: boolean; sheetDriven?: boolean } = {}) {
  const headers = [options.population === 'participants' ? 'Código' : 'IDENTIFICADOR', 'NOMBRES COMPLETOS', options.population === 'participants' ? 'Rol' : 'ROL QUE DESEMPEÑAS', 'ENVIAR CERTIFICADO', 'ESTADO GENERACION', 'URL DRIVE PDF', 'TIPO DE PLANTILLA'];
  const rows = [['ORG-1', 'Ana', options.role || 'VOLUNTARIO', true, options.status || 'Pendiente', '', options.template ?? 'Organizador']];
  if (options.secondTemplate !== undefined) rows.push(['ORG-2', 'Beto', 'VOLUNTARIO', true, 'Pendiente', '', options.secondTemplate]);
  const write = vi.fn((row: number, col: number, value: string) => {
    if (row === 1) headers[col - 1] = value;
    else rows[row - 2][col - 1] = value;
  });
  const sheet = {
    getLastRow: () => rows.length + 1,
    getLastColumn: () => headers.length,
    getRange: (row: number, col: number, count = 1, width = 1) => ({
      getValues: () => row === 1 ? [headers] : rows.slice(row - 2, row - 2 + count).map(r => r.slice(col - 1, col - 1 + width)),
      getValue: () => rows[row - 2]?.[col - 1],
      setValue: (value: string) => write(row, col, value),
    }),
  };
  const slides = notes.map(note => ({
    getNotesPage: () => ({ getSpeakerNotesShape: () => ({ getText: () => ({ asString: () => note }) }) }),
    replaceAllText: vi.fn(), remove: vi.fn(),
  }));
  const createPdf = vi.fn(() => ({ getUrl: () => 'generated.pdf' }));
  const copy = vi.fn(() => ({ getId: () => 'copy', getAs: () => ({ setName: vi.fn() }), setTrashed: vi.fn() }));
  const run = (parameter: Record<string, string>) => new Function('PropertiesService', 'SpreadsheetApp', 'ContentService', 'DriveApp', 'SlidesApp', 'e', `${source}; return doGet(e);`)(
    { getScriptProperties: () => ({ getProperty: () => 'configured' }) },
    { openById: () => ({ getSheetByName: () => sheet }) },
    { MimeType: { JSON: 'json' }, createTextOutput: (content: string) => ({ setMimeType: () => content }) },
    { getFolderById: () => ({ createFile: createPdf }), getFileById: () => ({ makeCopy: copy }) },
    { openById: () => ({ getSlides: () => slides, saveAndClose: vi.fn() }) },
    { parameter },
  );
  const population = options.population || 'organizers';
  const readHash = () => snapshotHash(run({ population }));
  const beforeHash = readHash();
  const items = rows.map((row, index) => ({
    identifier: row[0], role: 'Organizador', hours: 120,
    templateType: index === 0 ? options.requestedTemplate : options.secondRequestedTemplate,
  }));
  if (options.duplicateRequest) items.push({ identifier: 'ORG-1', role: 'Organizador', hours: 120, templateType: 'volunteer' });
  const parameter: Record<string, string> = { action: 'generateCertificates', population };
  if (!options.sheetDriven) parameter.items = JSON.stringify(items);
  const output = run(parameter);
  return { result: JSON.parse(output), slides, createPdf, copy, write, beforeHash, afterHash: readHash() };
}

describe('certificate deck generation', () => {
  it.each([
    { template: 'Organizador', expected: 0 },
    { template: 'Voluntario', expected: 1 },
    { role: 'DIRECTOR DE ÁREA', template: '', expected: 2 },
    { population: 'participants', template: '', expected: 3 },
  ])('routes by persisted identity, independently of payload role: %j', options => {
    const { result, slides, createPdf } = generate(['TIPO DE PLANTILLA: Organizador', 'rol: voluntario', 'rol: director de área', 'TIPO DE PLANTILLA: Participante'], options);
    expect(result).toMatchObject({ success: true, generatedCount: 1 });
    expect(createPdf).toHaveBeenCalledTimes(1);
    slides.forEach((slide, index) => {
      if (index === options.expected) {
        expect(slide.remove).not.toHaveBeenCalled();
        expect(slide.replaceAllText).toHaveBeenCalledWith('{{HORAS}}', '');
        expect(slide.replaceAllText).toHaveBeenCalledWith('{{HORAS_ACADEMICAS}}', '');
        expect(slide.replaceAllText).toHaveBeenCalledWith('{{ROL}}', options.role || 'VOLUNTARIO');
      } else expect(slide.remove).toHaveBeenCalledOnce();
    });
  });

  it.each([
    { notes: ['rol: voluntario', 'rol: director de área'], error: 'No se encontró una diapositiva para la plantilla organizer.' },
    { notes: ['rol: organizador', 'TIPO DE PLANTILLA: Organizador'], error: 'Hay varias diapositivas para la plantilla organizer.' },
    { notes: ['rol: organizador'], template: '', error: 'Selecciona el tipo de emisión para ORG-1 antes de generar.' },
    { notes: ['rol: organizador'], template: 'invalid', error: 'Selecciona el tipo de emisión para ORG-1 antes de generar.' },
    { notes: ['rol: director de área'], error: 'No se encontró una diapositiva para la plantilla organizer.' },
  ])('rejects unsafe selection before any copy, PDF or state writes: %j', ({ notes, template, error }) => {
    const { result, createPdf, copy, write } = generate(notes, { template });
    expect(result).toEqual({ success: false, error });
    expect(createPdf).not.toHaveBeenCalled();
    expect(copy).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('rejects an unlabelled single-slide deck before any copy, PDF or sheet mutation', () => {
    const { result, createPdf, copy, write, beforeHash, afterHash } = generate(['']);
    expect(result).toEqual({ success: false, error: 'No se encontró una diapositiva para la plantilla organizer.' });
    expect(copy).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(afterHash).toBe(beforeHash);
  });

  it('does not replace already generated PDFs when preferences change', () => {
    const { result, createPdf, write } = generate([''], { status: 'Generado' });
    expect(result).toEqual({ success: true, generatedCount: 0, results: [] });
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('validates every row before generating even the first PDF', () => {
    const { result, copy, createPdf, write } = generate(['rol: organizador', 'rol: participante'], { secondTemplate: 'Voluntario' });
    expect(result).toEqual({ success: false, error: 'No se encontró una diapositiva para la plantilla volunteer.' });
    expect(copy).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it.each([{ notes: [] }, { notes: ['TIPO DE PLANTILLA: Organizador\nrol: voluntario'] }])('rejects empty or conflicting decks without side effects: %j', ({ notes }) => {
    const { result, copy, write, createPdf } = generate(notes);
    expect(result.success).toBe(false);
    expect(result.error).toBe(notes.length ? 'La diapositiva tiene varias etiquetas de plantilla.' : 'No se encontró una diapositiva para la plantilla organizer.');
    expect(copy).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
  });

  it.each([
    { requestedTemplate: 'volunteer', error: 'El tipo de plantilla solicitado para ORG-1 no coincide con el tipo guardado o asignado (organizer). Actualiza la vista antes de generar.' },
    ...['', 'invalid', null, 1].map(requestedTemplate => ({ requestedTemplate, error: 'El tipo de plantilla solicitado para ORG-1 no es válido.' })),
  ])('rejects mismatched or invalid explicit template without changing the public sheet snapshot: %j', ({ requestedTemplate, error }) => {
    const { result, createPdf, copy, write, beforeHash, afterHash } = generate(['TIPO DE PLANTILLA: Organizador'], { requestedTemplate });
    expect(result).toEqual({ success: false, error });
    expect(afterHash).toBe(beforeHash);
    expect(copy).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it.each([
    { template: 'Organizador', requestedTemplate: 'organizer', note: 'Organizador', role: 'VOLUNTARIO' },
    { template: 'Voluntario', requestedTemplate: 'volunteer', note: 'Voluntario', role: 'VOLUNTARIO' },
    { requestedTemplate: 'area_director', note: 'Director de área', role: 'DIRECTOR DE ÁREA' },
    { population: 'participants', requestedTemplate: 'participant', note: 'Participante', role: 'PARTICIPANTE' },
  ])('accepts matching explicit identity and retains the literal role: %j', ({ note, ...options }) => {
    const { result, slides, copy, createPdf } = generate([`TIPO DE PLANTILLA: ${note}`], options);
    expect(result).toMatchObject({ success: true, generatedCount: 1 });
    expect(copy).toHaveBeenCalledOnce();
    expect(createPdf).toHaveBeenCalledOnce();
    expect(slides[0].replaceAllText).toHaveBeenCalledWith('{{ROL}}', options.role);
  });

  it.each([
    { role: 'DIRECTOR DE ÁREA', expected: 'area_director' },
    { population: 'participants', expected: 'participant' },
  ])('rejects an explicit override of a fixed template: %j', ({ expected, ...options }) => {
    const { result, copy, createPdf, write, beforeHash, afterHash } = generate(['TIPO DE PLANTILLA: Organizador'], { ...options, requestedTemplate: 'organizer' });
    expect(result).toEqual({ success: false, error: `El tipo de plantilla solicitado para ORG-1 no coincide con el tipo guardado o asignado (${expected}). Actualiza la vista antes de generar.` });
    expect(afterHash).toBe(beforeHash);
    expect(copy).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('validates the last explicit selection before generating any PDF in the batch', () => {
    const { result, copy, createPdf, write, beforeHash, afterHash } = generate(['rol: organizador', 'rol: voluntario'], {
      requestedTemplate: 'organizer', secondTemplate: 'Voluntario', secondRequestedTemplate: 'organizer',
    });
    expect(result).toEqual({ success: false, error: 'El tipo de plantilla solicitado para ORG-2 no coincide con el tipo guardado o asignado (volunteer). Actualiza la vista antes de generar.' });
    expect(afterHash).toBe(beforeHash);
    expect(copy).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it.each([{ duplicateRequest: true }, { status: 'Generado' }])('does not silently ignore a mismatched explicit identity: %j', options => {
    const { result, copy, createPdf, write, beforeHash, afterHash } = generate(['rol: organizador'], { ...options, requestedTemplate: options.duplicateRequest ? 'organizer' : 'volunteer' });
    expect(result).toEqual({ success: false, error: 'El tipo de plantilla solicitado para ORG-1 no coincide con el tipo guardado o asignado (organizer). Actualiza la vista antes de generar.' });
    expect(afterHash).toBe(beforeHash);
    expect(copy).not.toHaveBeenCalled();
    expect(createPdf).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it('preserves sheet-driven generation without an optional explicit template field', () => {
    const { result, slides } = generate(['TIPO DE PLANTILLA: Organizador'], { sheetDriven: true });
    expect(result).toMatchObject({ success: true, generatedCount: 1 });
    expect(slides[0].replaceAllText).toHaveBeenCalledWith('{{ROL}}', 'VOLUNTARIO');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppsScriptOrganizerRepository } from '../infrastructure/repositories/apps-script-organizer.repository';
import { AppsScriptParticipantCertificateRepository } from '../infrastructure/repositories/apps-script-participant-certificate.repository';

/** Builds the window/document stubs used by fetchViaJsonp and fires the callback
 *  with the provided payload after the script is appended to the document body. */
function makeJsonpStubs(payload: unknown) {
  const registry: Record<string, unknown> = {};
  const urls: string[] = [];

  const windowStub = new Proxy(registry, {
    get(target, prop: string) { return target[prop]; },
    set(target, prop: string, value) { target[prop] = value; return true; },
    deleteProperty(target, prop: string) { delete target[prop]; return true; },
  });

  let capturedCallbackName: string | null = null;
  const scriptEl = {
    get src() { return ''; },
    set src(url: string) {
      urls.push(url);
      const match = url.match(/[?&]callback=([^&]+)/);
      if (match) capturedCallbackName = match[1];
    },
    onerror: null as null | (() => void),
    parentNode: null,
  };

  const documentStub = {
    createElement: (_tag: string) => scriptEl,
    body: {
      appendChild: (_node: unknown) => {
        if (capturedCallbackName) {
          const cbName = capturedCallbackName;
          setTimeout(() => {
            const fn = registry[cbName];
            if (typeof fn === 'function') fn(payload);
          }, 0);
        }
        return _node;
      },
    },
  };

  return { windowStub, documentStub, urls };
}

describe('AppsScriptOrganizerRepository', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('throws when no endpoint is configured', async () => {
    const repository = new AppsScriptOrganizerRepository('');
    await expect(repository.getOrganizers()).rejects.toThrow('No hay una URL de Google Apps Script configurada');
  });

  it('returns only certificate-view organizer fields via JSONP', async () => {
    const payload = {
      success: true,
      organizers: [{ identifier: 'ORG-1', fullName: 'Ana Pérez', role: 'Directora', area: '', sendCertificate: true, email: 'private@example.com' }],
    };

    const { windowStub, documentStub } = makeJsonpStubs(payload);
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);

    const configured = new AppsScriptOrganizerRepository('https://script.google.com/macros/s/example/exec');
    await expect(configured.getOrganizers()).resolves.toEqual([{
      identifier: 'ORG-1', fullName: 'Ana Pérez', role: 'Directora', area: '', sendCertificate: true,
    }]);
  });

  it('preserves literal role and persisted template while formatting name and area', async () => {
    const payload = {
      success: true,
      organizers: [{ identifier: 'ORG-2', fullName: 'JUAN PEDRO GARCIA', role: 'VOLUNTARIO', templateType: 'organizer', area: 'DISEÑO', sendCertificate: false }],
    };

    const { windowStub, documentStub } = makeJsonpStubs(payload);
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);

    const configured = new AppsScriptOrganizerRepository('https://script.google.com/macros/s/example/exec');
    const result = await configured.getOrganizers();
    expect(result[0].fullName).toBe('Juan Pedro Garcia');
    expect(result[0].role).toBe('VOLUNTARIO');
    expect(result[0]).toHaveProperty('templateType', 'organizer');
    expect(result[0].area).toBe('Diseño');
    // identifier must NOT be title-cased
    expect(result[0].identifier).toBe('ORG-2');
  });

  it('updateSendCertificate resolves when JSONP returns { success: true }', async () => {
    const payload = { success: true };
    const { windowStub, documentStub } = makeJsonpStubs(payload);
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);

    const configured = new AppsScriptOrganizerRepository('https://script.google.com/macros/s/example/exec');
    await expect(configured.updateSendCertificate('ORG-1', true)).resolves.toBeUndefined();
  });

  it('updateSendCertificate rejects when JSONP returns { success: false, error: "msg" }', async () => {
    const payload = { success: false, error: 'msg' };
    const { windowStub, documentStub } = makeJsonpStubs(payload);
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);

    const configured = new AppsScriptOrganizerRepository('https://script.google.com/macros/s/example/exec');
    await expect(configured.updateSendCertificate('ORG-1', true)).rejects.toThrow('msg');
  });

  it('updateSendCertificate throws when no endpoint is configured', async () => {
    const repository = new AppsScriptOrganizerRepository('');
    await expect(repository.updateSendCertificate('ORG-1', true)).rejects.toThrow('No hay una URL de Google Apps Script configurada');
  });

  it.each([true, false])('persists template with encoded identifier and propagates success=%j', async success => {
    const { windowStub, documentStub, urls } = makeJsonpStubs({ success, error: 'No se pudo guardar.' });
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);
    const request = new AppsScriptOrganizerRepository('https://example.com/exec').updateTemplateType('ORG &1', 'organizer');
    if (success) await expect(request).resolves.toBeUndefined();
    else await expect(request).rejects.toThrow('No se pudo guardar.');
    const url = new URL(urls[0]);
    expect(url.searchParams.get('action')).toBe('updateTemplateType');
    expect(url.searchParams.get('identifier')).toBe('ORG &1');
    expect(url.searchParams.get('value')).toBe('organizer');
  });

  it('preserves participant role literally while retaining formatted names', async () => {
    const { windowStub, documentStub } = makeJsonpStubs({ success: true, participants: [{ identifier: 'P1', fullName: 'ANA PÉREZ', role: 'EJE TECNOLOGÍA', team: 'Alfa', sendCertificate: false }] });
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);
    const participants = await new AppsScriptParticipantCertificateRepository('https://example.com/exec').getParticipantCertificates();
    expect(participants[0]).toMatchObject({ fullName: 'Ana Pérez', role: 'EJE TECNOLOGÍA' });
  });

  it.each(['organizers', 'participants'])('omits legacy hours from %s generation payloads and preserves roles', async population => {
    const { windowStub, documentStub, urls } = makeJsonpStubs({ success: true, generatedCount: 1, results: [] });
    vi.stubGlobal('window', windowStub);
    vi.stubGlobal('document', documentStub);
    const repository = population === 'organizers' ? new AppsScriptOrganizerRepository('https://example.com/exec') : new AppsScriptParticipantCertificateRepository('https://example.com/exec');
    const legacyItem = { identifier: 'ORG-1', fullName: 'Ana', role: 'VOLUNTARIO', templateType: 'organizer' as const, hours: 120 };
    await expect(repository.generateCertificates([legacyItem])).resolves.toMatchObject({ generatedCount: 1 });
    const items = JSON.parse(new URL(urls[0]).searchParams.get('items') || '[]');
    expect(items).toEqual([{ identifier: 'ORG-1', fullName: 'Ana', role: 'VOLUNTARIO', templateType: population === 'organizers' ? 'organizer' : 'participant' }]);
  });
});

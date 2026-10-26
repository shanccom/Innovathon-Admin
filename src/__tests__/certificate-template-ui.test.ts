import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CertificateTable } from '../presentation/pages/certificates/components/CertificateTable';
import { GenerateBatchModal } from '../presentation/pages/certificates/components/GenerateBatchModal';

const person = { identifier: 'ORG-1', fullName: 'Ana Pérez', role: 'VOLUNTARIO', area: 'Tech', sendCertificate: false, templateType: 'organizer' as const };
const props = {
  organizers: [person], onToggleSendCertificate: vi.fn(), toggleErrors: {}, activeCount: 0, totalCount: 1,
  emissionTypeMap: { 'ORG-1': 'organizer' as const }, onEmissionTypeChange: vi.fn(),
};

describe('certificate table surface', () => {
  it('renders plain literal role, one accessible template select and no hours even before activation', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, props));
    expect(html).toContain('<td>VOLUNTARIO</td>');
    expect(html).toContain('TIPO DE EMISIÓN');
    expect(html.match(/<select/g)).toHaveLength(1);
    expect(html).toContain('class="emission-type-select emission-type-organizer"');
    expect(html).toContain('aria-label="Tipo de emisión de Ana Pérez"');
    expect(html).toContain('<option value="organizer" selected="">Organizador</option>');
    expect(html).not.toMatch(/horas|hrs/i);
    expect(html).toContain('0 de 1');
  });

  it('shows an explicit neutral unselected option rather than a role-derived default', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, { ...props, emissionTypeMap: {} }));
    expect(html).toContain('<option value="" disabled="" selected="">Seleccionar tipo</option>');
    expect(html).toContain('class="emission-type-select"');
  });

  it('uses the volunteer color when the selected template is volunteer', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, {
      ...props,
      emissionTypeMap: { 'ORG-1': 'volunteer' as const },
    }));
    expect(html).toContain('class="emission-type-select emission-type-volunteer"');
  });

  it('keeps directors noneditable and preserves generated PDF and regeneration controls', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, {
      ...props, emissionTypeMap: undefined, onEmissionTypeChange: undefined, onRegenerateCertificate: vi.fn(),
      organizers: [{ ...person, role: 'DIRECTOR DE ÁREA', generationStatus: 'Generado', drivePdfUrl: 'existing.pdf' }],
    }));
    expect(html).not.toContain('<select');
    expect(html).toContain('<td>DIRECTOR DE ÁREA</td>');
    expect(html).toContain('existing.pdf');
    expect(html).toContain('Regenerar certificado de Ana Pérez');
  });

  it('renders participant role as literal text without a badge or template selector', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, { ...props, population: 'participantes', emissionTypeMap: undefined, onEmissionTypeChange: undefined }));
    expect(html).toContain('<td>VOLUNTARIO</td>');
    expect(html).not.toContain('<select');
    expect(html).not.toMatch(/horas|hrs/i);
  });

  it('explains that a preference change does not change an existing PDF', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, { ...props, organizers: [{ ...person, generationStatus: 'Generado' }] }));
    expect(html).toContain('El PDF actual no cambia. Regenera para aplicar el tipo.');
  });

  it('renders row-scoped saving and error feedback', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, { ...props, savingTemplateIds: new Set(['ORG-1']), templateErrors: { 'ORG-1': 'No se pudo guardar.' } }));
    expect(html).toContain('Guardando…');
    expect(html).toContain('No se pudo guardar.');
    expect(html).toContain('aria-busy="true"');
  });

  it('removes hours from batch confirmation while preserving the selected population', () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    const html = renderToStaticMarkup(React.createElement(GenerateBatchModal, {
      isOpen: true, onClose: vi.fn(), organizers: [{ ...person, sendCertificate: true }], onConfirm: vi.fn(),
    }));
    vi.unstubAllGlobals();
    expect(html).not.toMatch(/horas|hrs/i);
    expect(html).toContain('Ana Pérez');
    expect(html).toContain('Confirmar y generar (1)');
  });
});

import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  filterCertificateRecords,
  getBulkCertificateTargets,
} from '../presentation/pages/certificates/certificate-table.utils';
import { CertificateTable } from '../presentation/pages/certificates/components/CertificateTable';

const records = [
  { identifier: 'DIR-1', fullName: 'Ada Director', role: 'DIRECTOR DE ÁREA', area: 'Logística', sendCertificate: false },
  { identifier: 'ORG-1', fullName: 'Bea Volunteer', role: 'VOLUNTARIO', area: 'Marketing', sendCertificate: false },
  { identifier: 'ORG-2', fullName: 'Cal Organizer', role: 'ORGANIZADOR', area: 'Logística', sendCertificate: true },
];

describe('certificate table filters and bulk actions', () => {
  it('applies shared filters to the complete organizers list before sectioning tables', () => {
    const result = filterCertificateRecords(records, {
      search: '',
      roles: new Set(['DIRECTOR DE ÁREA']),
      areas: new Set(['Logística']),
      sendFilter: 'all',
    }, (record) => record.area);

    expect(result.map((record) => record.identifier)).toEqual(['DIR-1']);
  });

  it('limits selection to visible, ungenerated records belonging to the clicked table', () => {
    const visibleDirectors = records.filter((record) => record.role === 'DIRECTOR DE ÁREA');
    const targets = getBulkCertificateTargets(visibleDirectors, true);

    expect(targets.map((record) => record.identifier)).toEqual(['DIR-1']);
  });

  it('deselects only selected, ungenerated visible records and protects generated certificates', () => {
    const visible = [
      { ...records[0], sendCertificate: true, generationStatus: 'Pendiente' },
      { ...records[1], sendCertificate: true, generationStatus: 'Generado' },
      { ...records[2], sendCertificate: false, generationStatus: '' },
    ];

    expect(getBulkCertificateTargets(visible, false).map((record) => record.identifier)).toEqual(['DIR-1']);
  });

  it('renders the selection controls inside the table that owns their scope', () => {
    const html = renderToStaticMarkup(React.createElement(CertificateTable, {
      organizers: [],
      onToggleSendCertificate: () => {},
      toggleErrors: {},
      activeCount: 0,
      totalCount: 0,
      populationLabel: 'Directores de Área',
      onSelectAllVisible: () => {},
      onDeselectAllVisible: () => {},
      selectableCount: 3,
      deselectableCount: 2,
    }));

    expect(html).toContain('Acciones masivas para Directores de Área');
    expect(html).toContain('Seleccionar filtrados (3)');
    expect(html).toContain('Desmarcar filtrados (2)');
  });
});

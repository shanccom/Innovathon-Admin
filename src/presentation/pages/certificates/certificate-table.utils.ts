export interface CertificateFilterableRecord {
  identifier: string;
  dni?: string;
  fullName: string;
  role: string;
  sendCertificate: boolean;
  generationStatus?: string;
}

export interface CertificateListFilters {
  search: string;
  roles: ReadonlySet<string>;
  areas: ReadonlySet<string>;
  sendFilter: 'all' | 'yes' | 'no';
}

export function filterCertificateRecords<T extends CertificateFilterableRecord>(
  records: readonly T[],
  filters: CertificateListFilters,
  getArea: (record: T) => string | undefined
): T[] {
  const query = filters.search.trim().toLowerCase();

  return records.filter((record) => {
    if (query) {
      const searchableValues = [record.fullName, record.identifier, record.dni || ''];
      if (!searchableValues.some((value) => value.toLowerCase().includes(query))) return false;
    }

    if (filters.roles.size > 0 && !filters.roles.has(record.role)) return false;
    if (filters.areas.size > 0) {
      const area = getArea(record);
      if (!area || !filters.areas.has(area)) return false;
    }
    if (filters.sendFilter === 'yes' && !record.sendCertificate) return false;
    if (filters.sendFilter === 'no' && record.sendCertificate) return false;
    return true;
  });
}

export function getBulkCertificateTargets<T extends CertificateFilterableRecord>(
  visibleRecords: readonly T[],
  select: boolean
): T[] {
  return visibleRecords.filter((record) => {
    const status = record.generationStatus?.trim().toLowerCase();
    if (status === 'generado' || status === 'emitido') return false;
    return select ? !record.sendCertificate : record.sendCertificate;
  });
}

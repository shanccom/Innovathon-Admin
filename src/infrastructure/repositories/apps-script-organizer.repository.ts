import { Organizer } from '../../domain/models/organizer.model';
import {
  OrganizerRepository,
  CertificateGenerationItem,
  GenerateCertificatesResponse,
} from '../../domain/repositories/organizer.repository';
import { APPS_SCRIPT_ENDPOINTS } from '../config/endpoints.config';

interface OrganizerResponse {
  success?: boolean;
  organizers?: Organizer[];
  error?: string;
}

interface UpdateResponse {
  success?: boolean;
  updatedCount?: number;
  error?: string;
}

const JSONP_TIMEOUT_MS = 35_000;

function fetchViaJsonp(url: string, timeoutMs = JSONP_TIMEOUT_MS): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const callbackName = `__jsonp_cert_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    script.crossOrigin = 'anonymous';
    let settled = false;

    const cleanup = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('No se pudo conectar con Apps Script. Verifica la URL, el despliegue y el acceso web.'));
    }, timeoutMs);

    (window as unknown as Record<string, unknown>)[callbackName] = (payload: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(payload);
    };

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    script.onerror = (event) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      console.error('[AppsScriptOrganizer] Fallo al cargar script JSONP:', script.src, event);
      reject(new Error('No se pudo conectar con Apps Script. Verifica la URL, el despliegue y el acceso web.'));
    };

    document.body.appendChild(script);
  });
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export class AppsScriptOrganizerRepository implements OrganizerRepository {
  constructor(
    private readonly endpoint: string = APPS_SCRIPT_ENDPOINTS.certificates
  ) {}

  async getOrganizers(): Promise<Organizer[]> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para leer organizadores.');
    }
    let payload: OrganizerResponse;
    try {
      payload = await fetchViaJsonp(this.endpoint) as OrganizerResponse;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Apps Script')) throw err;
      throw new Error('No se pudo conectar con Apps Script. Verifica la URL, el despliegue y el acceso web.');
    }
    if (payload.success !== true || !Array.isArray((payload as OrganizerResponse).organizers)) {
      throw new Error(payload.error || 'Apps Script no pudo leer los organizadores.');
    }
    return (payload as OrganizerResponse).organizers!.map(({ identifier, dni, fullName, role, area, sendCertificate, generationStatus, drivePdfUrl }) => ({
      identifier,
      dni: dni ? dni.trim() : undefined,
      fullName: toTitleCase(fullName),
      role: toTitleCase(role),
      area: toTitleCase(area),
      sendCertificate,
      generationStatus: generationStatus ? generationStatus.trim() : undefined,
      drivePdfUrl: drivePdfUrl ? drivePdfUrl.trim() : undefined,
    }));
  }

  async updateSendCertificate(identifier: string, value: boolean): Promise<void> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para leer organizadores.');
    }
    const url = `${this.endpoint}?action=updateSendCertificate&identifier=${encodeURIComponent(identifier)}&value=${value}`;
    const payload = await fetchViaJsonp(url) as UpdateResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'No se pudo actualizar el campo.');
    }
  }

  async updateBulkSendCertificate(identifiers: string[], value: boolean): Promise<number> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para leer organizadores.');
    }
    const url = `${this.endpoint}?action=updateBulkSendCertificate&identifiers=${encodeURIComponent(JSON.stringify(identifiers))}&value=${value}`;
    const payload = await fetchViaJsonp(url) as UpdateResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'No se pudo actualizar masivamente el campo.');
    }
    return payload.updatedCount ?? identifiers.length;
  }

  async regenerateCertificate(identifier: string): Promise<void> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para leer organizadores.');
    }
    const url = `${this.endpoint}?action=regenerateCertificate&identifier=${encodeURIComponent(identifier)}`;
    const payload = (await fetchViaJsonp(url)) as UpdateResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'No se pudo solicitar la regeneración del certificado.');
    }
  }

  async generateCertificates(items: CertificateGenerationItem[]): Promise<GenerateCertificatesResponse> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para emitir certificados.');
    }
    const separator = this.endpoint.includes('?') ? '&' : '?';
    const compactItems = items.map((it) => ({
      identifier: it.identifier,
      fullName: it.fullName,
      role: it.role,
      area: it.area,
      hours: it.hours,
    }));
    const url = `${this.endpoint}${separator}action=generateCertificates&population=organizers&items=${encodeURIComponent(JSON.stringify(compactItems))}`;
    const payload = (await fetchViaJsonp(url, 90_000)) as GenerateCertificatesResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'Fallo al generar certificados en Apps Script.');
    }
    return payload;
  }
}

export const appsScriptOrganizerRepository = new AppsScriptOrganizerRepository();

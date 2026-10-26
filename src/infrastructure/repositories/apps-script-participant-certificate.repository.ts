import { ParticipantCertificate } from '../../domain/models/participant-certificate.model';
import { ParticipantCertificateRepository } from '../../domain/repositories/participant-certificate.repository';
import {
  CertificateGenerationItem,
  GenerateCertificatesResponse,
} from '../../domain/repositories/organizer.repository';
import { APPS_SCRIPT_ENDPOINTS } from '../config/endpoints.config';

interface ParticipantResponse {
  success?: boolean;
  participants?: ParticipantCertificate[];
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
    const callbackName = `__jsonp_part_cert_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
      reject(new Error('No se pudo conectar con Apps Script para certificados de participantes. Verifica la URL y el despliegue.'));
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
      console.error('[AppsScriptParticipant] Fallo al cargar script JSONP:', script.src, event);
      reject(new Error('No se pudo conectar con Apps Script para certificados de participantes. Verifica la URL y el despliegue.'));
    };

    document.body.appendChild(script);
  });
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export class AppsScriptParticipantCertificateRepository implements ParticipantCertificateRepository {
  constructor(
    private readonly endpoint: string = APPS_SCRIPT_ENDPOINTS.certificates
  ) {}

  async getParticipantCertificates(): Promise<ParticipantCertificate[]> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para certificados.');
    }
    const separator = this.endpoint.includes('?') ? '&' : '?';
    const url = `${this.endpoint}${separator}population=participants`;
    let payload: ParticipantResponse;
    try {
      payload = (await fetchViaJsonp(url)) as ParticipantResponse;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Apps Script')) throw err;
      throw new Error('No se pudo conectar con Apps Script para participantes. Verifica la URL y el despliegue.');
    }
    if (payload.success !== true || !Array.isArray(payload.participants)) {
      throw new Error(payload.error || 'Apps Script no pudo leer los participantes.');
    }
    return payload.participants.map((item) => ({
      identifier: item.identifier,
      dni: item.dni ? item.dni.trim() : undefined,
      fullName: toTitleCase(item.fullName),
      role: item.role,
      team: item.team || 'Sin equipo',
      email: item.email || '',
      sendCertificate: Boolean(item.sendCertificate),
      generationStatus: item.generationStatus ? item.generationStatus.trim() : undefined,
      drivePdfUrl: item.drivePdfUrl ? item.drivePdfUrl.trim() : undefined,
    }));
  }

  async updateSendCertificate(identifier: string, value: boolean): Promise<void> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para certificados.');
    }
    const separator = this.endpoint.includes('?') ? '&' : '?';
    const url = `${this.endpoint}${separator}action=updateSendCertificate&population=participants&identifier=${encodeURIComponent(identifier)}&value=${value}`;
    const payload = (await fetchViaJsonp(url)) as UpdateResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'No se pudo actualizar el campo ENVIAR CERTIFICADO.');
    }
  }

  async updateBulkSendCertificate(identifiers: string[], value: boolean): Promise<number> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para certificados.');
    }
    const separator = this.endpoint.includes('?') ? '&' : '?';
    const url = `${this.endpoint}${separator}action=updateBulkSendCertificate&population=participants&identifiers=${encodeURIComponent(JSON.stringify(identifiers))}&value=${value}`;
    const payload = (await fetchViaJsonp(url)) as UpdateResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'No se pudo actualizar masivamente el campo ENVIAR CERTIFICADO.');
    }
    return payload.updatedCount ?? identifiers.length;
  }

  async regenerateCertificate(identifier: string): Promise<void> {
    if (!this.endpoint) {
      throw new Error('No hay una URL de Google Apps Script configurada para certificados.');
    }
    const separator = this.endpoint.includes('?') ? '&' : '?';
    const url = `${this.endpoint}${separator}action=regenerateCertificate&population=participants&identifier=${encodeURIComponent(identifier)}`;
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
      area: it.area || it.team,
      templateType: 'participant',
    }));
    const url = `${this.endpoint}${separator}action=generateCertificates&population=participants&items=${encodeURIComponent(JSON.stringify(compactItems))}`;
    const payload = (await fetchViaJsonp(url, 90_000)) as GenerateCertificatesResponse;
    if (payload.success !== true) {
      throw new Error(payload.error || 'Fallo al generar certificados de participantes en Apps Script.');
    }
    return payload;
  }
}

export const appsScriptParticipantCertificateRepository = new AppsScriptParticipantCertificateRepository();

import { Organizer } from '../models/organizer.model';

export interface CertificateGenerationItem {
  identifier: string;
  fullName?: string;
  role?: string;
  area?: string;
  team?: string;
  hours?: number;
}

export interface GenerationResult {
  identifier: string;
  fullName: string;
  status: string;
  pdfUrl?: string;
}

export interface GenerateCertificatesResponse {
  success: boolean;
  generatedCount: number;
  results: GenerationResult[];
  error?: string;
}

export interface OrganizerRepository {
  getOrganizers(): Promise<Organizer[]>;
  updateSendCertificate(identifier: string, value: boolean): Promise<void>;
  updateBulkSendCertificate(identifiers: string[], value: boolean): Promise<number>;
  regenerateCertificate(identifier: string): Promise<void>;
  generateCertificates(items: CertificateGenerationItem[]): Promise<GenerateCertificatesResponse>;
}

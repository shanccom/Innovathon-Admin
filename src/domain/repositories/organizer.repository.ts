import { Organizer } from '../models/organizer.model';

export interface CertificateGenerationItem {
  identifier: string;
  fullName?: string;
  role?: string;
  area?: string;
  team?: string;
  templateType?: 'organizer' | 'volunteer' | 'area_director' | 'participant';
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
  updateTemplateType(identifier: string, value: 'organizer' | 'volunteer'): Promise<void>;
  updateSendCertificate(identifier: string, value: boolean): Promise<void>;
  updateBulkSendCertificate(identifiers: string[], value: boolean): Promise<number>;
  regenerateCertificate(identifier: string): Promise<void>;
  generateCertificates(items: CertificateGenerationItem[]): Promise<GenerateCertificatesResponse>;
}

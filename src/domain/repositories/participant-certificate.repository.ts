import { ParticipantCertificate } from '../models/participant-certificate.model';
import { CertificateGenerationItem, GenerateCertificatesResponse } from './organizer.repository';

export interface ParticipantCertificateRepository {
  getParticipantCertificates(): Promise<ParticipantCertificate[]>;
  updateSendCertificate(identifier: string, value: boolean): Promise<void>;
  updateBulkSendCertificate(identifiers: string[], value: boolean): Promise<number>;
  regenerateCertificate(identifier: string): Promise<void>;
  generateCertificates(items: CertificateGenerationItem[]): Promise<GenerateCertificatesResponse>;
}

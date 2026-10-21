import { ParticipantCertificate } from '../../domain/models/participant-certificate.model';
import { ParticipantCertificateRepository } from '../../domain/repositories/participant-certificate.repository';
import { appsScriptParticipantCertificateRepository } from '../../infrastructure/repositories/apps-script-participant-certificate.repository';

export class GetParticipantCertificatesUseCase {
  constructor(
    private readonly repository: ParticipantCertificateRepository = appsScriptParticipantCertificateRepository
  ) {}

  execute(): Promise<ParticipantCertificate[]> {
    return this.repository.getParticipantCertificates();
  }
}

export const getParticipantCertificatesUseCase = new GetParticipantCertificatesUseCase();

import { ParticipantFetchResult } from '../../domain/models/participant.model';
import { ParticipantRepository } from '../../domain/repositories/participant.repository';
import { participantRepository } from '../../infrastructure/repositories/google-sheets-participant.repository';

export class GetParticipantsUseCase {
  constructor(private repo: ParticipantRepository = participantRepository) {}

  async execute(forceRefresh = false): Promise<ParticipantFetchResult> {
    return this.repo.fetchParticipants(forceRefresh);
  }

  getCached() {
    return this.repo.getCachedParticipants();
  }

  getLastStatus() {
    return this.repo.getLastStatus();
  }

  clearCache(): void {
    this.repo.clearCache();
  }
}

export const getParticipantsUseCase = new GetParticipantsUseCase();

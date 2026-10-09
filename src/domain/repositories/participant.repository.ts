import { Participant, ParticipantFetchResult, SyncStatus } from '../models/participant.model';

export interface ParticipantRepository {
  fetchParticipants(forceRefresh?: boolean): Promise<ParticipantFetchResult>;
  getCachedParticipants(): Participant[] | null;
  getLastStatus(): SyncStatus;
  clearCache(): void;
}

import { useCallback, useEffect, useState } from 'react';
import { Participant, SyncStatus } from '../../domain/models/participant.model';
import { getParticipantsUseCase } from '../use-cases/get-participants.use-case';

export function useParticipants(autoLoad = true) {
  const [participants, setParticipants] = useState<Participant[]>(() => {
    return getParticipantsUseCase.getCached() || [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<SyncStatus>(() => getParticipantsUseCase.getLastStatus());
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getParticipantsUseCase.execute(forceRefresh);
      setStatus(result.status);
      if (result.success && result.data) {
        setParticipants(result.data);
      } else {
        setError(result.message || 'Error al conectar');
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return {
        success: false,
        error: 'FETCH_ERROR',
        message: msg,
        status: getParticipantsUseCase.getLastStatus(),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && status.state === 'idle') {
      fetchParticipants(false);
    }
  }, [autoLoad, fetchParticipants, status.state]);

  return {
    participants,
    loading,
    status,
    error,
    refresh: () => fetchParticipants(true),
  };
}

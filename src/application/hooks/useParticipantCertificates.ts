import { useEffect, useState, useCallback } from 'react';
import { ParticipantCertificate } from '../../domain/models/participant-certificate.model';
import { getParticipantCertificatesUseCase } from '../use-cases/get-participant-certificates.use-case';

export function useParticipantCertificates() {
  const [participants, setParticipants] = useState<ParticipantCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(() => {
    setLoading(true);
    setError(null);
    getParticipantCertificatesUseCase
      .execute()
      .then(setParticipants)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los participantes.')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return { participants, loading, error, refetch: fetchParticipants };
}

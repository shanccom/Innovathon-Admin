import { useEffect, useState, useCallback } from 'react';
import { Organizer } from '../../domain/models/organizer.model';
import { getOrganizersUseCase } from '../use-cases/get-organizers.use-case';

export function useOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizers = useCallback(() => {
    setLoading(true);
    setError(null);
    getOrganizersUseCase.execute()
      .then(setOrganizers)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los organizadores.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  return { organizers, loading, error, refetch: fetchOrganizers };
}

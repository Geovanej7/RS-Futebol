import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Atleta, Avaliacao } from '@/entities/athlete';

export function useAthletes() {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: () => apiClient.get<Atleta[]>('/api/athletes'),
    staleTime: 60_000,
  });
}

export function useAthlete(id: string | null) {
  return useQuery({
    queryKey: ['athletes', id],
    queryFn: () => apiClient.get<Atleta>(`/api/athletes/${id}`),
    enabled: !!id,
  });
}

export function useEvaluations() {
  return useQuery({
    queryKey: ['evaluations'],
    queryFn: () => apiClient.get<Avaliacao[]>('/api/evaluations'),
    staleTime: 60_000,
  });
}

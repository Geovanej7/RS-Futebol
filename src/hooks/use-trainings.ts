import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SessaoTreino } from '@/entities/athlete';

export function useTrainings() {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: () => apiClient.get<SessaoTreino[]>('/api/trainings'),
    staleTime: 60_000,
  });
}

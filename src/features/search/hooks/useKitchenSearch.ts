import { useQuery } from '@tanstack/react-query';
import { kitchensApi } from '@api';

const KITCHEN_LIMIT = 10;

/**
 * Text search over kitchens (backend `GET /kitchens?q=` matches name and
 * tagline, case-insensitive). Disabled until the query is long enough.
 */
export function useKitchenSearch(q: string, enabled: boolean) {
  return useQuery({
    queryKey: ['search', 'kitchens', q],
    queryFn: () => kitchensApi.list({ q, limit: KITCHEN_LIMIT, sortBy: 'recommended' }),
    enabled: enabled && q.length > 1,
    staleTime: 60_000,
    select: (page) => page.items,
  });
}

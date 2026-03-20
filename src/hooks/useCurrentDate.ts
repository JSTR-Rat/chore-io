import { useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { parseDateParam } from '@/utils/date';

/**
 * Returns the current date for display/calculations.
 * If the URL has a valid `date` query param (yyyy-mm-dd), uses that.
 * Otherwise returns the real current date.
 */
export function useCurrentDate(): Date {
  const search = useSearch({ strict: false }) as { date?: string } | undefined;
  return useMemo(() => {
    const parsed = parseDateParam(search?.date);
    return parsed ?? new Date();
  }, [search?.date]);
}

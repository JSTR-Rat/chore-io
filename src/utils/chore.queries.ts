import { getChore, getChoreHistory } from './chore.functions';
import { queryOptions } from '@tanstack/react-query';

export const getChoreOptions = (choreId: number) =>
  queryOptions({
    queryKey: ['chore', choreId],
    queryFn: async () => await getChore({ data: { choreId } }),
  });

export const getChoreHistoryOptions = (choreId: number) =>
  queryOptions({
    queryKey: ['chore-history', choreId],
    queryFn: async () => await getChoreHistory({ data: { choreId } }),
  });

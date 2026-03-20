import { queryOptions } from '@tanstack/react-query';
import {
  getAttachedChoreIds,
  getAttachedChores,
  getRoomDetails,
} from './room.functions';

export const getRoomDetailsOptions = (roomId: number) =>
  queryOptions({
    queryKey: ['room-details', roomId],
    queryFn: async () => await getRoomDetails({ data: { roomId } }),
  });

export const getAttachedChoresOptions = (roomId: number, currentDate: Date) =>
  queryOptions({
    queryKey: ['room-chores', roomId, currentDate],
    queryFn: async () =>
      await getAttachedChores({ data: { roomId, currentDate } }),
  });

export const getAttachedChoreIdsOptions = (roomId: number) =>
  queryOptions({
    queryKey: ['room-chore-ids', roomId],
    queryFn: async () => await getAttachedChoreIds({ data: { roomId } }),
  });

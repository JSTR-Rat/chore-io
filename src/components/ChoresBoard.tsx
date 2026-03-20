import { getAttachedChoreIdsOptions } from '@/utils/room.queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRoom } from '@/contexts/room/useRoom';
import { ChoreItem } from './chore-item';

interface ChoresBoardProps {
  currentDate: Date;
}

export function ChoresBoard({ currentDate }: ChoresBoardProps) {
  const { roomId } = useRoom();

  const {
    data: choreIds,
    isLoading: isLoadingChores,
    isError: isErrorChores,
    error: errorChores,
  } = useSuspenseQuery(getAttachedChoreIdsOptions(roomId));

  if (isLoadingChores) {
    return <div>Loading...</div>;
  }
  if (isErrorChores) {
    return <div>Error: {errorChores.message}</div>;
  }

  if (choreIds.length === 0) {
    return (
      <p className="py-8 text-center text-text-muted">
        No chores yet. Click "Add New Chore" to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {choreIds.map((choreId) => {
        return <ChoreItem key={choreId} choreId={choreId} />;
      })}
    </div>
  );
}

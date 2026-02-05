import { ChoresBoard } from '@/components/ChoresBoard';
import { DebugDateControls } from '@/components/DebugDateControls';
import { useCurrentDate, useDebugDate } from '@/contexts/DebugDateContext';
import {
  clearChoreHistory,
  deleteChore,
  markChoreDone,
} from '@/utils/chore.functions';
import { loadRoom } from '@/utils/room.functions';
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useState } from 'react';
import z from 'zod';

const RoomParamsSchema = z.object({
  propertyId: z.coerce.number(),
  roomId: z.coerce.number(),
});

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId/',
)({
  params: RoomParamsSchema,
  loader: async ({ params }) => {
    return await loadRoom({ data: { roomId: params.roomId } });
  },
  component: RoomComponent,
});

function RoomComponent() {
  const { room, chores } = Route.useLoaderData();
  const { propertyId } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();

  const [choreToDelete, setChoreToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Get the current date (either debug date for admins or real date)
  const currentDate = useCurrentDate();
  const { isEnabled: isDebugDateEnabled, formatDate } = useDebugDate();

  // Check if we're using a debug date (not today)
  const isUsingDebugDate =
    isDebugDateEnabled &&
    currentDate.toDateString() !== new Date().toDateString();

  const handleChoreClick = (choreId: number) => {
    const chore = chores.find((c) => c.id === choreId);
    if (chore) {
      // setSelectedChore(chore);
      // setIsModalOpen(true);
      navigate({
        to: '/dashboard/$propertyId/room/$roomId/edit/$choreId',
        params: { propertyId, roomId: room.id, choreId: chore.id },
      });
    }
  };

  const handleDeleteClick = (choreId: number) => {
    const chore = chores.find((c) => c.id === choreId);
    if (chore) {
      setChoreToDelete({ id: choreId, name: chore.name });
    }
  };

  const handleDelete = async (choreId: number) => {
    const deleteResult = await deleteChore({ data: { choreId } });
    if (!deleteResult.success) {
      console.error('Failed to delete chore:', deleteResult.error);
      return;
    }
    setChoreToDelete(null);
    router.invalidate();
  };

  const handleMarkDone = async (choreId: number) => {
    // Use the current date, which could be the debug date for admins
    const markResult = await markChoreDone({
      data: {
        choreId,
        completedAt: currentDate,
      },
    });
    if (!markResult.success) {
      console.error('Failed to mark chore as done:', markResult.error);
      return;
    }
    router.invalidate();
  };

  const handleClearHistory = async (choreId: number) => {
    const clearResult = await clearChoreHistory({ data: { choreId } });
    if (!clearResult.success) {
      console.error('Failed to clear chore history:', clearResult.error);
      return;
    }
    router.invalidate();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Chores Section */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/dashboard/$propertyId"
            params={{ propertyId }}
            className="shrink rounded-lg border border-border-strong px-4 py-2 text-text-muted transition-colors hover:border-border-hover hover:text-text"
          >
            Back
          </Link>
          <h2 className="grow text-center text-2xl font-bold text-text">
            {room.name}
          </h2>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-text">Chores</h3>
          <Link
            to="/dashboard/$propertyId/room/$roomId/new"
            params={{ propertyId, roomId: room.id }}
            className="rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-2 text-text shadow-lg transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover"
          >
            Add New Chore
          </Link>
        </div>

        {/* Admin-only: Debug Date Controls */}
        <DebugDateControls />

        {chores.length === 0 ? (
          <p className="py-8 text-center text-text-muted">
            No chores yet. Click "Add New Chore" to get started.
          </p>
        ) : (
          <div className="space-y-2">
            <ChoresBoard
              chores={chores.map((c) => ({
                ...c,
                lastCompletedDate: c.lastCompletedDate
                  ? new Date(c.lastCompletedDate)
                  : null,
              }))}
              onChoreClick={handleChoreClick}
              onDeleteClick={handleDeleteClick}
              currentDate={currentDate}
            />

            {/* Mark as Done buttons */}
            <div className="mt-4 space-y-2">
              {isUsingDebugDate && (
                <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2 text-center text-xs text-yellow-500">
                  ⚠️ Using debug date: {formatDate(currentDate)} - Chores will
                  be marked as done on this date
                </div>
              )}
              {chores.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border-t border-border py-2"
                >
                  <span className="text-text">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkDone(c.id)}
                      className="rounded border border-green-500 bg-green-500/10 px-3 py-1 text-sm text-green-500 transition-colors hover:bg-green-500/20"
                      title={`Mark as done on ${currentDate.toLocaleDateString()}`}
                    >
                      Mark as Done
                    </button>
                    {isUsingDebugDate && (
                      <button
                        onClick={() => handleClearHistory(c.id)}
                        className="rounded border border-red-500 bg-red-500/10 px-3 py-1 text-sm text-red-500 transition-colors hover:bg-red-500/20"
                        title="Clear all history for this chore (admin debug)"
                      >
                        Clear History
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <DeleteChoreDialog
        choreToDelete={choreToDelete}
        onClose={() => setChoreToDelete(null)}
        onDelete={handleDelete}
      />
    </>
  );
}

function DeleteChoreDialog({
  choreToDelete,
  onClose,
  onDelete,
}: {
  choreToDelete: { id: number; name: string } | null;
  onClose: () => void;
  onDelete: (choreId: number) => void;
}) {
  return (
    <Dialog
      open={choreToDelete !== null}
      onClose={onClose}
      className="relative z-50"
    >
      <div
        onClick={() => onClose()}
        className="fixed inset-0 z-50 flex w-screen items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <DialogPanel className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-12">
          <DialogTitle className="text-2xl font-bold text-text">
            Delete "{choreToDelete?.name}"
          </DialogTitle>
          <Description className="text-text-muted">
            This will permanently delete the chore. This action cannot be
            undone.
          </Description>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => onClose()}
              className="rounded-lg border border-border-strong bg-surface-elevated px-4 py-2 font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(choreToDelete?.id!)}
              className="rounded-lg bg-error px-4 py-2 font-semibold text-text shadow-lg transition-all hover:bg-error hover:shadow-xl"
            >
              Delete
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

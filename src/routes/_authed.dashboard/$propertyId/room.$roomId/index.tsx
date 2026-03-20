import { ChoresBoard } from '@/components/ChoresBoard';
import { DebugDateControls } from '@/components/DebugDateControls';
import {
  getAttachedChoreIdsOptions,
  getRoomDetailsOptions,
} from '@/utils/room.queries';
import { parseDateParam } from '@/utils/date';
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  createFileRoute,
  Link,
  useSearch,
  useLoaderData,
} from '@tanstack/react-router';
import { Suspense } from 'react';
import z from 'zod';

const RoomParamsSchema = z.object({
  propertyId: z.coerce.number(),
  roomId: z.coerce.number(),
});

const roomIndexSearchSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId/',
)({
  params: RoomParamsSchema,
  validateSearch: roomIndexSearchSchema,
  loaderDeps: ({ search: { date } }) => ({ date }),
  loader: async ({ params, deps, context: { queryClient } }) => {
    const currentDate = parseDateParam(deps.date) ?? new Date();
    console.log('ROOM LOADER: currentDate', currentDate);
    const room = await queryClient.ensureQueryData(
      getRoomDetailsOptions(params.roomId),
    );
    await queryClient.ensureQueryData(
      getAttachedChoreIdsOptions(params.roomId),
    );
    return { room, currentDate };
  },
  component: RoomComponent,
});

function RoomComponent() {
  const { room, currentDate } = Route.useLoaderData();
  const { propertyId } = Route.useParams();

  // Get the current date (from date query param or real date)
  const search = useSearch({ from: '/_authed/dashboard' }) as {
    date?: string;
  };
  const isAdmin = useLoaderData({ from: '/_authed/dashboard' }).isAdmin;

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

        <Suspense>
          <ChoresBoard currentDate={currentDate} />
        </Suspense>
      </div>
    </>
  );
}

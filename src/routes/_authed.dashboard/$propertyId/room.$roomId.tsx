import { parseDateParam } from '@/utils/date';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import z from 'zod';
import { RoomProvider } from '@/contexts/room/provider';

const RoomParamsSchema = z.object({
  propertyId: z.coerce.number(),
  roomId: z.coerce.number(),
});

const roomSearchSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId',
)({
  validateSearch: roomSearchSchema,
  loaderDeps: ({ search: { date } }) => ({ date }),
  loader: async ({ params, deps, context: { queryClient } }) => {
    const currentDate = parseDateParam(deps.date) ?? new Date();
    console.log('ROOM LOADER: currentDate', currentDate);
    // queryClient.ensureQueryData(getAttachedChoreIdsOptions(params.roomId));
  },
  params: RoomParamsSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();
  return (
    <RoomProvider roomId={roomId}>
      <Outlet />
    </RoomProvider>
  );
}

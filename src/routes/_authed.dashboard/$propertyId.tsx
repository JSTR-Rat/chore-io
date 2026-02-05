import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getDB } from '@/db/client';
import { property, room, chore, choreHistory } from '@/db/schema/app';
import { eq, desc, sql } from 'drizzle-orm';
import type { Point } from '@/types/floorplan';
import z from 'zod';

// Server function to load property and floor plan data
const loadPropertyFloorplan = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ propertyId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDB();

    // Fetch property data
    const [propertyData] = await db
      .select({
        id: property.id,
        name: property.name,
        aspectRatio: property.aspectRatio,
        createdAt: property.createdAt,
      })
      .from(property)
      .where(eq(property.id, data.propertyId));

    if (!propertyData) {
      throw new Error('Property not found');
    }

    // Fetch all rooms for this property
    const rooms = await db
      .select({
        id: room.id,
        name: room.name,
        points: room.points,
      })
      .from(room)
      .where(eq(room.propertyId, data.propertyId));

    // Fetch all chores with their most recent completion date
    const choresWithHistory = await db
      .select({
        choreId: chore.id,
        roomId: chore.roomId,
        frequency: chore.frequency,
        frequencyUnit: chore.frequencyUnit,
        lastCompletedAt: sql<number | null>`
          (SELECT MAX(completed_at) 
           FROM chore_history 
           WHERE chore_history.chore_id = chore.id)
        `,
      })
      .from(chore)
      .innerJoin(room, eq(chore.roomId, room.id))
      .where(eq(room.propertyId, data.propertyId));

    return {
      property: propertyData,
      rooms: rooms.map((r) => ({
        id: String(r.id),
        name: r.name,
        points: (r.points as Point[] | null) || [],
      })),
      chores: choresWithHistory.map((c) => ({
        choreId: c.choreId,
        roomId: c.roomId,
        frequency: c.frequency,
        frequencyUnit: c.frequencyUnit,
        lastCompletedAt: c.lastCompletedAt,
      })),
    };
  });

const PropertyParamsSchema = z.object({
  propertyId: z.coerce.number(),
});
type PropertyParams = z.infer<typeof PropertyParamsSchema>;

export const Route = createFileRoute('/_authed/dashboard/$propertyId')({
  params: PropertyParamsSchema,
  loader: async ({ params }) => {
    return await loadPropertyFloorplan({
      data: { propertyId: params.propertyId },
    });
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
});

function LoadingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading property...</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end p-6">
      <div className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-text">
          Error Loading Property
        </h2>
        <p className="mb-6 text-text-muted">{error.message}</p>
        <Link
          to="/dashboard"
          className="inline-block rounded bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function RouteComponent() {
  const data = Route.useLoaderData();
  const { propertyId } = Route.useParams();

  return <Outlet />;
}

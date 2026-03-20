import { chore, property, room, userToProperty } from '@/db/schema';

import { getDB } from '@/db';
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { and, eq, sql } from 'drizzle-orm';
import z from 'zod';
import { Point } from '@/types/floorplan';

export const userHasAccessToProperty = createServerOnlyFn(
  async (userId: string, propertyId: number) => {
    const db = getDB();
    const [userToPropertyRow] = await db
      .select()
      .from(userToProperty)
      .where(
        and(
          eq(userToProperty.userId, userId),
          eq(userToProperty.propertyId, propertyId),
        ),
      );
    return !!userToPropertyRow;
  },
);

// Server function to load property and floor plan data
export const loadPropertyFloorplan = createServerFn({ method: 'GET' })
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

export const getFloorplanOptions = (propertyId: number) => ({
  queryKey: ['property', propertyId, 'floorplan'],
  queryFn: async () => await loadPropertyFloorplan({ data: { propertyId } }),
});

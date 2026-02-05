import { chore, choreHistory, getDB, room } from '@/db';
import { Point } from '@/types/floorplan';
import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import { getSessionData } from './auth.functions';
import { createServerOnlyFn } from '@tanstack/react-start';
import { userHasAccessToProperty } from './property.functions';
import { z } from 'zod';

export const userHasAccessToRoom = createServerOnlyFn(
  async (userId: string, roomId: number) => {
    const db = getDB();
    const [roomRow] = await db
      .select({ propertyId: room.propertyId })
      .from(room)
      .where(eq(room.id, roomId));
    if (!roomRow) {
      throw new Error('Room not found');
    }
    return await userHasAccessToProperty(userId, roomRow.propertyId);
  },
);

// Server function to load room data and chores
export const loadRoom = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ roomId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDB();

    const [roomData] = await db
      .select({
        id: room.id,
        name: room.name,
        points: room.points,
        propertyId: room.propertyId,
      })
      .from(room)
      .where(eq(room.id, data.roomId));

    if (!roomData) {
      throw new Error('Room not found');
    }

    // Load chores for this room
    const chores = await db
      .select({
        id: chore.id,
        name: chore.name,
        frequency: chore.frequency,
        frequencyUnit: chore.frequencyUnit,
      })
      .from(chore)
      .where(eq(chore.roomId, data.roomId));

    // For each chore, get the most recent completion from history
    const choresWithHistory = await Promise.all(
      chores.map(async (c) => {
        const [lastCompletion] = await db
          .select({
            completedAt: choreHistory.completedAt,
          })
          .from(choreHistory)
          .where(eq(choreHistory.choreId, c.id))
          .orderBy(desc(choreHistory.completedAt))
          .limit(1);

        return {
          id: c.id,
          name: c.name,
          frequency: c.frequency,
          frequencyUnit: c.frequencyUnit as 'days' | 'weeks' | 'months',
          lastCompletedDate: lastCompletion?.completedAt || null,
        };
      }),
    );

    return {
      room: {
        id: roomData.id,
        name: roomData.name,
        points: (roomData.points as Point[] | null) || [],
        propertyId: roomData.propertyId,
      },
      chores: choresWithHistory,
    };
  });

export const getRoomDetails = createServerFn({ method: 'GET' })
  .inputValidator((data: { roomId: number }) => data)
  .handler(async ({ data: { roomId } }) => {
    const db = getDB();
    const session = await getSessionData();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }
    if (!(await userHasAccessToRoom(session.user.id, roomId))) {
      throw new Error('You do not have access to this room');
    }

    const [roomData] = await db
      .select({
        id: room.id,
        name: room.name,
        points: room.points,
        propertyId: room.propertyId,
      })
      .from(room)
      .where(eq(room.id, roomId));

    if (!roomData) {
      throw new Error('Room not found');
    }

    return {
      id: roomData.id,
      name: roomData.name,
      points: (roomData.points as Point[] | null) || [],
      propertyId: roomData.propertyId,
    };
  });

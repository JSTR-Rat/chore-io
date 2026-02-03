import { chore, choreHistory, getDB, room } from '@/db';
import { Point } from '@/types/floorplan';
import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';

// Server function to load room data and chores
export const loadRoom = createServerFn({ method: 'GET' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: roomId }) => {
    const db = getDB();

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

    // Load chores for this room
    const chores = await db
      .select({
        id: chore.id,
        name: chore.name,
        frequency: chore.frequency,
        frequencyUnit: chore.frequencyUnit,
      })
      .from(chore)
      .where(eq(chore.roomId, roomId));

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
          id: String(c.id),
          name: c.name,
          frequency: c.frequency,
          frequencyUnit: c.frequencyUnit as 'days' | 'weeks' | 'months',
          lastCompletedDate: lastCompletion?.completedAt || null,
        };
      }),
    );

    return {
      room: {
        id: String(roomData.id),
        name: roomData.name,
        points: (roomData.points as Point[] | null) || [],
        propertyId: roomData.propertyId,
      },
      chores: choresWithHistory,
    };
  });

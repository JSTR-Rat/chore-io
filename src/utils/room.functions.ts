import { chore, choreHistory, getDB, room } from '@/db';
import { Point } from '@/types/floorplan';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, lte } from 'drizzle-orm';
import { getSessionData } from './auth.functions';
import { createServerOnlyFn } from '@tanstack/react-start';
import { userHasAccessToProperty } from './property.functions';
import { z } from 'zod';
import { Chore } from '@/contexts/chores/types';
import { getTimezoneAgnosticDate } from './date';
import { authMiddleware } from './auth.middleware';

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

export const getRoomDetails = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ roomId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDB();
    const session = await getSessionData();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }
    if (!(await userHasAccessToRoom(session.user.id, data.roomId))) {
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
      .where(eq(room.id, data.roomId));

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

export const getAttachedChoreIds = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ roomId: z.number() }))
  .handler(async ({ data, context: { user } }) => {
    if (!(await userHasAccessToRoom(user.id, data.roomId))) {
      throw new Error('You do not have access to this room');
    }
    const db = getDB();
    const choreIdRows = await db
      .select({ id: chore.id })
      .from(chore)
      .where(eq(chore.roomId, data.roomId));
    const choreIds = choreIdRows.map((c) => c.id);
    return choreIds;
  });

export const getAttachedChores = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ roomId: z.number(), currentDate: z.date() }))
  .handler(async ({ data }) => {
    const session = await getSessionData();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }
    if (!(await userHasAccessToRoom(session.user.id, data.roomId))) {
      throw new Error('You do not have access to this room');
    }

    const db = getDB();

    const endOfDay = getTimezoneAgnosticDate(data.currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Load chores for this room
    const chores = await db
      .select({
        id: chore.id,
        name: chore.name,
        roomId: chore.roomId,
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
          .where(
            and(
              eq(choreHistory.choreId, c.id),
              lte(choreHistory.completedAt, endOfDay),
            ),
          )
          .orderBy(desc(choreHistory.completedAt))
          .limit(1);
        const chore: Chore = {
          id: c.id,
          name: c.name,
          roomId: c.roomId,
          frequency: c.frequency,
          frequencyUnit: c.frequencyUnit as 'days' | 'weeks' | 'months',
          lastCompletedDate: lastCompletion?.completedAt || null,
          isMarkingDone: false,
        };

        return chore;
      }),
    );

    return choresWithHistory;
  });

// Server function to load room data and chores
export const loadRoom = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ roomId: z.number(), currentDate: z.date() }))
  .handler(async ({ data }) => {
    const db = getDB();

    const endOfDay = new Date(
      Date.UTC(
        data.currentDate.getFullYear(),
        data.currentDate.getMonth(),
        data.currentDate.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

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
        roomId: chore.roomId,
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
          .where(
            and(
              eq(choreHistory.choreId, c.id),
              lte(choreHistory.completedAt, endOfDay),
            ),
          )
          .orderBy(desc(choreHistory.completedAt))
          .limit(1);
        const chore: Chore = {
          id: c.id,
          name: c.name,
          roomId: c.roomId,
          frequency: c.frequency,
          frequencyUnit: c.frequencyUnit as 'days' | 'weeks' | 'months',
          lastCompletedDate: lastCompletion?.completedAt || null,
          isMarkingDone: false,
        };

        return chore;
      }),
    );

    console.log(choresWithHistory);

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

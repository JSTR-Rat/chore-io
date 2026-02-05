import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { getSessionData } from './auth.functions';
import {
  chore,
  choreHistory,
  getDB,
  property,
  room,
  user,
  userToProperty,
} from '@/db';
import { and, eq } from 'drizzle-orm';
import { userHasAccessToRoom } from './room.functions';
import z from 'zod';

const userHasAccessToChore = createServerOnlyFn(
  async (userId: string, choreId: number) => {
    const db = getDB();
    const [choreRow] = await db
      .select({ roomId: chore.roomId })
      .from(chore)
      .where(eq(chore.id, choreId));
    if (!choreRow) {
      throw new Error('Chore not found');
    }
    return await userHasAccessToRoom(userId, choreRow.roomId);
  },
);

export const getChore = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      propertyId: z.number(),
      roomId: z.number(),
      choreId: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    const session = await getSessionData();
    const userId = session?.user.id;
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      /**
       * 1. Check user → property access
       *    Failure here is UNAUTHORIZED
       */
      const propertyAccess = await db
        .select({ propertyId: property.id })
        .from(userToProperty)
        .innerJoin(property, eq(property.id, userToProperty.propertyId))
        .where(
          and(
            eq(userToProperty.userId, userId),
            eq(property.id, data.propertyId),
          ),
        )
        .limit(1);

      if (!propertyAccess.length) {
        return {
          success: false,
          error: 'You do not have access to this property.',
        };
      }

      /**
       * 2. Check room belongs to property
       *    Failure here is NOT FOUND
       */
      const roomResult = await db
        .select({ roomId: room.id })
        .from(room)
        .where(
          and(eq(room.id, data.roomId), eq(room.propertyId, data.propertyId)),
        )
        .limit(1);

      if (!roomResult.length) {
        return { success: false, error: 'Room not found.' };
      }

      /**
       * 3. Check chore belongs to room
       *    Failure here is NOT FOUND
       */
      const choreResult = await db
        .select({
          choreId: chore.id,
          name: chore.name,
          frequency: chore.frequency,
          frequencyUnit: chore.frequencyUnit,
        })
        .from(chore)
        .where(and(eq(chore.id, data.choreId), eq(chore.roomId, data.roomId)))
        .limit(1);

      if (!choreResult.length) {
        return { success: false, error: 'Chore not found.' };
      }

      return { success: true, chore: choreResult[0] };
    } catch (error) {
      console.error('Failed to get chore:', error);
      return { success: false, error: 'Failed to get chore.' };
    }
  });

// Server function to create a chore
export const createChore = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      roomId: z.number(),
      name: z.string(),
      frequency: z.number(),
      frequencyUnit: z.enum(['days', 'weeks', 'months']),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    const session = await getSessionData();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    if (!(await userHasAccessToRoom(session.user.id, data.roomId))) {
      return { success: false, error: 'You do not have access to this room.' };
    }

    const insertResult = await db.insert(chore).values({
      roomId: data.roomId,
      name: data.name,
      frequency: data.frequency,
      frequencyUnit: data.frequencyUnit,
    });
    if (!insertResult.success) {
      console.error('Failed to create chore:', insertResult.error);
      return { success: false, error: 'Failed to create chore.' };
    }
    return { success: true };
  });

// Server function to update a chore
export const updateChore = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      choreId: z.number(),
      name: z.string(),
      frequency: z.number(),
      frequencyUnit: z.enum(['days', 'weeks', 'months']),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    const session = await getSessionData();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    if (!(await userHasAccessToChore(session.user.id, data.choreId))) {
      return { success: false, error: 'You do not have access to this chore.' };
    }
    const updateResult = await db
      .update(chore)
      .set({
        name: data.name,
        frequency: data.frequency,
        frequencyUnit: data.frequencyUnit,
        updatedAt: new Date(),
      })
      .where(eq(chore.id, data.choreId));
    if (!updateResult.success) {
      console.error('Failed to update chore:', updateResult.error);
      return { success: false, error: 'Failed to update chore.' };
    }
    return { success: true };
  });

// Server function to delete a chore
export const deleteChore = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ choreId: z.number() }))
  .handler(async ({ data }) => {
    const db = getDB();
    const session = await getSessionData();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    if (!(await userHasAccessToChore(session.user.id, data.choreId))) {
      return { success: false, error: 'You do not have access to this chore.' };
    }
    const deleteResult = await db
      .delete(chore)
      .where(eq(chore.id, data.choreId));
    if (!deleteResult.success) {
      console.error('Failed to delete chore:', deleteResult.error);
      return { success: false, error: 'Failed to delete chore.' };
    }
    return { success: true };
  });

// Server function to mark a chore as done
export const markChoreDone = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ choreId: z.number(), completedAt: z.date() }))
  .handler(async ({ data }) => {
    const session = await getSessionData();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    if (!(await userHasAccessToChore(session.user.id, data.choreId))) {
      return { success: false, error: 'You do not have access to this chore.' };
    }

    const db = getDB();

    // Insert a new completion record in choreHistory
    // Use the provided completedAt date (which could be a debug date for admins)
    const insertResult = await db.insert(choreHistory).values({
      choreId: data.choreId,
      userId: session.user.id,
      completedAt: data.completedAt,
    });
    if (!insertResult.success) {
      console.error('Failed to mark chore as done:', insertResult.error);
      return { success: false, error: 'Failed to mark chore as done.' };
    }

    return { success: true };
  });

// Server function to clear chore history (admin/debug only)
export const clearChoreHistory = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ choreId: z.number() }))
  .handler(async ({ data }) => {
    const session = await getSessionData();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    if (session.user.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }

    const db = getDB();

    // Delete all history records for this chore
    const deleteResult = await db
      .delete(choreHistory)
      .where(eq(choreHistory.choreId, data.choreId));
    if (!deleteResult.success) {
      console.error('Failed to clear chore history:', deleteResult.error);
      return { success: false, error: 'Failed to clear chore history.' };
    }

    return { success: true };
  });

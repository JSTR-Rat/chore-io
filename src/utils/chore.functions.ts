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
import { and, asc, between, desc, eq, lte } from 'drizzle-orm';
import { userHasAccessToRoom } from './room.functions';
import z from 'zod';
import { Chore } from '@/contexts/chores/types';
import { authMiddleware } from './auth.middleware';

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
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      choreId: z.number(),
    }),
  )
  .handler(async ({ data, context: { user } }) => {
    if (!(await userHasAccessToChore(user.id, data.choreId))) {
      throw new Error('You do not have access to this chore.');
    }
    const db = getDB();

    const [record] = await db
      .select({
        id: chore.id,
        name: chore.name,
        roomId: chore.roomId,
        frequency: chore.frequency,
        frequencyUnit: chore.frequencyUnit,
      })
      .from(chore)
      .where(eq(chore.id, data.choreId))
      .limit(1);

    if (!record) {
      throw new Error('Chore not found.');
    }

    const c: Chore = {
      id: record.id,
      name: record.name,
      roomId: record.roomId,
      frequency: record.frequency,
      frequencyUnit: record.frequencyUnit as 'days' | 'weeks' | 'months',
      lastCompletedDate: null,
      isMarkingDone: false,
    };

    return c;
  });

export const getChoreHistory = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ choreId: z.number() }))
  .handler(async ({ data, context: { user } }) => {
    if (!(await userHasAccessToChore(user.id, data.choreId))) {
      throw new Error('You do not have access to this chore.');
    }
    const db = getDB();
    const historyRows = await db
      .select({ completedAt: choreHistory.completedAt })
      .from(choreHistory)
      .where(eq(choreHistory.choreId, data.choreId))
      .orderBy(asc(choreHistory.completedAt));

    const history = historyRows.map((h) => h.completedAt);
    return history;
  });

export const getChoreWithHistory = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      choreId: z.number(),
      currentDate: z.date(),
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

    const [record] = await db
      .select({
        id: chore.id,
        name: chore.name,
        roomId: chore.roomId,
        frequency: chore.frequency,
        frequencyUnit: chore.frequencyUnit,
      })
      .from(chore)
      .where(eq(chore.id, data.choreId))
      .limit(1);

    if (!record) {
      return { success: false, error: 'Chore not found.' };
    }

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

    const [lastCompletion] = await db
      .select({
        completedAt: choreHistory.completedAt,
      })
      .from(choreHistory)
      .where(
        and(
          eq(choreHistory.choreId, record.id),
          lte(choreHistory.completedAt, endOfDay),
        ),
      )
      .orderBy(desc(choreHistory.completedAt))
      .limit(1);

    const choreWithHistory: Chore = {
      id: record.id,
      name: record.name,
      roomId: record.roomId,
      frequency: record.frequency,
      frequencyUnit: record.frequencyUnit as 'days' | 'weeks' | 'months',
      lastCompletedDate: lastCompletion?.completedAt || null,
      isMarkingDone: false,
    };

    return { success: true, chore: choreWithHistory };
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

    const newDateMS = Date.UTC(
      data.completedAt.getFullYear(),
      data.completedAt.getMonth(),
      data.completedAt.getDate(),
    );

    const startOfDay = new Date(newDateMS);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(newDateMS);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('--------------------------------');
    console.log('markChoreDone');
    console.log('startOfDay', startOfDay);
    console.log('endOfDay', endOfDay);
    console.log('data.completedAt', data.completedAt);
    console.log('data.choreId', data.choreId);

    // console.log('startOfDay', startOfDay);
    // console.log('endOfDay', endOfDay);
    // console.log('dateString', dateString);
    // console.log('data.completedAt', data.completedAt);
    // console.log('data.choreId', data.choreId);

    // Find the matching choreHistory record for this chore, and completedAt date
    const [record] = await db
      .select()
      .from(choreHistory)
      .where(
        and(
          eq(choreHistory.choreId, data.choreId),
          between(choreHistory.completedAt, startOfDay, endOfDay),
        ),
      )
      .limit(1);

    if (record) {
      return {
        success: false,
        error: 'Chore already marked as done for this date.',
      };
    }

    // Insert a new completion record in choreHistory
    // Use the provided completedAt date (which could be a debug date for admins)
    const insertResult = await db.insert(choreHistory).values({
      choreId: data.choreId,
      userId: session.user.id,
      completedAt: startOfDay,
    });
    if (!insertResult.success) {
      console.error('Failed to mark chore as done:', insertResult.error);
      return { success: false, error: 'Failed to mark chore as done.' };
    }

    return { success: true };
  });

// Server function to unmark a chore as done (remove matching completion entry for this user & chore)
// Accepts completedAtDate to identify the specific record to delete
export const unmarkChoreDone = createServerFn({ method: 'POST' })
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

    const newDateMS = Date.UTC(
      data.completedAt.getFullYear(),
      data.completedAt.getMonth(),
      data.completedAt.getDate(),
    );

    const startOfDay = new Date(newDateMS);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(newDateMS);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('--------------------------------');
    console.log('unmarkChoreDone');
    console.log('startOfDay', startOfDay);
    console.log('endOfDay', endOfDay);
    console.log('data.completedAt', data.completedAt);
    console.log('data.choreId', data.choreId);

    // Find the matching choreHistory record for this user, chore, and completedAt date
    const [record] = await db
      .select()
      .from(choreHistory)
      .where(
        and(
          eq(choreHistory.choreId, data.choreId),
          between(choreHistory.completedAt, startOfDay, endOfDay),
        ),
      )
      .limit(1);

    if (!record) {
      return {
        success: false,
        error: 'No matching completion record found to unmark.',
      };
    }

    // Delete the record
    const deleteResult = await db
      .delete(choreHistory)
      .where(eq(choreHistory.id, record.id));
    if (!deleteResult.success) {
      console.error('Failed to unmark chore as done:', deleteResult.error);
      return { success: false, error: 'Failed to unmark chore as done.' };
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

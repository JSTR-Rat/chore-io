import { createServerFn } from '@tanstack/react-start';
import { getSessionData } from './auth.functions';
import {
  chore,
  choreHistory,
  getDB,
  property,
  room,
  userToProperty,
} from '@/db';
import { and, eq } from 'drizzle-orm';

interface CreateChoreInput {
  roomId: number;
  name: string;
  frequency: number;
  frequencyUnit: 'days' | 'weeks' | 'months';
}

interface UpdateChoreInput {
  choreId: number;
  name: string;
  frequency: number;
  frequencyUnit: 'days' | 'weeks' | 'months';
}

const userHasAccessToProperty = async (userId: string, propertyId: number) => {
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
};

const userHasAccessToRoom = async (userId: string, roomId: number) => {
  const db = getDB();
  const [roomRow] = await db
    .select({ propertyId: room.propertyId })
    .from(room)
    .where(eq(room.id, roomId));
  if (!roomRow) {
    throw new Error('Room not found');
  }
  return userHasAccessToProperty(userId, roomRow.propertyId);
};

const userHasAccessToChore = async (userId: string, choreId: number) => {
  const db = getDB();
  const [choreRow] = await db
    .select({ roomId: chore.roomId })
    .from(chore)
    .where(eq(chore.id, choreId));
  if (!choreRow) {
    throw new Error('Chore not found');
  }
  return await userHasAccessToRoom(userId, choreRow.roomId);
};

// Server function to create a chore
export const createChore = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateChoreInput) => data)
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
  .inputValidator((data: UpdateChoreInput) => data)
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
  .inputValidator((data: number) => data)
  .handler(async ({ data: choreId }) => {
    const db = getDB();
    const session = await getSessionData();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    if (!(await userHasAccessToChore(session.user.id, choreId))) {
      return { success: false, error: 'You do not have access to this chore.' };
    }
    const deleteResult = await db.delete(chore).where(eq(chore.id, choreId));
    if (!deleteResult.success) {
      console.error('Failed to delete chore:', deleteResult.error);
      return { success: false, error: 'Failed to delete chore.' };
    }
    return { success: true };
  });

// Server function to mark a chore as done
export const markChoreDone = createServerFn({ method: 'POST' })
  .inputValidator((data: { choreId: number; completedAt: Date }) => data)
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
  .inputValidator((data: number) => data)
  .handler(async ({ data: choreId }) => {
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
      .where(eq(choreHistory.choreId, choreId));
    if (!deleteResult.success) {
      console.error('Failed to clear chore history:', deleteResult.error);
      return { success: false, error: 'Failed to clear chore history.' };
    }

    return { success: true };
  });

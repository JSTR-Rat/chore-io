import { chore, getDB, property, room, userToProperty } from '@/db';
import { createServerFn } from '@tanstack/react-start';
import { redirect, notFound } from '@tanstack/react-router';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getSessionData } from './auth.functions';

const AssertRoomAccessInputSchema = z.object({
  propertyId: z.number(),
  roomId: z.number(),
});

const AssertChoreAccessInputSchema = z.object({
  propertyId: z.number(),
  roomId: z.number(),
  choreId: z.number(),
});

export const assertUserHasAccessToRoom = createServerFn({ method: 'GET' })
  .inputValidator(AssertRoomAccessInputSchema)
  .handler(async ({ data }): Promise<void> => {
    const { propertyId, roomId } = data;

    const db = getDB();
    const session = await getSessionData();
    const userId = session?.user.id;
    if (!userId) {
      throw redirect({
        to: '/unauthorized',
      });
    }

    /**
     * 1. Check user → property access
     *    Failure here is UNAUTHORIZED
     */
    const propertyAccess = await db
      .select({ propertyId: property.id })
      .from(userToProperty)
      .innerJoin(property, eq(property.id, userToProperty.propertyId))
      .where(
        and(eq(userToProperty.userId, userId), eq(property.id, propertyId)),
      )
      .limit(1);

    if (!propertyAccess.length) {
      throw redirect({
        to: '/unauthorized',
      });
    }

    /**
     * 2. Check room belongs to property
     *    Failure here is NOT FOUND
     */
    const roomResult = await db
      .select({ roomId: room.id })
      .from(room)
      .where(and(eq(room.id, roomId), eq(room.propertyId, propertyId)))
      .limit(1);

    if (!roomResult.length) {
      throw notFound();
    }

    // All good — access confirmed
  });

export const assertUserHasAccessToChore = createServerFn({ method: 'GET' })
  .inputValidator(AssertChoreAccessInputSchema)
  .handler(async ({ data }): Promise<void> => {
    const { propertyId, roomId, choreId } = data;

    const db = getDB();
    const session = await getSessionData();
    const userId = session?.user.id;
    if (!userId) {
      throw redirect({
        to: '/unauthorized',
      });
    }

    /**
     * 1. Check user → property access
     *    Failure here is UNAUTHORIZED
     */
    const propertyAccess = await db
      .select({ propertyId: property.id })
      .from(userToProperty)
      .innerJoin(property, eq(property.id, userToProperty.propertyId))
      .where(
        and(eq(userToProperty.userId, userId), eq(property.id, propertyId)),
      )
      .limit(1);

    if (!propertyAccess.length) {
      throw redirect({
        to: '/unauthorized',
      });
    }

    /**
     * 2. Check room belongs to property
     *    Failure here is NOT FOUND
     */
    const roomResult = await db
      .select({ roomId: room.id })
      .from(room)
      .where(and(eq(room.id, roomId), eq(room.propertyId, propertyId)))
      .limit(1);

    if (!roomResult.length) {
      throw notFound();
    }

    /**
     * 3. Check chore belongs to room
     *    Failure here is NOT FOUND
     */
    const choreResult = await db
      .select({ choreId: chore.id })
      .from(chore)
      .where(and(eq(chore.id, choreId), eq(chore.roomId, roomId)))
      .limit(1);

    if (!choreResult.length) {
      throw notFound();
    }

    // All good — access confirmed
  });

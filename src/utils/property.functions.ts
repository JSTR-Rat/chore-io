import { userToProperty } from '@/db/schema';

import { getDB } from '@/db';
import { createServerOnlyFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';

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

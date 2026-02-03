import { getDB, invite, property, userToProperty } from '@/db';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { getSessionData } from './auth.functions';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { waitUntil } from 'cloudflare:workers';
import PropertyInviteEmail from '@/emails/property-invite-email';

export const inviteToProperty = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      propertyId: z.number(),
      email: z.email('Invalid email address'),
    }),
  )
  .handler(async ({ data }) => {
    console.log('Inviting user to property', data);
    const { propertyId, email } = data;
    const session = await getSessionData();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }
    console.log('Session data', session);
    const db = getDB();
    const [userToPropertyRow] = await db
      .select()
      .from(userToProperty)
      .where(
        and(
          eq(userToProperty.propertyId, propertyId),
          eq(userToProperty.userId, session.user.id),
        ),
      );
    if (!userToPropertyRow) {
      return {
        success: false,
        error: 'You cannot invite users to this property.',
      };
    }

    const [propertyRow] = await db
      .select()
      .from(property)
      .where(eq(property.id, propertyId));
    if (!propertyRow) {
      return {
        success: false,
        error: 'You cannot invite users to this property.',
      };
    }

    const token = randomUUID();

    const inviteInsertResult = await db.insert(invite).values({
      id: token,
      invitingUserId: session.user.id,
      invitedUserEmail: email,
      propertyId: propertyId,
    });

    if (!inviteInsertResult.success) {
      console.error(
        'Failed to insert invite into database',
        inviteInsertResult.error,
      );
      return {
        success: false,
        error: 'Failed to send invite. Please try again later.',
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    waitUntil(
      resend.emails.send({
        from: 'Chores-IO <noreply@chores.jstr.sh>',
        to: [email],
        subject: 'You have been invited to a property on Chores-IO',
        react: PropertyInviteEmail({
          invitedByEmail: session.user.email,
          propertyName: propertyRow.name,
          inviteToken: token,
          inviteLink: `${process.env.BASE_URL}/invite?token=${token}`,
        }),
      }),
    );
    console.log('Sending property invite to', email, token);
    return { success: true };
  });

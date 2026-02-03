import { getDB, invite, property, userToProperty } from '@/db';
import { getSessionData } from '@/utils/auth.functions';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

const getInviteDetails = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      token: z.string().min(1, 'Token is required'),
    }),
  )
  .handler(async ({ data }) => {
    const { token } = data;
    const session = await getSessionData();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }
    const db = getDB();
    const [inviteData] = await db
      .select()
      .from(invite)
      .where(
        and(
          eq(invite.id, token),
          eq(invite.invitedUserEmail, session.user.email),
        ),
      );
    if (!inviteData) {
      return { success: false, error: 'Invitation not found.' };
    }
    const [propertyData] = await db
      .select()
      .from(property)
      .where(eq(property.id, inviteData.propertyId));
    if (!propertyData) {
      return { success: false, error: 'Property not found.' };
    }
    return {
      success: true,
      propertyName: propertyData.name,
      token: inviteData.id,
    };
  });

const ignoreInvite = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      token: z.string().min(1, 'Token is required'),
    }),
  )
  .handler(async ({ data }) => {
    const { token } = data;
    const db = getDB();
    const session = await getSessionData();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }
    const deleteResult = await db
      .delete(invite)
      .where(
        and(
          eq(invite.id, token),
          eq(invite.invitedUserEmail, session.user.email),
        ),
      );
    if (!deleteResult.success) {
      console.error('Failed to ignore invitation:', deleteResult.error);
      return {
        success: false,
        error: 'Failed to ignore invitation. Please try again later.',
      };
    }
    return { success: true };
  });

const acceptInvite = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      token: z.string().min(1, 'Token is required'),
    }),
  )
  .handler(async ({ data }) => {
    const { token } = data;
    const db = getDB();
    const session = await getSessionData();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }
    const [inviteData] = await db
      .select()
      .from(invite)
      .where(
        and(
          eq(invite.id, token),
          eq(invite.invitedUserEmail, session.user.email),
        ),
      );
    if (!inviteData) {
      return { success: false, error: 'Invitation not found.' };
    }
    const insertResult = await db.insert(userToProperty).values({
      userId: session.user.id,
      propertyId: inviteData.propertyId,
    });
    if (!insertResult.success) {
      console.error('Failed to insert user to property:', insertResult.error);
      return {
        success: false,
        error: 'Failed to accept invitation. Please try again later.',
      };
    }
    return { success: true, propertyId: inviteData.propertyId };
  });

const searchSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const Route = createFileRoute('/_authed/invite')({
  validateSearch: searchSchema,
  component: RouteComponent,
  beforeLoad: async ({ search }) => {
    return { token: search.token };
  },
  loader: async ({ context: { token } }) => {
    const details = await getInviteDetails({ data: { token } });
    return { details };
  },
});

function RouteComponent() {
  const { details } = Route.useLoaderData();
  const navigate = useNavigate();
  const { propertyName } = details;

  const handleAccept = async () => {
    if (!details.success) {
      return;
    }
    const result = await acceptInvite({ data: { token: details.token } });
    if (!result.success) {
      console.error('Failed to accept invitation:', result.error);
      return;
    }
    navigate({
      to: '/dashboard/$propertyId',
      params: { propertyId: result.propertyId.toString() },
    });
  };

  const handleIgnore = async () => {
    if (!details.success) {
      return;
    }
    await ignoreInvite({ data: { token: details.token } });
    navigate({ to: '/dashboard' });
  };

  if (!details.success) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="rounded-lg border border-error-border bg-error-bg p-8 backdrop-blur-sm">
            <h2 className="mb-2 text-xl font-semibold text-text">Error</h2>
            <p className="text-sm text-error-text">{details.error}</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-block w-full rounded-lg border border-border-strong bg-surface-elevated px-4 py-3 text-center font-medium text-text-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-text focus:ring-2 focus:ring-primary focus:outline-none"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text">
            Property Invitation
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            You've been invited to join a property
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-lg border border-border bg-surface p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-6 text-center">
            <p className="text-lg text-text-muted">
              You've been invited to{' '}
              <span className="font-semibold text-text">{propertyName}</span>
            </p>
          </div>

          <div className="space-y-3">
            {/* Accept Button (Primary) */}
            <button
              onClick={handleAccept}
              className="w-full rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-3 font-semibold text-text shadow-lg shadow-primary-shadow transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover hover:shadow-primary-shadow-hover focus:ring-2 focus:ring-primary focus:outline-none"
            >
              Accept Invitation
            </button>

            {/* Ignore Button (Secondary) */}
            <button
              onClick={handleIgnore}
              className="w-full rounded-lg border border-border-strong bg-surface-elevated px-4 py-3 font-medium text-text-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-text focus:ring-2 focus:ring-primary focus:outline-none"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

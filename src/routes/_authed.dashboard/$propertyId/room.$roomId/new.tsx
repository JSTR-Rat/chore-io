import { StandardCancelButton } from '@/components/standard-form/cancel-button';
import { StandardFormField } from '@/components/standard-form/field';
import { StandardFormFieldRadioGroup } from '@/components/standard-form/field-radio-group';
import { StandardFormLayout } from '@/components/standard-form/layout';
import { StandardServerError } from '@/components/standard-form/server-error';
import { StandardFormShell } from '@/components/standard-form/shell';
import { StandardSubmitButton } from '@/components/standard-form/submit-button';
import { assertUserHasAccessToRoom } from '@/utils/access.functions';
import { createChore } from '@/utils/chore.functions';
import { getRoomDetails } from '@/utils/room.functions';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import z from 'zod';

const createChoreSchema = z.object({
  name: z.string().min(1),
  frequency: z.coerce.number().min(1),
  frequencyUnit: z.enum(['days', 'weeks', 'months']),
});
type CreateChoreInput = z.infer<typeof createChoreSchema>;

const RoomParamsSchema = z.object({
  propertyId: z.coerce.number(),
  roomId: z.coerce.number(),
});
type RoomParams = z.infer<typeof RoomParamsSchema>;

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId/new',
)({
  component: RouteComponent,
  params: RoomParamsSchema,
  loader: async ({ params }) => {
    await assertUserHasAccessToRoom({
      data: { propertyId: params.propertyId, roomId: params.roomId },
    });
    return {
      room: await getRoomDetails({ data: { roomId: params.roomId } }),
    };
  },
});

function RouteComponent() {
  const { room } = Route.useLoaderData();
  const { propertyId, roomId } = Route.useParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: '',
      frequency: 1,
      frequencyUnit: 'weeks',
    } as CreateChoreInput,
    validators: {
      onChange: ({ value }) => {
        const result = createChoreSchema.safeParse(value);
        if (!result.success) {
          const fields: Record<string, string> = {};
          result.error.issues.forEach((err) => {
            const path = err.path[0];
            if (path != null && err.message) {
              fields[String(path)] = err.message;
            }
          });
          return { fields };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const parsed = createChoreSchema.parse(value);
      try {
        setServerError(null);
        const createResult = await createChore({
          data: {
            roomId: Number(roomId),
            name: parsed.name,
            frequency: parsed.frequency,
            frequencyUnit: parsed.frequencyUnit,
          },
        });
        if (!createResult.success) {
          setServerError(createResult.error || 'Failed to create chore');
          return;
        }
        navigate({
          to: '/dashboard/$propertyId/room/$roomId',
          params: { propertyId, roomId },
        });
        //   // Sign in using better-auth
        //   const result = await inviteToProperty({
        //     data: {
        //       propertyId: Number(propertyId),
        //       email: value.email,
        //     },
        //   });

        //   if (!result.success) {
        //     setServerError(
        //       result.error || 'Failed to send invite. Please try again later.',
        //     );
        //     return;
        //   }
      } catch (err) {
        console.error('Create chore error:', err);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    },
  });

  return (
    <>
      <StandardFormLayout
        title="Create a New Chore"
        subtitle={`Add a new chore to ${room.name}`}
      >
        <StandardFormShell
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <StandardServerError error={serverError} />

          {/* Email Field */}
          <form.Field name="name">
            {(field) => (
              <StandardFormField
                field={field}
                label="Name"
                type="text"
                placeholder="New Chore"
                autoComplete="name"
              />
            )}
          </form.Field>
          <form.Field name="frequency">
            {(field) => (
              <StandardFormField
                field={field}
                label="Frequency"
                type="text"
                inputMode="decimal"
                placeholder="1"
                autoComplete="frequency"
              />
            )}
          </form.Field>
          <form.Field name="frequencyUnit">
            {(field) => (
              <StandardFormFieldRadioGroup
                field={field}
                label="Frequency Unit"
                options={[
                  { label: 'Days', value: 'days' },
                  { label: 'Weeks', value: 'weeks' },
                  { label: 'Months', value: 'months' },
                ]}
              />
            )}
          </form.Field>

          {/* Submit Button */}
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <div className="flex gap-3">
                <StandardCancelButton
                  to="/dashboard/$propertyId/room/$roomId"
                  params={{ propertyId, roomId }}
                  isSubmitting={isSubmitting}
                >
                  Cancel
                </StandardCancelButton>
                <StandardSubmitButton
                  canSubmit={canSubmit}
                  isSubmitting={isSubmitting}
                  loadingText="Creating Chore..."
                >
                  Create
                </StandardSubmitButton>
              </div>
            )}
          </form.Subscribe>
        </StandardFormShell>
      </StandardFormLayout>
    </>
  );
}

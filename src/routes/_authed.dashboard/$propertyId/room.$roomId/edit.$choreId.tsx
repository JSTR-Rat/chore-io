import { StandardCancelButton } from '@/components/standard-form/cancel-button';
import { StandardFormField } from '@/components/standard-form/field';
import { StandardFormFieldRadioGroup } from '@/components/standard-form/field-radio-group';
import { StandardFormLayout } from '@/components/standard-form/layout';
import { StandardServerError } from '@/components/standard-form/server-error';
import { StandardFormShell } from '@/components/standard-form/shell';
import { StandardSubmitButton } from '@/components/standard-form/submit-button';
import { assertUserHasAccessToChore } from '@/utils/access.functions';
import { getChore, updateChore } from '@/utils/chore.functions';
import { getRoomDetails } from '@/utils/room.functions';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import z from 'zod';

const editChoreSchema = z.object({
  name: z.string().min(1),
  frequency: z.coerce.number().min(1),
  frequencyUnit: z.enum(['days', 'weeks', 'months']),
});
type EditChoreInput = z.infer<typeof editChoreSchema>;

const EditChoreParamsSchema = z.object({
  propertyId: z.coerce.number(),
  roomId: z.coerce.number(),
  choreId: z.coerce.number(),
});
type EditChoreParams = z.infer<typeof EditChoreParamsSchema>;

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId/edit/$choreId',
)({
  component: RouteComponent,
  params: EditChoreParamsSchema,
  loader: async ({ params }) => {
    const choreResult = await getChore({
      data: {
        propertyId: params.propertyId,
        roomId: params.roomId,
        choreId: params.choreId,
      },
    });
    if (!choreResult.success) {
      throw new Error(choreResult.error || 'Failed to get chore');
    }
    return { chore: choreResult.chore };
  },
});

function RouteComponent() {
  const { chore } = Route.useLoaderData();
  const { propertyId, roomId, choreId } = Route.useParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: chore.name,
      frequency: chore.frequency,
      frequencyUnit: chore.frequencyUnit,
    } as EditChoreInput,
    validators: {
      onChange: ({ value }) => {
        const result = editChoreSchema.safeParse(value);
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
      const parsed = editChoreSchema.parse(value);
      try {
        setServerError(null);
        const updateResult = await updateChore({
          data: {
            choreId: Number(choreId),
            name: parsed.name,
            frequency: parsed.frequency,
            frequencyUnit: parsed.frequencyUnit,
          },
        });
        if (!updateResult.success) {
          setServerError(updateResult.error || 'Failed to update chore');
          return;
        }
        navigate({
          to: '/dashboard/$propertyId/room/$roomId',
          params: { propertyId, roomId },
        });
      } catch (err) {
        console.error('Update chore error:', err);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    },
  });

  return (
    <>
      <StandardFormLayout
        title="Edit Chore"
        subtitle={`Edit chore: ${chore.name}`}
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
                placeholder="Chore Name"
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
                  loadingText="Updating Chore..."
                >
                  Update
                </StandardSubmitButton>
              </div>
            )}
          </form.Subscribe>
        </StandardFormShell>
      </StandardFormLayout>
    </>
  );
}

import {
  AuthFormLayout,
  AuthFormLink,
  AuthFormShell,
  AuthSubmitButton,
  FormField,
  ServerError,
} from '@/components/auth';
import { StandardFormField } from '@/components/standard-form/field';
import { StandardFormLayout } from '@/components/standard-form/layout';
import { StandardServerError } from '@/components/standard-form/server-error';
import { StandardFormShell } from '@/components/standard-form/shell';
import { StandardSubmitButton } from '@/components/standard-form/submit-button';
import { inviteToProperty } from '@/utils/invite.functions';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import z from 'zod';

// Zod schema for invite validation
const inviteSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export const Route = createFileRoute('/_authed/dashboard/$propertyId/invite')({
  component: InvitePage,
});

function InvitePage() {
  const navigate = useNavigate();
  const { propertyId } = Route.useParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
    } as InviteFormValues,
    validators: {
      onChange: inviteSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      try {
        setServerError(null);

        // Sign in using better-auth
        const result = await inviteToProperty({
          data: {
            propertyId: Number(propertyId),
            email: value.email,
          },
        });

        if (!result.success) {
          setServerError(
            result.error || 'Failed to send invite. Please try again later.',
          );
          return;
        }
      } catch (err) {
        console.error('Invite error:', err);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    },
  });

  return (
    <StandardFormLayout
      title="Invite a User"
      subtitle="Enter the email of the user you want to invite"
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
        <form.Field name="email">
          {(field) => (
            <StandardFormField
              field={field}
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
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
            <StandardSubmitButton
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              loadingText="Inviting..."
            >
              Invite
            </StandardSubmitButton>
          )}
        </form.Subscribe>
      </StandardFormShell>
    </StandardFormLayout>
  );
}

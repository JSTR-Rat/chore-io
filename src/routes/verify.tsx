import { authClient } from '@/lib/auth-client';
import { auth } from '@/lib/auth';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  AuthFormLayout,
  AuthFormShell,
  FormField,
  ServerError,
  AuthSubmitButton,
} from '@/components/auth';

// Zod schema for OTP validation
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 characters')
    .max(6, 'OTP must be 6 characters')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

// Server function to get user email from session
const getUserEmail = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session?.user?.email || null;
});

// Server function to get session data
const getSessionData = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session;
});

export const Route = createFileRoute('/verify')({
  component: VerifyPage,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const session = await getSessionData();
    if (!session?.user) {
      throw redirect({
        to: '/signin',
        search: { redirect: search.redirect },
      });
    }
    if (session?.user.emailVerified) {
      throw redirect({ to: search.redirect || '/dashboard' });
    }
  },
  loader: async () => {
    const email = await getUserEmail();
    return { email };
  },
});

function VerifyPage() {
  const navigate = useNavigate();
  const { email } = Route.useLoaderData();
  const search = Route.useSearch();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
        <p className="text-text">Loading...</p>
      </div>
    );
  }

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const form = useForm({
    defaultValues: {
      otp: '',
    } as OtpFormValues,
    validators: {
      onChange: otpSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setServerError(null);
        setResendSuccess(null);

        // Verify OTP using better-auth
        const { data, error } = await authClient.emailOtp.verifyEmail({
          email,
          otp: value.otp,
        });

        if (error) {
          setServerError(
            error.message || 'Invalid verification code. Please try again.',
          );
          return;
        }

        if (data) {
          // Successful verification
          navigate({ to: search.redirect || '/dashboard' });
        }
      } catch (err) {
        console.error('Verification error:', err);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    },
  });

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }

    try {
      setIsResending(true);
      setServerError(null);
      setResendSuccess(null);

      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });

      if (error) {
        setServerError(
          error.message ||
            'Failed to resend verification code. Please try again.',
        );
      } else {
        setResendSuccess('Verification code sent! Check your email.');
        setResendCooldown(60); // Start 60-second cooldown
      }
    } catch (err) {
      console.error('Resend error:', err);
      setServerError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthFormLayout
      title="Verify Your Email"
      subtitle="Enter the 6-digit code sent to your email address"
    >
      <AuthFormShell
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <ServerError error={serverError} />

        {resendSuccess && (
          <div className="mb-4 rounded-md border border-success-border bg-success-bg p-4">
            <p className="text-sm text-success-text">{resendSuccess}</p>
          </div>
        )}

        {/* OTP Field */}
        <form.Field name="otp">
          {(field) => (
            <FormField
              field={field}
              label="Verification Code"
              type="text"
              placeholder="123456"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
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
            <AuthSubmitButton
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              loadingText="Verifying..."
            >
              Verify Email
            </AuthSubmitButton>
          )}
        </form.Subscribe>

        {/* Resend Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className={`w-full text-sm font-medium ${
              resendCooldown > 0 || isResending
                ? 'cursor-not-allowed text-text-disabled'
                : 'text-primary-light hover:text-primary-lighter'
            } transition-colors`}
          >
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend verification code'}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-subtle">
            Didn't receive the code? Check your spam folder or click resend
            above.
          </p>
        </div>
      </AuthFormShell>
    </AuthFormLayout>
  );
}

import { authClient } from '@/lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import {
  AuthFormLayout,
  AuthFormShell,
  AuthFormLink,
  FormField,
  ServerError,
  AuthSubmitButton,
} from '@/components/auth'
import { getSessionData } from '@/utils/auth.functions'

// Zod schema for signup validation
const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
})

type SignupFormValues = z.infer<typeof signupSchema>

export const Route = createFileRoute('/signup')({
  component: SignupPage,
  beforeLoad: async () => {
    const session = await getSessionData()
    if (session?.user && !session.user.emailVerified) {
      throw redirect({ to: '/verify' })
    }
    if (session?.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function SignupPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    } as SignupFormValues,
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setServerError(null)

        // Sign up using better-auth
        const { data, error } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        })

        if (error) {
          setServerError(
            error.message || 'Failed to create account. Please try again.',
          )
          return
        }

        if (data) {
          try {
            await authClient.emailOtp.sendVerificationOtp({
              email: value.email,
              type: 'email-verification',
            })
          } catch (err) {
            console.error('Error sending verification OTP:', err)
          } finally {
            // Successful signup - redirect to verify page for email verification
            navigate({ to: '/verify' })
          }
        }
      } catch (err) {
        console.error('Signup error:', err)
        setServerError('An unexpected error occurred. Please try again later.')
      }
    },
  })

  return (
    <AuthFormLayout
      title="Welcome to Chore.io"
      subtitle="Sign up to get started managing your chores"
    >
      <AuthFormShell
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <ServerError error={serverError} />

        {/* Name Field */}
        <form.Field name="name">
          {(field) => (
            <FormField
              field={field}
              label="Name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
            />
          )}
        </form.Field>

        {/* Email Field */}
        <form.Field name="email">
          {(field) => (
            <FormField
              field={field}
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          )}
        </form.Field>

        {/* Password Field */}
        <form.Field name="password">
          {(field) => (
            <FormField
              field={field}
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
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
              loadingText="Creating account..."
            >
              Sign up
            </AuthSubmitButton>
          )}
        </form.Subscribe>

        {/* Sign In Link */}
        <AuthFormLink
          text="Already have an account?"
          linkText="Sign in"
          href="/signin"
        />
      </AuthFormShell>
    </AuthFormLayout>
  )
}

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getDB } from '@/db'
import { admin, emailOTP } from 'better-auth/plugins'
import { Resend } from 'resend'
import { waitUntil } from 'cloudflare:workers'
import VerifyEmailTemplate from '@/emails/verify-email'

export const auth = betterAuth({
  database: drizzleAdapter(getDB(), {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        waitUntil(
          resend.emails.send({
            from: 'Chores-IO <noreply@chores.jstr.sh>',
            to: [email],
            subject: 'Verify Your Email',
            react: VerifyEmailTemplate({ otp }),
          }),
        )
        console.log('Sending verification OTP to', email, otp, type)
      },
    }),
    tanstackStartCookies(), // Handle cookies automatically for TanStack Start
  ],
})

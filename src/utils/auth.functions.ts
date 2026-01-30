import { auth } from '@/lib/auth'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'

// Server function to get session data
export const getSessionData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    return session
  },
)

export const requireAuth = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ currentPath: z.string() }))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session?.user) {
      throw redirect({
        to: '/signin',
        search: { redirect: data.currentPath },
      })
    }
    if (!session?.user.emailVerified) {
      throw redirect({
        to: '/verify',
      })
    }
    return session
  })

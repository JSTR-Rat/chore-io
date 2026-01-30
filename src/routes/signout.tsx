import { authClient } from '@/lib/auth-client'
import { getSessionData } from '@/utils/auth.functions'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
  beforeLoad: async () => {
    const session = await getSessionData()
    if (!session?.user) {
      throw redirect({ to: '/' })
    }
  },
})

function SignOutPage() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(true)
  const hasSignedOut = useRef(false)

  useEffect(() => {
    // Prevent duplicate sign-out calls
    if (hasSignedOut.current) return
    hasSignedOut.current = true

    const performSignOut = async () => {
      try {
        // Sign out using better-auth
        await authClient.signOut()

        // Redirect to home page after successful sign-out
        navigate({ to: '/' })
      } catch (error) {
        console.error('Sign-out error:', error)
        // Even if sign-out fails, redirect to home
        // The session may still be cleared on the client
        navigate({ to: '/' })
      } finally {
        setIsSigningOut(false)
      }
    }

    performSignOut()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end px-4">
      <div className="text-center">
        {isSigningOut ? (
          <>
            <div className="mb-4 flex justify-center">
              <svg
                className="h-12 w-12 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-text-muted">
              Signing you out...
            </p>
          </>
        ) : (
          <p className="text-lg font-medium text-text-muted">Redirecting...</p>
        )}
      </div>
    </div>
  )
}

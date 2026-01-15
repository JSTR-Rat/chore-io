import { authClient } from '@/lib/auth-client';
import { getSessionData } from '@/utils/auth.functions';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
  beforeLoad: async () => {
    const session = await getSessionData();
    if (!session?.user) {
      throw redirect({ to: '/' });
    }
  },
});

function SignOutPage() {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(true);
  const hasSignedOut = useRef(false);

  useEffect(() => {
    // Prevent duplicate sign-out calls
    if (hasSignedOut.current) return;
    hasSignedOut.current = true;

    const performSignOut = async () => {
      try {
        // Sign out using better-auth
        await authClient.signOut();

        // Redirect to home page after successful sign-out
        navigate({ to: '/' });
      } catch (error) {
        console.error('Sign-out error:', error);
        // Even if sign-out fails, redirect to home
        // The session may still be cleared on the client
        navigate({ to: '/' });
      } finally {
        setIsSigningOut(false);
      }
    };

    performSignOut();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {isSigningOut ? (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-12 w-12 text-blue-600"
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
            <p className="text-lg text-gray-700 font-medium">
              Signing you out...
            </p>
          </>
        ) : (
          <p className="text-lg text-gray-700 font-medium">Redirecting...</p>
        )}
      </div>
    </div>
  );
}

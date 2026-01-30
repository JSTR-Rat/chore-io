// src/routes/index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end px-4">
      <div className="w-full max-w-4xl text-center">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Logo/Brand Area */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight text-text md:text-7xl">
              Chore<span className="text-primary">.io</span>
            </h1>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-primary to-accent-purple-hover"></div>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <p className="text-2xl font-light text-text-muted md:text-3xl">
              Stay on top of your household tasks
            </p>
            <p className="mx-auto max-w-2xl text-lg text-text-subtle">
              Track your chores with visual timelines and never forget what
              needs to be done. Simple, effective, and always accessible.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
            <Link
              to="/signup"
              className="w-full transform rounded-lg bg-linear-to-r from-primary-from to-primary-to px-8 py-4 font-semibold text-text shadow-lg shadow-primary-shadow transition-all duration-200 hover:scale-105 hover:from-primary-from-hover hover:to-primary-to-hover hover:shadow-primary-shadow-hover sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              to="/signin"
              className="w-full rounded-lg border border-border-strong bg-surface-elevated px-8 py-4 font-medium text-text-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-text sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6 pt-16 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-6 backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue-bg">
                <svg
                  className="h-6 w-6 text-primary-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-text">Visual Timeline</h3>
              <p className="text-sm text-text-subtle">
                See at a glance when each chore was last done and when it's due
                next.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-purple-bg">
                <svg
                  className="h-6 w-6 text-accent-purple-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-text">Lightning Fast</h3>
              <p className="text-sm text-text-subtle">
                Quick check-ins and updates. No complicated forms or workflows.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6 backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-green-bg">
                <svg
                  className="h-6 w-6 text-accent-green-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-text">Secure & Private</h3>
              <p className="text-sm text-text-subtle">
                Your data is encrypted and protected. Only you have access.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-surface-elevated pt-8">
          <p className="text-sm text-text-faint">
            Start managing your chores smarter, not harder.
          </p>
        </div>
      </div>
    </div>
  )
}

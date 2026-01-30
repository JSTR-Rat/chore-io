// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
  useRouter,
} from '@tanstack/react-router'

import appCSS from '../styles/app.css?url'

// Define the context type for routes
type RouteContext = {
  session?: {
    user: {
      id: string
      email: string
      name: string
    }
  } | null
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Chore IO',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCSS }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-text">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundComponent() {
  const router = useRouter()

  const handleGoBack = () => {
    router.history.back()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border border-border bg-surface p-8 shadow-lg backdrop-blur-sm md:p-12">
          {/* Error Code */}
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold tracking-tight text-text md:text-7xl">
                404
              </h1>
              <div className="mx-auto h-1 w-16 rounded-full bg-linear-to-r from-primary to-accent-purple-hover"></div>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-text md:text-3xl">
                Page Not Found
              </h2>
              <p className="mx-auto max-w-md text-text-subtle">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link
                to="/"
                className="w-full transform rounded-lg bg-linear-to-r from-primary-from to-primary-to px-8 py-4 font-semibold text-text shadow-lg shadow-primary-shadow transition-all duration-200 hover:scale-105 hover:from-primary-from-hover hover:to-primary-to-hover hover:shadow-primary-shadow-hover sm:w-auto"
              >
                Go Home
              </Link>
              <button
                onClick={handleGoBack}
                type="button"
                className="w-full rounded-lg border border-border-strong bg-surface-elevated px-8 py-4 font-medium text-text-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-text sm:w-auto"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

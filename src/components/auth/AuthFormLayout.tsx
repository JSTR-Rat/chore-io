import type { ReactNode } from 'react'

interface AuthFormLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

/**
 * Full-page centered layout for authentication forms.
 * Provides consistent header and spacing across auth pages.
 */
export function AuthFormLayout({
  title,
  subtitle,
  children,
}: AuthFormLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text">
            {title}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  )
}

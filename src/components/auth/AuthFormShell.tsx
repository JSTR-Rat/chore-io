import type { ReactNode } from 'react'

interface AuthFormShellProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

/**
 * White card wrapper for auth forms with consistent styling.
 */
export function AuthFormShell({ onSubmit, children }: AuthFormShellProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-8 shadow-lg backdrop-blur-sm">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {children}
      </form>
    </div>
  )
}

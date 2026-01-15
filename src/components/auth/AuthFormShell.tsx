import type { ReactNode } from 'react';

interface AuthFormShellProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

/**
 * White card wrapper for auth forms with consistent styling.
 */
export function AuthFormShell({ onSubmit, children }: AuthFormShellProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {children}
      </form>
    </div>
  );
}

import type { ReactNode } from 'react';

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

interface StandardFormLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Full-page centered layout for standard forms.
 */
export function StandardFormLayout({
  title,
  subtitle,
  children,
}: StandardFormLayoutProps) {
  return (
    <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
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
  );
}

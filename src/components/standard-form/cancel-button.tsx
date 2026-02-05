import type { ReactNode } from 'react';
import { Link, LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';

type StandardCancelButtonProps = LinkProps & {
  isSubmitting: boolean;
  children: ReactNode;
};

/**
 * Cancel button for standard forms.
 */
export function StandardCancelButton({
  isSubmitting,
  children,
  ...props
}: StandardCancelButtonProps) {
  const isDisabled = isSubmitting;
  return (
    <Link
      disabled={isDisabled}
      className={clsx(
        'w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-center font-semibold shadow-lg transition-colors',
        isDisabled
          ? 'cursor-not-allowed border-border-strong bg-surface-disabled text-text-disabled'
          : 'text-text-muted hover:bg-surface-hover hover:text-text',
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

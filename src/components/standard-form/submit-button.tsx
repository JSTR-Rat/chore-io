import type { ReactNode } from 'react';
import { Spinner } from '../icons/spinner';

interface StandardSubmitButtonProps {
  isSubmitting: boolean;
  canSubmit: boolean;
  loadingText: string;
  children: ReactNode;
}

/**
 * Submit button with loading state and spinner animation.
 * Designed for standard forms.
 */
export function StandardSubmitButton({
  isSubmitting,
  canSubmit,
  loadingText,
  children,
}: StandardSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={!canSubmit || isSubmitting}
      className="w-full rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-3 font-semibold text-text shadow-lg shadow-primary-shadow transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover hover:shadow-primary-shadow-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-gradient-mid focus:outline-none disabled:cursor-not-allowed disabled:from-surface-disabled disabled:to-surface-disabled"
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center">
          <Spinner className="mr-3 -ml-1" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

import type { ReactNode } from 'react'

interface AuthSubmitButtonProps {
  isSubmitting: boolean
  canSubmit: boolean
  loadingText: string
  children: ReactNode
}

/**
 * Submit button with loading state and spinner animation.
 * Designed for auth forms (signin/signup).
 */
export function AuthSubmitButton({
  isSubmitting,
  canSubmit,
  loadingText,
  children,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={!canSubmit || isSubmitting}
      className="w-full rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-3 font-semibold text-text shadow-lg shadow-primary-shadow transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover hover:shadow-primary-shadow-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-gradient-mid focus:outline-none disabled:cursor-not-allowed disabled:from-surface-disabled disabled:to-surface-disabled"
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center">
          <svg
            className="mr-3 -ml-1 h-5 w-5 animate-spin text-text"
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
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

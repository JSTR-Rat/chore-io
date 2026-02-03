interface ServerErrorProps {
  error: string | null;
}

/**
 * Displays server-side error messages in a styled alert box.
 */
export function StandardServerError({ error }: ServerErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-error-border-subtle bg-error-bg p-4"
      role="alert"
    >
      <p className="text-sm text-error-text">{error}</p>
    </div>
  );
}

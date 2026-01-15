interface ServerErrorProps {
  error: string | null;
}

/**
 * Displays server-side error messages in a styled alert box.
 */
export function ServerError({ error }: ServerErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <div
      className="p-4 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
    >
      <p className="text-sm text-red-800">{error}</p>
    </div>
  );
}

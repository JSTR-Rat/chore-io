import type { AnyFieldApi } from '@tanstack/react-form';

interface FieldErrorProps {
  field: AnyFieldApi;
}

/**
 * Displays validation errors for a form field.
 * Supports both string errors and structured error objects.
 */
export function FieldError({ field }: FieldErrorProps) {
  const errors = field.state.meta.errors;

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 text-sm text-red-600" role="alert">
      {errors.map((error) => {
        const message =
          typeof error === 'string' ? error : error?.message || String(error);
        return <div key={message}>{message}</div>;
      })}
    </div>
  );
}

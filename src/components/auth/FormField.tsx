import type { AnyFieldApi } from '@tanstack/react-form';
import { FieldError } from './FieldError';

interface FormFieldProps {
  field: AnyFieldApi;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'url' | 'search' | 'none' | 'decimal';
  maxLength?: number;
}

/**
 * Reusable form field component with label, input, and error display.
 * Fully accessible and integrates with TanStack Form.
 */
export function FormField({
  field,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}: FormFieldProps) {
  const hasErrors = field.state.meta.errors && field.state.meta.errors.length > 0;

  return (
    <div className="space-y-2">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={`text-gray-950 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          hasErrors ? 'border-red-500' : 'border-gray-300'
        }`}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? `${field.name}-error` : undefined}
      />
      <FieldError field={field} />
    </div>
  );
}

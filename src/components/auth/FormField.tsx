import type { AnyFieldApi } from '@tanstack/react-form'
import { FieldError } from './FieldError'

interface FormFieldProps {
  field: AnyFieldApi
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  inputMode?:
    | 'text'
    | 'numeric'
    | 'email'
    | 'tel'
    | 'url'
    | 'search'
    | 'none'
    | 'decimal'
  maxLength?: number
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
  const hasErrors =
    field.state.meta.errors && field.state.meta.errors.length > 0

  return (
    <div className="space-y-2">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-text-muted"
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
        className={`w-full rounded-lg border bg-surface-input px-4 py-3 text-text placeholder-text-placeholder transition-all focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none ${
          hasErrors ? 'border-error-border' : 'border-border-strong'
        }`}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? `${field.name}-error` : undefined}
      />
      <FieldError field={field} />
    </div>
  )
}

import type { AnyFieldApi } from '@tanstack/react-form';
import { StandardFieldError } from './field-error';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

interface FormFieldTurnstileProps {
  field: AnyFieldApi;
  action?: string;
  ref?: React.RefObject<TurnstileInstance | null>;
}

/**
 * Reusable form field component with turnstile.
 * Integrates with TanStack Form.
 */
export function StandardFormFieldTurnstile({
  field,
  ref,
  action,
}: FormFieldTurnstileProps) {
  return (
    <div className="space-y-2">
      <Turnstile
        ref={ref}
        options={{
          theme: 'dark',
          size: 'flexible',
          action: action,
        }}
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={(token) => field.handleChange(token)}
        onError={(error) => {
          console.error(error);
          field.handleChange('');
        }}
        onExpire={() => {
          field.handleChange('');
        }}
        onTimeout={() => {
          field.handleChange('');
        }}
      />
      <StandardFieldError field={field} />
    </div>
  );
}

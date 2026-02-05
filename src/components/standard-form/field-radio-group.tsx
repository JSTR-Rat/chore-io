import type { AnyFieldApi } from '@tanstack/react-form';
import { StandardFieldError } from './field-error';
import { Radio, RadioGroup } from '@headlessui/react';

interface FormFieldRadioGroupProps {
  field: AnyFieldApi;
  label: string;
  options: { label: string; value: string }[];
}

/**
 * Reusable form field component with label, input, and error display.
 * Fully accessible and integrates with TanStack Form.
 */
export function StandardFormFieldRadioGroup({
  field,
  label,
  options,
}: FormFieldRadioGroupProps) {
  const hasErrors =
    field.state.meta.errors && field.state.meta.errors.length > 0;

  return (
    <div className="space-y-2">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-text-muted"
      >
        {label}
      </label>
      <RadioGroup
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        className="flex cursor-pointer justify-between overflow-hidden rounded-full border border-border-strong"
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            className="grow px-4 py-2 text-center data-checked:bg-primary data-checked:text-white"
          >
            <span className="pointer-events-none select-none">
              {option.label}
            </span>
          </Radio>
        ))}
      </RadioGroup>
      <StandardFieldError field={field} />
    </div>
  );
}

import { Link, LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';

type AuthFormLinkProps = LinkProps & {
  text: string;
  className?: string;
};

/**
 * Link to alternate auth page (e.g., "Don't have an account? Sign up").
 */
export function AuthFormLink({ text, className, ...props }: AuthFormLinkProps) {
  return (
    <div className="text-center text-sm text-text-subtle">
      {text}{' '}
      <Link
        className={clsx(
          'font-medium text-primary-light transition-colors hover:text-primary-lighter',
          className,
        )}
        {...props}
      />
    </div>
  );
}

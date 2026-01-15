interface AuthFormLinkProps {
  text: string;
  linkText: string;
  href: string;
}

/**
 * Link to alternate auth page (e.g., "Don't have an account? Sign up").
 */
export function AuthFormLink({ text, linkText, href }: AuthFormLinkProps) {
  return (
    <div className="text-center text-sm text-gray-600">
      {text}{' '}
      <a href={href} className="font-medium text-blue-600 hover:text-blue-500">
        {linkText}
      </a>
    </div>
  );
}

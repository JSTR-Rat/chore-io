interface AuthFormLinkProps {
  text: string
  linkText: string
  href: string
}

/**
 * Link to alternate auth page (e.g., "Don't have an account? Sign up").
 */
export function AuthFormLink({ text, linkText, href }: AuthFormLinkProps) {
  return (
    <div className="text-center text-sm text-text-subtle">
      {text}{' '}
      <a
        href={href}
        className="font-medium text-primary-light transition-colors hover:text-primary-lighter"
      >
        {linkText}
      </a>
    </div>
  )
}

import * as React from 'react'

interface PropertyInviteEmailProps {
  invitedByEmail: string
  propertyName: string
  inviteToken: string
  inviteLink?: string
}

const baseUrl = process.env.BASE_URL || 'https://chores.jstr.sh'

export function PropertyInviteEmail({
  invitedByEmail,
  propertyName,
  inviteToken,
  inviteLink,
}: PropertyInviteEmailProps) {
  const inviteUrl = inviteLink || `${baseUrl}/invite?token=${inviteToken}`

  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: '1.6',
        margin: '0',
        padding: '40px 20px',
      }}
    >
      {/* Main Container */}
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: '#111111',
          borderRadius: '12px',
          border: '1px solid #222222',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid #222222',
          }}
        >
          <h1
            style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            🏠 Property Invitation
          </h1>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '32px',
          }}
        >
          {/* Greeting */}
          <p
            style={{
              margin: '0 0 24px',
              fontSize: '15px',
              color: '#a3a3a3',
              lineHeight: '1.6',
            }}
          >
            Hi there,
          </p>

          {/* Explanation */}
          <p
            style={{
              margin: '0 0 24px',
              fontSize: '15px',
              color: '#d4d4d4',
              lineHeight: '1.6',
            }}
          >
            You've been invited by{' '}
            <strong style={{ color: '#ffffff' }}>{invitedByEmail}</strong> to
            join <strong style={{ color: '#ffffff' }}>{propertyName}</strong> on
            Chores-IO.
          </p>

          <p
            style={{
              margin: '0 0 32px',
              fontSize: '15px',
              color: '#d4d4d4',
              lineHeight: '1.6',
            }}
          >
            Chores-IO helps you and your housemates manage chores, track
            responsibilities, and keep your property organized.
          </p>

          {/* CTA Button */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <a
              href={inviteUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                border: '1px solid #2563eb',
              }}
            >
              Accept Invitation
            </a>
          </div>

          {/* Link Card */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Or copy this link
            </p>
            <a
              href={inviteUrl}
              style={{
                fontSize: '13px',
                color: '#3b82f6',
                textDecoration: 'none',
                wordBreak: 'break-all',
                fontFamily: '"Courier New", Courier, monospace',
              }}
            >
              {inviteUrl}
            </a>
          </div>

          {/* Instructions */}
          <p
            style={{
              margin: '0 0 24px',
              fontSize: '14px',
              color: '#a3a3a3',
              lineHeight: '1.6',
            }}
          >
            Click the button above to accept the invitation and join the
            property. If you weren't expecting this invitation, you can safely
            ignore this email.
          </p>

          {/* Security Note */}
          <div
            style={{
              borderTop: '1px solid #222222',
              paddingTop: '24px',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '13px',
                color: '#737373',
                lineHeight: '1.5',
              }}
            >
              🔒 <strong style={{ color: '#a3a3a3' }}>Security tip:</strong>{' '}
              This invitation link is unique to you. Don't share it with others.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '24px 32px',
            backgroundColor: '#0a0a0a',
            borderTop: '1px solid #222222',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '12px',
              color: '#525252',
              lineHeight: '1.5',
            }}
          >
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PropertyInviteEmail

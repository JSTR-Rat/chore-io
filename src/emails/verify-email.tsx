import * as React from 'react';

interface VerifyEmailTemplateProps {
  otp: string;
  email?: string;
  expiresInMinutes?: number;
}

export function VerifyEmailTemplate({ 
  otp, 
  email,
  expiresInMinutes = 10 
}: VerifyEmailTemplateProps) {
  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
            Verify Your Email
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
            {email ? `Hi there,` : 'Hello,'}
          </p>

          {/* Explanation */}
          <p
            style={{
              margin: '0 0 32px',
              fontSize: '15px',
              color: '#d4d4d4',
              lineHeight: '1.6',
            }}
          >
            We received a request to verify your email address{email ? ` (${email})` : ''}. 
            Use the verification code below to complete your sign-up.
          </p>

          {/* OTP Card */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <p
              style={{
                margin: '0 0 12px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Your Verification Code
            </p>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '8px',
                fontFamily: '"Courier New", Courier, monospace',
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '6px',
                border: '1px solid #2a2a2a',
                userSelect: 'all',
              }}
            >
              {otp}
            </div>
          </div>

          {/* Expiry Notice */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '13px',
                color: '#a3a3a3',
                lineHeight: '1.5',
              }}
            >
              ⏱️ This code will expire in <strong style={{ color: '#ffffff' }}>{expiresInMinutes} minutes</strong>
            </p>
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
            Enter this code in the verification page to continue. 
            If you didn't request this code, you can safely ignore this email.
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
              🔒 <strong style={{ color: '#a3a3a3' }}>Security tip:</strong> Never share this code with anyone. 
              We'll never ask you for your verification code.
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
  );
}

export default VerifyEmailTemplate;

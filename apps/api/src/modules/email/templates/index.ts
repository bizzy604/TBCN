/**
 * Shared email layout wrapper
 * Provides consistent branding across all transactional emails
 */
export function emailLayout(content: string, frontendUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brand Coach Network</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7; color: #333333; }
    .email-wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background-color: #1a1a2e; padding: 24px 32px; text-align: center; }
    .email-header a { color: #ffffff; text-decoration: none; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .email-body { padding: 40px 32px; }
    .email-body h1 { margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1a1a2e; }
    .email-body p { margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555; }
    .btn { display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff !important; background-color: #4f46e5; border-radius: 8px; text-decoration: none; margin: 8px 0; }
    .btn:hover { background-color: #4338ca; }
    .email-footer { padding: 24px 32px; text-align: center; border-top: 1px solid #eeeeee; }
    .email-footer p { margin: 0; font-size: 13px; color: #999999; line-height: 1.6; }
    .email-footer a { color: #4f46e5; text-decoration: none; }
    .muted { font-size: 14px; color: #888888; }
    .divider { height: 1px; background-color: #eeeeee; margin: 24px 0; }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; padding: 24px 0;">
    <tr>
      <td align="center">
        <div class="email-wrapper">
          <!-- Header -->
          <div class="email-header">
            <a href="${frontendUrl}">Brand Coach Network</a>
          </div>

          <!-- Body -->
          <div class="email-body">
            ${content}
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p>
              &copy; ${new Date().getFullYear()} The Brand Coach Network. All rights reserved.<br />
              <a href="${frontendUrl}">Visit our website</a> &middot;
              <a href="${frontendUrl}/contact">Contact Support</a>
            </p>
            <p style="margin-top: 8px;">
              You're receiving this email because you have an account with Brand Coach Network.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================
// Email Verification Template
// ============================================

interface VerificationTemplateData {
  firstName: string;
  verificationUrl: string;
  frontendUrl: string;
}

export function getEmailVerificationTemplate(data: VerificationTemplateData): string {
  const content = `
    <h1>Verify your email address</h1>
    <p>Hi ${data.firstName},</p>
    <p>Thanks for signing up for Brand Coach Network! Please verify your email address by clicking the button below:</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.verificationUrl}" class="btn">Verify Email Address</a>
    </p>
    <p class="muted">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    <div class="divider"></div>
    <p class="muted">If the button doesn't work, copy and paste this URL into your browser:</p>
    <p class="muted" style="word-break: break-all;">${data.verificationUrl}</p>
  `;
  return emailLayout(content, data.frontendUrl);
}

// ============================================
// Password Reset Template
// ============================================

interface PasswordResetTemplateData {
  firstName: string;
  resetUrl: string;
  frontendUrl: string;
}

export function getPasswordResetTemplate(data: PasswordResetTemplateData): string {
  const content = `
    <h1>Reset your password</h1>
    <p>Hi ${data.firstName},</p>
    <p>We received a request to reset the password for your Brand Coach Network account. Click the button below to set a new password:</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.resetUrl}" class="btn">Reset Password</a>
    </p>
    <p class="muted">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
    <div class="divider"></div>
    <p class="muted">If the button doesn't work, copy and paste this URL into your browser:</p>
    <p class="muted" style="word-break: break-all;">${data.resetUrl}</p>
  `;
  return emailLayout(content, data.frontendUrl);
}

// ============================================
// Welcome Template
// ============================================

interface WelcomeTemplateData {
  firstName: string;
  loginUrl: string;
  frontendUrl: string;
}

export function getWelcomeTemplate(data: WelcomeTemplateData): string {
  const content = `
    <h1>Welcome to Brand Coach Network! 🎉</h1>
    <p>Hi ${data.firstName},</p>
    <p>Your email has been verified and your account is now active. We're excited to have you on board!</p>
    <p>Here's what you can do next:</p>
    <ul style="color: #555555; line-height: 2;">
      <li><strong>Complete your profile</strong> — Add a photo, bio, and your interests</li>
      <li><strong>Browse programs</strong> — Discover coaching programs that match your goals</li>
      <li><strong>Connect with coaches</strong> — Find expert coaches in your area of interest</li>
    </ul>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.loginUrl}" class="btn">Go to Dashboard</a>
    </p>
    <p>If you have any questions, don't hesitate to reach out to our support team.</p>
  `;
  return emailLayout(content, data.frontendUrl);
}

// ============================================
// Password Changed Template
// ============================================

interface PasswordChangedTemplateData {
  firstName: string;
  supportEmail: string;
  frontendUrl: string;
}

export function getPasswordChangedTemplate(data: PasswordChangedTemplateData): string {
  const content = `
    <h1>Password changed successfully</h1>
    <p>Hi ${data.firstName},</p>
    <p>Your Brand Coach Network password has been successfully changed.</p>
    <p>If you did not make this change, please contact our support team immediately at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a> or reset your password right away.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.frontendUrl}/auth/forgot-password" class="btn">Reset Password</a>
    </p>
    <div class="divider"></div>
    <p class="muted">This is an automated security notification. No action is needed if you made this change.</p>
  `;
  return emailLayout(content, data.frontendUrl);
}

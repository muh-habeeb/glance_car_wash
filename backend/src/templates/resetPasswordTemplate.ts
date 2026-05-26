import { emailLayout } from "./layout.js";

/**
 * Creates the HTML email template for password resets
 */
export const getResetPasswordTemplate = (name: string, resetUrl: string): string => {
  const content = `
    <h1 style="color: #d4a943; margin-top: 0; font-size: 24px; font-weight: 700;">Password Reset Request</h1>
    <p style="margin: 0 0 16px 0; font-size: 16px;">Hello ${name},</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #d1d5db;">
      We received a request to reset the password for your account at <strong>Glance Premium Car Wash</strong>. 
      If you made this request, please click the button below to set a new password:
    </p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn-gold" style="display: inline-block; background-color: #d4a943; color: #000000 !important; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 8px; margin: 15px 0; text-align: center; letter-spacing: 0.5px;">
        Reset Password
      </a>
    </div>
    
    <p style="margin: 20px 0 10px 0; font-size: 14px; color: #9ca3af;">
      If you did not request a password reset, please ignore this email or contact support if you have concerns. This link will remain active for 1 hour.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;" />
    
    <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
      If the button above doesn't work, copy and paste this URL into your browser: <br />
      <a href="${resetUrl}" style="color: #60a5fa; text-decoration: underline;">${resetUrl}</a>
    </p>
  `;

  return emailLayout(content, "Reset Your Password - Glance Premium Car Wash");
};

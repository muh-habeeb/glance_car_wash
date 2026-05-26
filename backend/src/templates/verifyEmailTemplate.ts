import { emailLayout } from "./layout.js";

/**
 * Creates the HTML email template for email verification
 */
export const getVerifyEmailTemplate = (name: string, verifyUrl: string): string => {
  const content = `
    <h1 style="color: #d4a943; margin-top: 0; font-size: 24px; font-weight: 700;">Verify Your Email Address</h1>
    <p style="margin: 0 0 16px 0; font-size: 16px;">Welcome ${name}!</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #d1d5db;">
      Thank you for joining <strong>Glance Premium Car Wash</strong>.
      To activate your account and verify your email address, please click the button below:
    </p>
    
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn-gold" style="display: inline-block; background-color: #d4a943; color: #000000 !important; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 8px; margin: 15px 0; text-align: center; letter-spacing: 0.5px;">
        Verify Email Address
      </a>
    </div>
    
    <p style="margin: 20px 0 10px 0; font-size: 14px; color: #9ca3af;">
      If you did not create an account at Glance Premium Car Wash, you can safely ignore this email.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;" />
    
    <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
      If the button above doesn't work, copy and paste this URL into your browser: <br />
      <a href="${verifyUrl}" style="color: #60a5fa; text-decoration: underline;">${verifyUrl}</a>
    </p>
  `;

  return emailLayout(content, "Activate Your Account - Glance Premium Car Wash");
};

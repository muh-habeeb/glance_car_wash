import { emailLayout } from "./layout.js";

/**
 * Creates the HTML email template for email verification
 */
export const getVerifyEmailTemplate = (name: string, verifyUrl: string): string => {
  const content = `
    <h1 style="color: #D8AB44; margin-top: 0; font-size: 24px; font-weight: 700;">Verify Your Email Address</h1>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff;">Welcome ${name}!</p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #F5EFE2; opacity: 0.9;">
      Thank you for joining <strong>Glanz Premium Car Wash</strong>.
      To activate your account and verify your email address, please click the button below:
    </p>
    
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn-gold" aria-label="Verify your email address" style="display: inline-block; background-color: #D8AB44; color: #0B0B0B !important; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 8px; margin: 15px 0; text-align: center; letter-spacing: 0.5px;">
        Verify Email Address
      </a>
    </div>
    
    <p style="margin: 20px 0 10px 0; font-size: 14px; color: #F5EFE2; opacity: 0.8;">
      If you did not create an account at Glanz Premium Car Wash, you can safely ignore this email.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #2E2E2E; margin: 30px 0;" />
    
    <p style="margin: 0; font-size: 12px; color: #F5EFE2; opacity: 0.7; word-break: break-all;">
      If the button above doesn't work, click this link or copy and paste this URL into your browser: <br />
      <a href="${verifyUrl}" style="color: #D8AB44; text-decoration: underline;" aria-label="Email verification URL">${verifyUrl}</a>
    </p>
  `;

  return emailLayout(content, "Activate Your Account - Glanz Premium Car Wash");
};

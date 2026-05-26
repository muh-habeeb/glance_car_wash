import { env } from "../config/env.js";
import { emailLayout } from "./layout.js";

/**
 * Account Deletion Scheduled Email Template
 * Informs the user their account will be permanently deleted in 7 days.
 */
export const getDeleteAccountTemplate = (name: string, scheduledDate: Date): string => {
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const content = `
    <p style="font-size: 16px; color: #ffffff; margin: 0 0 8px 0;">Hello ${name},</p>
    <p style="font-size: 15px; color: #F5EFE2; margin: 0 0 24px 0; opacity: 0.9;">
      We've received a request to permanently delete your Glanz Premium Car Wash account.
    </p>

    <div style="background-color: #1a0a0a; border: 1px solid #7f1d1d; border-radius: 10px; padding: 20px 24px; margin: 0 0 24px 0;">
      <p style="font-size: 13px; color: #fca5a5; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Scheduled Deletion Date</p>
      <p style="font-size: 22px; color: #f87171; font-weight: 800; margin: 0;">${formattedDate}</p>
    </div>

    <p style="font-size: 14px; color: #F5EFE2; margin: 0 0 12px 0; opacity: 0.9;">
      Your account has been <strong style="color: #ffffff;">deactivated immediately</strong> and will be permanently and irrecoverably deleted on the date above.
    </p>

    <p style="font-size: 14px; color: #F5EFE2; margin: 0 0 24px 0; opacity: 0.9;">
      <strong style="color: #D8AB44;">Changed your mind?</strong> Simply log back into your account before this date and your deletion request will be automatically cancelled.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${env.FRONTEND_URL}/login" class="btn-gold" aria-label="Log back in to cancel account deletion"
         style="display: inline-block; background-color: #D8AB44; color: #0B0B0B !important; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 8px; letter-spacing: 0.5px;">
        Cancel Deletion — Log Back In
      </a>
    </div>

    <p style="font-size: 12px; color: #F5EFE2; margin: 24px 0 0 0; border-top: 1px solid #2E2E2E; padding-top: 16px; opacity: 0.7;">
      If you did not request this deletion, please contact our support immediately at 
      <a href="mailto:${env.SUPPORT_EMAIL}" style="color: #D8AB44; text-decoration: none;" aria-label="Contact support email">${env.SUPPORT_EMAIL}</a>.
      Your data remains safe until the scheduled date.
    </p>
  `;

  return emailLayout(content, "Account Deletion Scheduled — Glanz Premium Car Wash");
};

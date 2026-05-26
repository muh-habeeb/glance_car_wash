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
    <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 8px 0;">Hello ${name},</p>
    <p style="font-size: 15px; color: #9ca3af; margin: 0 0 24px 0;">
      We've received a request to permanently delete your Glance Premium Car Wash account.
    </p>

    <div style="background-color: #1a0a0a; border: 1px solid #7f1d1d; border-radius: 10px; padding: 20px 24px; margin: 0 0 24px 0;">
      <p style="font-size: 13px; color: #fca5a5; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Scheduled Deletion Date</p>
      <p style="font-size: 22px; color: #f87171; font-weight: 800; margin: 0;">${formattedDate}</p>
    </div>

    <p style="font-size: 14px; color: #9ca3af; margin: 0 0 12px 0;">
      Your account has been <strong style="color: #e5e7eb;">deactivated immediately</strong> and will be permanently and irrecoverably deleted on the date above.
    </p>

    <p style="font-size: 14px; color: #9ca3af; margin: 0 0 24px 0;">
      <strong style="color: #d4a943;">Changed your mind?</strong> Simply log back into your account before this date and your deletion request will be automatically cancelled.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${env.FRONTEND_URL}/login" class="btn-gold"
         style="display: inline-block; background-color: #d4a943; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 8px; letter-spacing: 0.5px;">
        Cancel Deletion — Log Back In
      </a>
    </div>

    <p style="font-size: 12px; color: #6b7280; margin: 24px 0 0 0; border-top: 1px solid #1f2937; padding-top: 16px;">
      If you did not request this deletion, please contact our support immediately at 
      <a href="mailto:support@glancepremiumcarwash.com" style="color: #d4a943; text-decoration: none;">support@glancepremiumcarwash.com</a>.
      Your data remains safe until the scheduled date.
    </p>
  `;

  return emailLayout(content, "Account Deletion Scheduled — Glance Premium Car Wash");
};

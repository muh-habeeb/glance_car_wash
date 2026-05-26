import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { getResetPasswordTemplate } from "../templates/resetPasswordTemplate.js";
import { getVerifyEmailTemplate } from "../templates/verifyEmailTemplate.js";
import { getDeleteAccountTemplate } from "../templates/deleteAccountTemplate.js";
import logger from "../utils/logger.js";

// Initialize secure Gmail/SMTP transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10),
  secure: env.SMTP_PORT === "465", // true for 465, false for 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Sends a password reset email using the premium black/gold HTML template
 */
export const sendResetPasswordEmail = async (to: string, name: string, resetUrl: string): Promise<void> => {
  try {
    const htmlContent = getResetPasswordTemplate(name, resetUrl);
    
    await transporter.sendMail({
      from: `"Glance Premium Car Wash" <${env.SMTP_USER}>`,
      to,
      subject: "Reset Your Password - Glance Premium Car Wash",
      html: htmlContent,
    });
    
    logger.info(`Password reset email successfully sent to ${to}`);
  } catch (error) {
    logger.error(error, `Failed to send password reset email to ${to}:`);
  }
};

/**
 * Sends an email verification link using the premium black/gold HTML template
 */
export const sendVerificationEmail = async (to: string, name: string, verifyUrl: string): Promise<void> => {
  try {
    const htmlContent = getVerifyEmailTemplate(name, verifyUrl);
    
    await transporter.sendMail({
      from: `"Glance Premium Car Wash" <${env.SMTP_USER}>`,
      to,
      subject: "Activate Your Account - Glance Premium Car Wash",
      html: htmlContent,
    });
    
    logger.info(`Email verification link successfully sent to ${to}`);
  } catch (error) {
    logger.error(error, `Failed to send email verification to ${to}:`);

  }
};

/**
 * Sends a 7-day account deletion scheduled warning email
 */
export const sendDeleteAccountEmail = async (to: string, name: string, scheduledDate: Date): Promise<void> => {
  try {
    const htmlContent = getDeleteAccountTemplate(name, scheduledDate);

    await transporter.sendMail({
      from: `"Glance Premium Car Wash" <${env.SMTP_USER}>`,
      to,
      subject: "Account Deletion Scheduled — Glance Premium Car Wash",
      html: htmlContent,
    });

    logger.info(`Account deletion warning email sent to ${to}`);
  } catch (error) {
    logger.error(error, `Failed to send account deletion email to ${to}:`);
  }
};

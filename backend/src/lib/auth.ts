/* eslint-disable @typescript-eslint/no-explicit-any */
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { sendResetPasswordEmail, sendVerificationEmail, sendDeleteAccountEmail } from "../services/mailer.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const disposableDomains = require("disposable-email-domains") as string[];
import { extraBurners } from "./burnerDomains.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL, ...(env.CORS_ORIGIN || [])],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    }
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      whatsapp: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "USER" },
      is_active: { type: "boolean", required: false, defaultValue: true },
    },
    changeEmail: {
      enabled: true,
      // Verification email is sent to the NEW address by default.
      // sendChangeEmailConfirmation (current email) is optional - skipped for simplicity.
    },
    deleteUser: {
      enabled: true,
      /**
       * beforeDelete — intercept the hard-delete and schedule a soft delete instead.
       * We:
       *   1. Mark user as inactive (is_active = false)
       *   2. Upsert an AccountDeletion record (7-day window)
       *   3. Send a deletion scheduled email
       *   4. Throw APIError to CANCEL the actual hard delete by Better Auth
       */
      beforeDelete: async (user) => {
        const scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + 7);

        await prisma.$transaction(async (tx) => {
          // Mark account as inactive immediately
          await tx.user.update({
            where: { id: user.id },
            data: { is_active: false },
          });

          // Schedule permanent deletion after 7 days
          await tx.accountDeletion.upsert({
            where: { userId: user.id },
            update: {
              status: "PENDING",
              scheduledFor,
              name: user.name,
              email: user.email,
              forceDelete: false,
              deletedBy: "self",
            },
            create: {
              userId: user.id,
              status: "PENDING",
              scheduledFor,
              name: user.name,
              email: user.email,
              phone: null,
              forceDelete: false,
              deletedBy: "self",
            },
          });
        });

        // Send 7-day deletion warning email (fire-and-forget)
        void sendDeleteAccountEmail(user.email, user.name, scheduledFor).catch(() => { });

        // Throw to cancel Better Auth's hard delete — our cron handles the real deletion
        throw new APIError("BAD_REQUEST", {
          message:
            "Account deletion has been scheduled. Your account will be permanently deleted in 7 days. Log back in before then to cancel.",
        });
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check for burner emails
          const emailDomain = user.email.split('@')[1]?.toLowerCase();
          if (emailDomain && (disposableDomains.includes(emailDomain) || extraBurners.includes(emailDomain))) {
            throw new APIError("BAD_REQUEST", {
              message: "Registration rejected. Burner emails are not allowed.",
            });
          }

          // Check if email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (existingUser) {
            throw new APIError("BAD_REQUEST", {
              message: "This email address is already registered.",
            });
          }

          // Password is set only for Credentials (Email & Password) signups.
          // For those, phone must be mandatory.
          if (user.password && !user.phone) {
            throw new Error("Phone number is required");
          }
          return {
            data: user
          };
        }
      }
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { accountDeletion: true },
          });

          if (user && !user.is_active) {
            const deletion = user.accountDeletion;
            if (deletion) {
              if (deletion.forceDelete) {
                // Suspended by Admin - strictly blocked from logging in
                throw new APIError("UNAUTHORIZED", {
                  message: "Your account has been deactivated by an Administrator. Please contact support.",
                });
              } else {
                // Self-deleted - restore immediately on login
                await prisma.$transaction(async (tx) => {
                  await tx.user.update({
                    where: { id: user.id },
                    data: { is_active: true },
                  });
                  await tx.accountDeletion.update({
                    where: { id: deletion.id },
                    data: { status: "CANCELLED" },
                  });
                });
              }
            } else {
              // Inactive without a deletion record
              throw new APIError("UNAUTHORIZED", {
                message: "Your account is deactivated. Please contact an Administrator.",
              });
            }
          }

          return {
            data: session,
          };
        }
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const frontendUrl = Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN[0] : env.CORS_ORIGIN;
      const customUrl = `${frontendUrl}/login?verifyToken=${token}`;
      await sendVerificationEmail(user.email, user.name, customUrl);
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const frontendUrl = Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN[0] : env.CORS_ORIGIN;
      const customUrl = `${frontendUrl}/reset-password?token=${token}`;
      await sendResetPasswordEmail(user.email, user.name, customUrl);
    },
    password: {
      hash: async (password) => {
        const bcrypt = await import("bcrypt");
        return await bcrypt.hash(password, 12);
      },
      verify: async ({ password, hash }) => {
        const bcrypt = await import("bcrypt");
        return await bcrypt.compare(password, hash);
      }
    }
  },
  socialProviders: {
    ...(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
      ? {
        facebook: {
          clientId: env.FACEBOOK_CLIENT_ID,
          clientSecret: env.FACEBOOK_CLIENT_SECRET,
        },
      }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
      : {}),
  },
  plugins: [
    dash(),
    {
      id: "signup-validator",
      hooks: {
        before: [
          {
            matcher: (context) => context.path === "/sign-up/email",
            handler: async (context) => {
              const body = context.body as any;
              if (body?.email) {
                const existing = await prisma.user.findUnique({
                  where: { email: body.email.toLowerCase().trim() }
                });
                if (existing) {
                  throw new APIError("BAD_REQUEST", {
                    message: "This email address is already registered."
                  });
                }
              }
            }
          }
        ]
      }
    }
  ]
});

/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

// Safe domain check regex
const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const urlListSchema = z.string().transform((val) => {
  return val.split(",").map((s) => s.trim());
}).superRefine((origins, ctx) => {
  for (const origin of origins) {
    try {
      const url = new URL(origin);

      // Enforce security protocol rules:
      // Production mode MUST be https only. Development/Test mode can be http or https.
      if (isProd) {
        if (url.protocol !== "https:") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `HTTP is not allowed in production. URL must start with 'https://'. Received: ${origin}`
          });
          return;
        }

        const hostname = url.hostname;
        const isIP = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

        // Strict domain verification for prod URLs (except IP/localhost overrides)
        if (!isIP && !domainRegex.test(hostname)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid domain format in production. Received: ${origin}`
          });
          return;
        }
      } else {
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `URL must start with 'http://' or 'https://'. Received: ${origin}`
          });
          return;
        }
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid URL format. Received: ${origin}`
      });
      return;
    }
  }
});

export const env = createEnv({
  server: {
    FRONTEND_URL: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: urlListSchema,
    ALLOWED_HELMET_URL: urlListSchema,
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3500),
    JWT_SECRET: z.string().min(8),
    JWT_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    SUPERADMIN_EMAIL: z.email(),
    SUPERADMIN_PASSWORD: z.string().min(8),
    SENTRY_DSN: z.url().optional(),
    ENABLE_SENTRY: z.coerce.boolean().default(false),

    // Better Auth
    BETTER_AUTH_URL: z.url().default("http://localhost:3500"),
    BETTER_AUTH_SECRET: z.string().min(8).default("development_secret_only"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),

    // SMTP Mailer
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().default("587"),
    SMTP_USER: z.email(),
    SMTP_PASS: z.string().min(1),
    SUPPORT_EMAIL: z.email(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

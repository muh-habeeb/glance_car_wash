import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

// Safe domain check regex
const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const urlListSchema = z.string().transform((val) => {
  return val.split(",").map((s) => s.trim());
}).refine((origins) => {
  for (const origin of origins) {
    try {
      const url = new URL(origin);
      
      // Enforce security protocol rules:
      // Production mode MUST be https only. Development/Test mode can be http or https.
      if (isProd) {
        if (url.protocol !== "https:") return false;
        
        const hostname = url.hostname;
        const isIP = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
        
        // Strict domain verification for prod URLs (except IP/localhost overrides)
        if (!isIP && !domainRegex.test(hostname)) {
          return false;
        }
      } else {
        if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: isProd
    ? "Must be a single secure HTTPS URL, or multiple separated by commas in production."
    : "Must be a single valid HTTP or HTTPS URL, or multiple separated by commas in development."
});

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: urlListSchema,
    ALLOWED_HELMET_URL: urlListSchema,
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("3500"),
    JWT_SECRET: z.string().min(8),
    JWT_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    SENTRY_DSN: z.string().url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

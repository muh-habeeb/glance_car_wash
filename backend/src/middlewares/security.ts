/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

// Helper to generate alternate www/non-www domain variants for strict CSP headers
const generateWwwVariants = (origins: string[]): string[] => {
  return origins.flatMap((origin) => {
    try {
      const url = new URL(origin);
      // Skip IPs and localhosts
      const isIP = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) || url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (isIP) return [origin];

      const hasWww = url.hostname.startsWith("www.");
      const altHostname = hasWww
        ? url.hostname.replace(/^www\./i, "")
        : `www.${url.hostname}`;

      const altUrl = `${url.protocol}//${altHostname}${url.port ? `:${url.port}` : ""}`;
      return [origin, altUrl];
    } catch {
      return [origin];
    }
  });
};

/**
 * Configure Helmet with secure defaults for production.
 * Prevents clickjacking, content sniffing, X-XSS-Protection, and enforces SSL (HSTS).
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: env.NODE_ENV === "production"
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          // Restrict API connect requests to only trusted origins from ALLOWED_HELMET_URL and self,
          // including both www and non-www variations automatically for security.
          connectSrc: ["'self'", ...generateWwwVariants(env.ALLOWED_HELMET_URL)],
          upgradeInsecureRequests: [],
        },
      }
    : false, // Next.js dev server may need CSP disabled in local dev, customized if in production
  crossOriginEmbedderPolicy: env.NODE_ENV === "production",
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hsts: env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

/**
 * Helper to match incoming origin against allowed origins list,
 * automatically permitting both www and non-www variants.
 */
const matchOrigin = (incoming: string, allowedList: string[]): boolean => {
  return allowedList.some((allowed) => {
    if (incoming === allowed) return true;

    try {
      const incomingUrl = new URL(incoming);
      const allowedUrl = new URL(allowed);

      // Protocols must match (e.g. http with http, https with https)
      if (incomingUrl.protocol !== allowedUrl.protocol) return false;

      // Ports must match
      if (incomingUrl.port !== allowedUrl.port) return false;

      // Strip leading 'www.' from both hostnames to verify base domain match
      const incomingHost = incomingUrl.hostname.replace(/^www\./i, "");
      const allowedHost = allowedUrl.hostname.replace(/^www\./i, "");

      return incomingHost === allowedHost;
    } catch {
      return false;
    }
  });
};

/**
 * Configures CORS options.
 * Restricts access strictly to the CORS_ORIGIN environment variable list.
 * Enables credentials (cookies) sharing safely.
 */
export const corsOptions = cors({
  origin: (origin, callback) => {
    // In development, allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      if (env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: origin header is required."));
      }
      return;
    }

    // Match origin against the array of trusted domains (supporting www/non-www auto-matching)
    if (matchOrigin(origin, env.CORS_ORIGIN)) {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by CORS: origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

/**
 * General rate limiter to prevent DDoS and Brute Force attacks.
 * Max 100 requests per 15 minutes per IP address.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  skip: (req) => env.NODE_ENV === "test", // Skip rate limiting in test env
});

/**
 * Custom security headers middleware to enforce standard protections
 */
export const customSecurityHeaders = (req: any, res: any, next: any) => {
  // Disable X-Powered-By completely (Express handles this, but good to double enforce)
  res.removeHeader("X-Powered-By");

  // Custom server-side headers
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
};

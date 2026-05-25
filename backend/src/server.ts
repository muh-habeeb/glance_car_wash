/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

/* eslint-disable no-console */
import express from "express";
import cookieParser from "cookie-parser";
import {
  securityHeaders,
  corsOptions,
  globalRateLimiter,
  customSecurityHeaders,
} from "./middlewares/security.js";
import { errorHandler } from "./middlewares/error.js";
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";
import { initDeletionSweeper } from "./services/deletionSweeper.js";
import { initSuperAdmin } from "./services/superAdminSeeder.js";

const app = express();

// Initialize Cron Jobs
initDeletionSweeper();

// Initialize Super Admin (Upsert from env)
initSuperAdmin();

// Conditionally Initialize Sentry 
if (env.ENABLE_SENTRY && env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
  });
}

// --- Server Configuration & Trust Proxy ---
// Trust reverse proxy (e.g. Nginx, Cloudflare, Heroku) in production.
// Required for accurate IP rate limiting.
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- Middleware Setup ---

// 1. Hook up core security headers and custom headers
app.use(securityHeaders);
app.use(customSecurityHeaders);

// 1.5. Request Logging (Must be before routes)
app.use(loggerMiddleware);

// 2. Setup CORS configurations
app.use(corsOptions);

// 3. Setup rate limiter to protect all routes
app.use(globalRateLimiter);

// 4. Request parsing with payload limits to prevent large-body attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Parse cookie headers securely
app.use(cookieParser());

// --- API Routes ---

// user authentication routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Test Route: Public
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// // Test Route: Error (for GlitchTip validation)
// app.get("/error", (req, res) => {
//   throw new Error("Test error for GlitchTip");
// });

// 6. Sentry Express Error Handler (MUST be before your custom error handlers)
if (env.ENABLE_SENTRY) {
  Sentry.setupExpressErrorHandler(app);
}

// 7. Global safe error handling middleware (must be registered last)
app.use(errorHandler);

const PORT = env.PORT;
const server = app.listen(PORT, () => {

  console.log(`=============================================`);
  console.log(`  GLANCE CAR WASH - SECURE SERVER STARTED    `);
  console.log(`  Port:        ${PORT}                          `);
  console.log(`  Environment: ${env.NODE_ENV}                  `);
  console.log(`=============================================`);
});

export default server;

/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

/* eslint-disable no-console */
import path from "path";
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
import { requestContextMiddleware } from "./middlewares/requestContext.js";
import { env } from "./config/env.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import * as Sentry from "@sentry/node";
import { initDeletionSweeper } from "./services/deletionSweeper.js";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";
// import { initSuperAdmin } from "./services/superAdminSeeder.js";
import { prisma } from "./config/prisma.js";



const app = express();
app.set("trust proxy", 1); // Trust first proxy (NGINX/Vercel) for Secure cookies

// Initialize Cron Jobs
initDeletionSweeper();

// Initialize Super Admin (Upsert from env)
// initSuperAdmin(); // Commented out as requested

// Database connection polling system
const startDatabasePolling = async () => {
  let connected = false;
  while (!connected) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      console.log("Database connected successfully.");
      // If needed in the future, initSuperAdmin() can be called here once connected.
    } catch (error: any) {
      if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
        console.log("Cannot connect to db. Retrying in 5 seconds...");
      } else {
        console.log("Database error:", error.message || "Unknown error");
      }
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Start the polling
startDatabasePolling();

// Conditionally Initialize Sentry 
if (env.ENABLE_SENTRY == true && env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
  });
} else {
  console.log("sentry logging disabled")
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

// Serve static assets (e.g. logos)
app.use("/assets", express.static(path.join(process.cwd(), "src/assets")));

// 1.5. Request Logging (Must be before routes)
app.use(loggerMiddleware);

// 2. Setup CORS configurations
app.use(corsOptions);

// 3. Setup rate limiter to protect all routes
app.use(globalRateLimiter);


// --- API Routes ---
// 3.5. Parse cookie headers securely BEFORE auth routes
app.use(cookieParser());

// 3.6. Better Auth mount (MUST be before express.json to preserve request body stream)
// Ensure requestContext is injected for auth hooks
app.use(requestContextMiddleware);
// Intercept Better Auth responses to handle state_mismatch redirects
app.all("/api/auth/*splat", (req, res, next) => {
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'location' && typeof value === 'string') {
      if (value.includes("error=state_mismatch") || value.includes("error=invalid_state")) {
        console.error(`[Auth Error]: State mismatch detected during OAuth. Redirecting user to login page.`);
        value = `${env.FRONTEND_URL || "http://localhost:3000"}/login?error=state_mismatch`;
      } else if (value.includes("error=Phone_number_is_required")) {
        console.error(`[Auth Error]: Phone number missing during social login. Redirecting user to signup page.`);
        value = `${env.FRONTEND_URL || "http://localhost:3000"}/signup?error=missing_phone`;
      }
    }
    return originalSetHeader(name, value);
  };
  toNodeHandler(auth)(req, res);
});

// 4. Request parsing with payload limits to prevent large-body attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Removed cookieParser from here (moved above)

// --- API Routes ---

// user profile and admin routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Better Auth wildcard route


// Test Route: Public
app.get("/api/health", (req, res) => {
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

// Serve favicon to prevent browser 404 warnings
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(process.cwd(), "src", "assets", "logo", "gold_logo_no_text.png"));
});

// 404 Route Not Found Handler
app.use((req, res) => {
  if (req.path === "/") {
    return res.redirect(env.FRONTEND_URL);
  }
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 6. Sentry Express Error Handler (MUST be before your custom error handlers)
if (env.ENABLE_SENTRY) {
  Sentry.setupExpressErrorHandler(app);
}

// 7. Global safe error handling middleware (must be registered last)
app.use(errorHandler);

const PORT = env.PORT;
const server = app.listen(PORT, "0.0.0.0", () => {

  console.log(`=============================================`);
  console.log(`  GLANZ CAR WASH - SECURE SERVER STARTED    `);
  console.log(`  Port:        ${PORT}                          `);
  console.log(`  Environment: ${env.NODE_ENV}                  `);
  console.log(`=============================================`);
});

export default server;

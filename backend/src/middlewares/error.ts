/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { captureException } from "@sentry/node";
import logger from "../utils/logger.js";

/**
 * Global Error Handler Middleware.
 * Prevents sensitive details (stack traces, server file paths) from leaking to client in production.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Use the Pino logger injected by pino-http, fallback to global logger
  const log = req.log || logger;

  // Log full error details securely on the server
  log.error({
    err,
    endpoint: req.originalUrl,
    body: req.body,
    method: req.method,
  }, `[Server Error] ${err.name || "Error"}: ${message}`);

  // Send the error to GlitchTip / Sentry
  captureException(err);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message:
      env.NODE_ENV === "production" && statusCode === 500
        ? "An unexpected error occurred. Please contact support or try again later."
        : message,
    // Include stack trace only in development
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

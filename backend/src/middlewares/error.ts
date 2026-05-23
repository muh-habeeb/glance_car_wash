import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

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

  // Log error locally on the server (stdout/stderr) for debugging
  console.error(`[Server Error] ${err.name || "Error"}: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

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

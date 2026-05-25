/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { pinoHttp } from "pino-http";
import logger from "../utils/logger.js";
import crypto from "crypto";

// Middleware to log API requests and responses using Pino
export const loggerMiddleware = pinoHttp({
  logger,
  
  // Custom request id generator (correlation id)
  genReqId: (req) => {
    return req.id || req.headers["x-request-id"] || crypto.randomUUID();
  },

  // Custom log level to reduce noise for successful static file requests, etc.
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  // Customize standard log messages
  customSuccessMessage: (req, res) => {
    return `[${req.method}] ${req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `[${req.method}] ${req.url} failed with ${res.statusCode}: ${err.message}`;
  },

  // Add custom properties to the log
  customProps: (req, res) => {
    return {
      ip: (req as any).ip || req.socket?.remoteAddress,
      // Attempt to extract user id if authenticated
      userId: (req as any).user?.userId || "unauthenticated",
    };
  },
});

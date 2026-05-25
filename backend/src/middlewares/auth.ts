/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { User, Session } from "better-auth";

// Extend express Request definition locally
export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: Session;
}

/**
 * Authentication middleware to verify access tokens.
 * Checks the Better Auth session natively.
 */
export const authenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionContext = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionContext) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    req.user = sessionContext.user as User;
    req.session = sessionContext.session as Session;
    next();
  } catch (error) {
    req.log?.error(error);
    res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
};

/**
 * Authorization middleware to check if the user is an ADMIN or SUPERADMIN.
 * Must be used AFTER the `authenticated` middleware.
 */
export const authorizedAsAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // role is defined as string in User via additionalFields
  // Using type assertion since BetterAuth User type might not strictly type custom fields by default
  const userRole = (req.user as any)?.role;
  if (req.user && (userRole === "ADMIN" || userRole === "SUPERADMIN")) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Permission denied. Admins only." });
  }
};

/**
 * Authorization middleware to check if the user is explicitly a SUPERADMIN.
 */
export const authorizedAsSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userRole = (req.user as any)?.role;
  if (req.user && userRole === "SUPERADMIN") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Permission denied. Super Admins only." });
  }
};

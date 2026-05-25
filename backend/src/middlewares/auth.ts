import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt.js";

// Extend express Request definition locally
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Authentication middleware to verify access tokens.
 * Checks for token in HTTP-only cookies or standard Authorization header.
 */
export const authenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ success:false, message: "Authentication required" }); 
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    req.log?.error(error);
    res.status(401).json({ success:false, message: "Invalid or expired session token" });
  }
};

/**
 * Authorization middleware to check if the user is an ADMIN.
 * Must be used AFTER the `authenticated` middleware.
 */
export const authorizedAsAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Permission denied. Admins only." });
  }
};

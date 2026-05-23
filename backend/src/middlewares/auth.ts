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
export const authenticate = (
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
      res.status(418).json({ message: "Authentication required" }); // using 418 or 401. Let's use 401 Unauthorized as standard!
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session token" });
  }
};

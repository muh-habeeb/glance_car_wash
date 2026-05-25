/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env.js";

export interface TokenPayload {
  userId: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Signs an access token
 */
export const signAccessToken = (payload: TokenPayload, expiresIn?: string | number): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (expiresIn || env.JWT_EXPIRES_IN) as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Signs a refresh token
 */
export const signRefreshToken = (payload: TokenPayload, expiresIn?: string | number): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (expiresIn || env.JWT_REFRESH_EXPIRES_IN) as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Sets secure HTTP-only cookies for authentication tokens
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProd = env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict", // Maximum security against CSRF
    maxAge: 5 * 60 * 1000, // 5 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Verifies any token and returns the decoded payload
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid or expired token: ${error.message}`, { cause: error });
    }
    throw new Error("Invalid or expired token", { cause: error });
  }
};

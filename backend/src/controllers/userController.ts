/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken, setAuthCookies, verifyToken } from "../utils/jwt.js";

// --- Validation Schemas ---

const userAuthSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 8 characters"),
  phone: z.string()
    .regex(/^\+[1-9]\d{6,14}$/, "Must be a valid  phone number starting with '+' and country code"),
  whatsapp: z.string()
    .regex(/^\+[1-9]\d{6,14}$/, "Must be a valid  phone number starting with '+' and country code")
    .optional(),
});

// --- Controller Functions ---

/**
 * Handle User Registration.
 * Accepts name, email, password, and phone.
 * Creates a new user if the email does not exist.
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = userAuthSchema.parse(req.body);
    const { name, email, password, phone, whatsapp } = validatedData;

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      res.status(409).json({ success: false, message: "Email is already registered" });
      return;
    }

    const saltRounds = 12; // Maximum security hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        whatsapp,
        role: "USER",
        is_active: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please log in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err: z.core.$ZodIssue) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error });
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Handle User Login.
 * Verifies credentials and issues short-lived secure JWTs.
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: "User dose not exist!" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (!user.is_active) {
      // Check if this account is just pending deletion
      const pendingDeletion = await prisma.accountDeletion.findUnique({
        where: { userId: user.id }
      });
      //if the user si delted by admin show error
      if (pendingDeletion && pendingDeletion.status === "PENDING") {
        if (pendingDeletion.forceDelete) {
          res.status(403).json({ success: false, message: "Your account has been deactivated by an Administrator. Please contact support." });
          return;
        }

        // If the user delted by himself welcome back them
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { is_active: true }
          });
          await tx.accountDeletion.update({
            where: { id: pendingDeletion.id },
            data: { status: "CANCELLED" }
          });
        });

        user.is_active = true; // Update local object so login succeeds
      } else {
        res.status(403).json({ success: false, message: "Account is disabled. Please contact support." });
        return;
      }
    }

    const payload = { userId: user.id, email: user.email, role: user.role };

    // Using short-lived token logic via utility functions
    const accessToken = signAccessToken(payload, '7m'); // 7 minutes TTL
    const refreshToken = signRefreshToken(payload, '7d');

    // Securely set the tokens in HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsapp: user.whatsapp,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err: z.ZodIssue) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Handle User Logout.
 * Clears the secure JWT cookies.
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

/**
 * Get User Profile.
 * Returns the currently authenticated user's details.
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        is_active: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string()
    .regex(/^\+[1-9]\d{6,14}$/, "Must be a valid  phone number starting with '+' and country code"),
  whatsapp: z.string()
    .regex(/^\+[1-9]\d{6,14}$/, "Must be a valid  phone number starting with '+' and country code")
    .optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
  currentPassword: z.string().optional(),
}).refine((data) => {
  if (data.password) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Check for forbidden fields directly in request body to throw explicit 403
    const forbiddenFields = ["role", "is_active", "id", "email"];
    for (const field of forbiddenFields) {
      if (req.body[field] !== undefined) {
        res.status(403).json({ success: false, message: `Permission denied. You cannot update the '${field}' field.` });
        return;
      }
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const { name, phone, whatsapp, password, currentPassword } = validatedData;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    let updatedPassword = user.password;

    // Handle password update logic safely
    if (password) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: "Current password is required to set a new password." });
        return;
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(401).json({ success: false, message: "Incorrect current password." });
        return;
      }

      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        res.status(400).json({ success: false, message: "Please choose a new password. The new password cannot be the same as the old password." });
        return;
      }

      updatedPassword = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        phone: phone || user.phone,
        whatsapp: whatsapp || user.whatsapp,
        password: updatedPassword,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        // role:true,
        is_active: true,
      },
    });

    res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err: z.ZodIssue) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Handle Token Refresh.
 * Reads the secure refresh token cookie and issues a new access token.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ success: false, message: "No refresh token provided. Please log in again." });
      return;
    }

    // Verify the refresh token
    const decoded = verifyToken(token) as { userId: string };

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.is_active) {
      res.status(401).json({ success: false, message: "Session invalid or account disabled" });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };

    // Issue a fresh access token (7 minutes)
    const newAccessToken = signAccessToken(payload, '7m');
    // Issue a fresh refresh token (7 days)
    const newRefreshToken = signRefreshToken(payload, '7d');

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    // If the refresh token is expired or invalid, force logout
    req.log?.error(error);
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.status(401).json({ success: false, message: "Refresh token expired. Please log in again." });
  }
};

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const validatedData = deleteAccountSchema.parse(req.body);
    const { password } = validatedData;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Incorrect password" });
      return;
    }

    // Calculate exactly 7 days from now
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 7);

    // Soft delete user and create AccountDeletion record inside a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { is_active: false },
      });

      await tx.accountDeletion.upsert({
        where: { userId: userId },
        update: {
          status: "PENDING",
          scheduledFor: scheduledFor,
          name: user.name,
          email: user.email,
          phone: user.phone,
          forceDelete: false,
          deletedBy: "self",
        },
        create: {
          userId: userId,
          status: "PENDING",
          scheduledFor: scheduledFor,
          name: user.name,
          email: user.email,
          phone: user.phone,
          forceDelete: false,
          deletedBy: "self",
        }
      });
    });

    // Log the user out by clearing the secure auth cookies
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    res.status(200).json({
      success: true,
      message: "Account deletion requested. Your account has been deactivated and will be permanently deleted in 7 days. If you wish to cancel this deletion, simply log back in."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err: z.ZodIssue) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
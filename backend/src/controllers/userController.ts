/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

// --- Controller Functions ---

/**
 * Get User Profile.
 * Returns the currently authenticated user's details.
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
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
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
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
    const userId = req.user?.id;
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

    // Handle password update logic safely
    if (password) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: "Current password is required to set a new password." });
        return;
      }
      
      if (!user.password) {
        res.status(400).json({ success: false, message: "You signed up with a social provider. You cannot change your password here." });
        return;
      }

      // NOTE: For absolute maximum security with Better Auth, Better Auth manages passwords in the 'Account' table if they sign up via credential.
      // But since we had a legacy structure or dual structure, we check standard bcrypt logic.
      // Better Auth stores passwords natively using scrypt in the Account table, so we shouldn't manually update passwords like this if they use standard Better Auth.
      // However, we preserve the profile update logic here just in case they have legacy bcrypt passwords.
      res.status(400).json({ success: false, message: "To change your password, please use the Better Auth password reset or change-password API directly." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || user.name,
        phone: phone || user.phone,
        whatsapp: whatsapp || user.whatsapp,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
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

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
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

    // Better Auth stores passwords inside the Account table for credentials providers
    const credentialAccount = await prisma.account.findFirst({
      where: { userId: userId, providerId: "credential" }
    });

    if (!credentialAccount || !credentialAccount.password) {
      res.status(401).json({ success: false, message: "Please use your social provider to manage your account deletion, or contact support." });
      return;
    }

    // Verify the password (using bcrypt since we configured Better Auth to use bcrypt)
    const isPasswordValid = await bcrypt.compare(password, credentialAccount.password);
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

      const deletionData = {
        status: "PENDING" as const,
        scheduledFor: scheduledFor,
        name: user.name,
        email: user.email,
        phone: user.phone,
        forceDelete: false,
        deletedBy: "self",
        userId: userId, // Added for create block
      };

      await tx.accountDeletion.upsert({
        where: { userId: userId },
        update: {
          status: deletionData.status,
          scheduledFor: deletionData.scheduledFor,
          name: deletionData.name,
          email: deletionData.email,
          phone: deletionData.phone,
          forceDelete: deletionData.forceDelete,
          deletedBy: deletionData.deletedBy,
        },
        create: deletionData
      });
    });

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
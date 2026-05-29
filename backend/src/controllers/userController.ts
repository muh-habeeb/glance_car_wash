/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { z } from "zod";
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
        image: true,
        emailVerified: true,
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
  phone: z
    .string()
    .regex(
      /^\+\d{3,14}$/,
      "Must start with country code (+code) and enter a valid number"
    )
    .optional(),
  whatsapp: z
    .string()
    .regex(
      /^\+\d{3,14}$/,
      "Must start with country code (+code) and enter a valid number"
    )
    .optional()
    .or(z.literal("")),
});

/**
 * Update User Profile (name, phone, whatsapp only).
 * Password changes must go through Better Auth's /api/auth/change-password.
 * Email changes must go through Better Auth's /api/auth/change-email.
 * Account deletion goes through Better Auth's /api/auth/delete-user.
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Reject attempts to update sensitive / system-managed fields
    const forbiddenFields = ["role", "is_active", "id", "email", "password", "emailVerified", "image"];
    for (const field of forbiddenFields) {
      if (req.body[field] !== undefined) {
        res.status(403).json({
          success: false,
          message: `Permission denied. '${field}' cannot be updated via this endpoint.`,
        });
        return;
      }
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const { name, phone, whatsapp } = validatedData;

    // Only update provided fields (patch semantics)
    const updateData: Record<string, string | null | undefined> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp === "" ? null : whatsapp;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: "No valid fields provided to update." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        is_active: true,
        image: true,
        emailVerified: true,
      },
    });

    res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`).join(", ");
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
        errors: error.issues.map((err: z.ZodIssue) => ({ path: err.path.join("."), message: err.message })),
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
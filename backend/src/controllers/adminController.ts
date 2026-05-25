/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { z } from "zod";
import bcrypt from "bcrypt";

// --- Validation Schemas ---

const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  whatsapp: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  role: z.enum(["USER", "STAFF", "ADMIN", "SUPERADMIN"]).optional(),
  is_active: z.boolean().optional(),
});

const forceDeleteSchema = z.object({
  adminPassword: z.string().min(1, "Admin password is required to perform a force delete"),
});

const forceDeleteManySchema = z.object({
  userIds: z.array(z.string().trim().uuid()).min(1, "At least one user ID is required"),
  adminPassword: z.string().min(1, "Admin password is required to perform a force delete"),
});

// --- Controller Functions ---

/**
 * Get all users with Pagination and Filtering (Admin Only)
 * Query Params: page, limit, role, is_active, search
 */
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const role = req.query.role as string | undefined;
    const isActiveParam = req.query.is_active as string | undefined;
    const search = req.query.search as string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      role: { not: "SUPERADMIN" }, // Hide Super Admins from the dashboard
      id: { not: req.user?.id } // Don't show the logged-in admin's own details
    };

    if (role && role !== "SUPERADMIN") {
      whereClause.role = role;
    }

    if (isActiveParam !== undefined) {
      whereClause.is_active = isActiveParam === "true";
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [totalUsers, users] = await prisma.$transaction([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
          is_active: true,
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    res.status(200).json({ 
      success: true, 
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      },
      users 
    });
  } catch (error) {
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update any user's profile or role (Admin Only)
 * Protected: Only SUPERADMIN can promote users to ADMIN or SUPERADMIN.
 */
export const updateUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id as string;
    const validatedData = adminUpdateUserSchema.parse(req.body);
    const activeUserRole = (req.user as any)?.role;

    // Strict Role Escalation Check
    if (validatedData.role === "ADMIN" || validatedData.role === "SUPERADMIN") {
      if (activeUserRole !== "SUPERADMIN") {
        res.status(403).json({ 
          success: false, 
          message: "Permission denied. Only a Super Admin can promote a user to Admin or Super Admin level." 
        });
        return;
      }
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Target user not found" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        is_active: true,
      }
    });

    res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Forcibly soft-delete a single user (Admin Only)
 */
export const deleteUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const targetUserId = req.params.id as string;

    if (!adminId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const validatedData = forceDeleteSchema.parse(req.body);
    const { adminPassword } = validatedData;

    const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
    if (!adminUser || !adminUser.password || !(await bcrypt.compare(adminPassword, adminUser.password))) {
      res.status(401).json({ success: false, message: "Incorrect admin password. Force delete aborted." });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Target user not found" });
      return;
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 7);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { is_active: false },
      });

      await tx.accountDeletion.upsert({
        where: { userId: targetUserId },
        update: {
          status: "PENDING",
          scheduledFor,
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone,
          forceDelete: true,
          deletedBy: adminUser.name,
          deletedById: adminUser.id,
        },
        create: {
          userId: targetUserId,
          status: "PENDING",
          scheduledFor,
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone,
          forceDelete: true,
          deletedBy: adminUser.name,
          deletedById: adminUser.id,
        }
      });
    });

    res.status(200).json({ 
      success: true, 
      message: `User ${targetUser.name} has been forcibly deactivated.` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Forcibly soft-delete MULTIPLE users at once (Admin Only)
 */
export const deleteManyById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // 1. Validate payload (Array of User IDs and Admin Password)
    const validatedData = forceDeleteManySchema.parse(req.body);
    const { userIds, adminPassword } = validatedData;

    // 2. Authenticate Admin Password
    const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
    if (!adminUser || !adminUser.password || !(await bcrypt.compare(adminPassword, adminUser.password))) {
      res.status(401).json({ success: false, message: "Incorrect admin password. Force delete aborted." });
      return;
    }

    // 3. Fetch all target users to ensure they exist and to capture their snapshot data
    const targetUsers = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    if (targetUsers.length === 0) {
      res.status(404).json({ success: false, message: "None of the target users were found." });
      return;
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 7);

    // 4. Perform bulk deletions in a transaction
    await prisma.$transaction(async (tx) => {
      // Deactivate all users in the array
      await tx.user.updateMany({
        where: { id: { in: targetUsers.map(u => u.id) } },
        data: { is_active: false },
      });

      // Upsert the tracking ticket for every target user
      for (const targetUser of targetUsers) {
        await tx.accountDeletion.upsert({
          where: { userId: targetUser.id },
          update: {
            status: "PENDING",
            scheduledFor,
            name: targetUser.name,
            email: targetUser.email,
            phone: targetUser.phone,
            forceDelete: true,
            deletedBy: adminUser.name,
            deletedById: adminUser.id,
          },
          create: {
            userId: targetUser.id,
            status: "PENDING",
            scheduledFor,
            name: targetUser.name,
            email: targetUser.email,
            phone: targetUser.phone,
            forceDelete: true,
            deletedBy: adminUser.name,
            deletedById: adminUser.id,
          }
        });
      }
    });

    res.status(200).json({ 
      success: true, 
      message: `Successfully deactivated ${targetUsers.length} user(s).` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const restoreDeletedUserSchema = z.object({
  adminPassword: z.string().min(1, "Admin password is required"),
  confirmEmail: z.string().email().optional(), // Required only if self-deleted
});

/**
 * Get all users currently pending deletion (Admin Only)
 * Query Params: page, limit, forceDelete
 */
export const getAllDeletedUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const forceDeleteParam = req.query.forceDelete as string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: "PENDING",
    };

    if (forceDeleteParam !== undefined) {
      whereClause.forceDelete = forceDeleteParam === "true";
    }

    const [totalPending, pendingDeletions] = await prisma.$transaction([
      prisma.accountDeletion.count({ where: whereClause }),
      prisma.accountDeletion.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          deletedByAdmin: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      })
    ]);

    res.status(200).json({ 
      success: true, 
      pagination: {
        total: totalPending,
        page,
        limit,
        totalPages: Math.ceil(totalPending / limit)
      },
      pendingDeletions 
    });
  } catch (error) {
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Restore a deleted user (Admin Only)
 * If forceDelete == false (self-deleted), admin must provide confirmEmail matching the user.
 */
export const restoreDeletedUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const targetUserId = req.params.id as string;

    if (!adminId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const validatedData = restoreDeletedUserSchema.parse(req.body);
    const { adminPassword, confirmEmail } = validatedData;

    // Verify Admin Password
    const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
    if (!adminUser || !adminUser.password || !(await bcrypt.compare(adminPassword, adminUser.password))) {
      res.status(401).json({ success: false, message: "Incorrect admin password. Restoration aborted." });
      return;
    }

    // Check Deletion Record
    const deletionRecord = await prisma.accountDeletion.findUnique({
      where: { userId: targetUserId }
    });

    if (!deletionRecord || deletionRecord.status !== "PENDING") {
      res.status(404).json({ success: false, message: "No pending deletion record found for this user." });
      return;
    }

    // If self-deleted, force admin to confirm via email typing
    if (!deletionRecord.forceDelete) {
      if (!confirmEmail || confirmEmail !== deletionRecord.email) {
        res.status(400).json({ 
          success: false, 
          message: "This user deleted themselves. You must provide their exact 'confirmEmail' to override their decision and restore the account." 
        });
        return;
      }
    }

    // Restore the account
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { is_active: true },
      });

      await tx.accountDeletion.update({
        where: { userId: targetUserId },
        data: { status: "CANCELLED" },
      });
    });

    res.status(200).json({ 
      success: true, 
      message: `User ${deletionRecord.name} has been successfully restored.` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

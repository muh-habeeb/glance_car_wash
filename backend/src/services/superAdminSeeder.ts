/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import bcrypt from "bcrypt";
import logger from "../utils/logger.js";

/**
 * Ensures that a SUPERADMIN account exists based on environment variables.
 * Upserts the account on server boot so that if the password is changed in .env,
 * it will be updated in the database on next restart.
 */
export const initSuperAdmin = async (): Promise<void> => {
  try {
    const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } = env;

    // Hash the password exactly as we do for normal users (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);

    // 1. Find any existing Super Admins in the database
    const existingSuperAdmins = await prisma.user.findMany({
      where: { role: "SUPERADMIN" },
      orderBy: { createdAt: "asc" }
    });

    let primaryAdmin: any = null;

    if (existingSuperAdmins.length > 0) {
      primaryAdmin = existingSuperAdmins[0];

      // Update primary admin details
      primaryAdmin = await prisma.user.update({
        where: { id: primaryAdmin.id },
        data: {
          email: SUPERADMIN_EMAIL,
          password: hashedPassword,
          is_active: true,
        }
      });

      // Demote any duplicate Super Admins back to regular ADMIN
      if (existingSuperAdmins.length > 1) {
        const duplicateIds = existingSuperAdmins.slice(1).map(u => u.id);
        await prisma.user.updateMany({
          where: { id: { in: duplicateIds } },
          data: { role: "ADMIN" }
        });
        logger.warn(`Demoted ${duplicateIds.length} duplicate super admin(s) to standard ADMIN.`);
      }
    } else {
      // No Super Admin exists. Create one using upsert/create.
      primaryAdmin = await prisma.user.upsert({
        where: { email: SUPERADMIN_EMAIL },
        update: {
          password: hashedPassword,
          role: "SUPERADMIN",
          is_active: true,
        },
        create: {
          name: "Super Admin",
          email: SUPERADMIN_EMAIL,
          password: hashedPassword,
          phone: "+00000000000",
          role: "SUPERADMIN",
          is_active: true,
        },
      });
    }

    // 2. Ensure Better Auth Account table has the credentials record so the user can login
    const accountIdStr = `${primaryAdmin.id}_credential_account`;
    await prisma.account.upsert({
      where: { id: accountIdStr },
      update: {
        accountId: primaryAdmin.id, // Better Auth stores user ID as accountId for providerId: 'credential'
        password: hashedPassword,
      },
      create: {
        id: accountIdStr,
        userId: primaryAdmin.id,
        accountId: primaryAdmin.id,
        providerId: "credential", // Better Auth uses 'credential' for standard email/password provider
        password: hashedPassword,
      }
    });

    logger.info("Super Admin account and Better Auth credentials seeded/verified successfully.");
  } catch (error: any) {
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      logger.error("Cannot connect to db");
    } else {
      logger.error(error.message || "Unknown error", "Failed to seed Super Admin account:");
    }
  }
};

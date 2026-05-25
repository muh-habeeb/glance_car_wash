/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
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
    
    // Hash the password exactly as we do for normal users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);

    // 1. Find any existing Super Admins in the database
    const existingSuperAdmins = await prisma.user.findMany({
      where: { role: "SUPERADMIN" },
      orderBy: { createdAt: "asc" }
    });

    if (existingSuperAdmins.length > 0) {
      // 2. We found at least one. Update the very first one to match the current .env perfectly.
      const primaryAdmin = existingSuperAdmins[0];
      
      await prisma.user.update({
        where: { id: primaryAdmin.id },
        data: {
          email: SUPERADMIN_EMAIL,
          password: hashedPassword,
          is_active: true, // Ensure they are active
        }
      });

      // 3. Demote any accidental duplicate Super Admins back to regular ADMIN
      if (existingSuperAdmins.length > 1) {
        const duplicateIds = existingSuperAdmins.slice(1).map(u => u.id);
        await prisma.user.updateMany({
          where: { id: { in: duplicateIds } },
          data: { role: "ADMIN" }
        });
        logger.warn(`Demoted ${duplicateIds.length} duplicate super admin(s) to standard ADMIN.`);
      }
    } else {
      // 4. No Super Admin exists. Create one from scratch using .env values.
      // Use upsert by email just in case the email is already used by a standard user
      await prisma.user.upsert({
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

    logger.info("Super Admin account seeded/verified successfully.");
  } catch (error) {
    logger.error(error, "Failed to seed Super Admin account:");
  }
};

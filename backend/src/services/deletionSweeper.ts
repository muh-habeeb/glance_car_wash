/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import logger from "../utils/logger.js";
import { cronSchedules } from "../config/cron.js";

/**
 * Sweeps the database daily at midnight for pending account deletions that have reached their scheduled deletion date.
 * Soft deleted accounts are permanently deleted, and their AccountDeletion record is marked as COMPLETED.
 */
export const initDeletionSweeper = () => {
  cron.schedule(cronSchedules.deletionSweeper, async () => {
    logger.info("Running scheduled account deletion sweeper...");
    try {
      const pendingDeletions = await prisma.accountDeletion.findMany({
        where: {
          status: "PENDING",
          scheduledFor: {
            lte: new Date(), // scheduledFor is less than or equal to current time
          },
        },
      });

      if (pendingDeletions.length === 0) {
        logger.info("No accounts scheduled for deletion today.");
        return;
      }

      logger.info(`Found ${pendingDeletions.length} accounts to permanently delete.`);

      for (const record of pendingDeletions) {
        try {
          await prisma.$transaction(async (tx) => {
            // Permanently delete the user (Cascade will handle related user records if any exist)
            await tx.user.delete({ where: { id: record.userId } });

            // Mark the deletion request as completed for historical audit
            await tx.accountDeletion.update({
              where: { id: record.id },
              data: { status: "COMPLETED" },
            });
          });
          logger.info(`Permanently deleted user: ${record.userId}`);
        } catch (err) {
          logger.error(err, `Failed to process deletion for user ${record.userId}:`);
        }
      }
    } catch (error) {
      logger.error(error, "Failed to run account deletion sweeper:");
    }
  });
};

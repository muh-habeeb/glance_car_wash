/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

/**
 * Cron Job Schedules Configuration
 * 
 * Centralized location to manage all automated background task schedules.
 * Format: "minute hour day-of-month month day-of-week"
 * Example: "0 0 * * *" = Run exactly at midnight every day.
 */

export const cronSchedules = {
  // Sweeps the database for expired soft-deleted accounts
  deletionSweeper: "0 0 * * *", 
};

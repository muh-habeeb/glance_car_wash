/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

import pkg from "@prisma/client";
import type { PrismaClient as PrismaClientType } from "@prisma/client";
const { PrismaClient } = pkg;
import { env } from "./env.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

const connectionString = `${env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Ensure a single Prisma client instance in development to prevent too many connections
export const prisma: PrismaClientType =
  global.prisma ||
  (new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }) as PrismaClientType);

if (env.NODE_ENV !== "production") global.prisma = prisma;

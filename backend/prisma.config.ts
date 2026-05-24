import 'dotenv/config';
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: env("DATABASE_URL"),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

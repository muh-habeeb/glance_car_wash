import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_SERVER_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_STAFF_DASHBOARD_URL: z.string().url().default("http://localhost:3002/dashboard"),
    NEXT_PUBLIC_ADMIN_DASHBOARD_URL: z.string().url().default("http://localhost:3003/dashboard"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STAFF_DASHBOARD_URL: process.env.NEXT_PUBLIC_STAFF_DASHBOARD_URL,
    NEXT_PUBLIC_ADMIN_DASHBOARD_URL: process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL,
  },
  emptyStringAsUndefined: true,
});


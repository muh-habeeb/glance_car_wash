import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      whatsapp: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "USER" },
      is_active: { type: "boolean", required: false, defaultValue: true },
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Password is set only for Credentials (Email & Password) signups.
          // For those, phone must be mandatory.
          if (user.password && !user.phone) {
            throw new Error("Phone number is required");
          }
          return {
            data: user
          };
        }
      }
    }
  },
  trustedOrigins: env.CORS_ORIGIN,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { 
    enabled: true, 
    requireEmailVerification: false,
    password: {
      hash: async (password) => {
        const bcrypt = await import("bcrypt");
        return await bcrypt.hash(password, 12);
      },
      verify: async ({ password, hash }) => {
        const bcrypt = await import("bcrypt");
        return await bcrypt.compare(password, hash);
      }
    }
  },
  socialProviders: {
    ...(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
      ? {
        facebook: {
          clientId: env.FACEBOOK_CLIENT_ID,
          clientSecret: env.FACEBOOK_CLIENT_SECRET,
        },
      }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
      : {}),
  },
  plugins: [
    dash()
  ]
});

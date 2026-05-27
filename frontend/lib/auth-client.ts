import { env } from "@/utils/env";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL, // Secure Express backend URL
  fetchOptions: {
    customFetchImpl: async (url, init) => {
      return fetch(url, {
        ...init,
        credentials: "include",
      });
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

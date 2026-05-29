"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Redirects authenticated users away from guest-only pages (login, signup, forgot-password).
 * Call this at the top of any page component that should only be visible to unauthenticated users.
 *
 * @param redirectTo - Where to send logged-in users (default: "/dashboard")
 */
export function useAuthRedirect(redirectTo = "/dashboard") {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  return { isLoading: isPending, isAuthenticated: !!session?.user };
}

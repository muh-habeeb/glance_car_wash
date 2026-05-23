"use client";

import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createAuthStore, type AuthStore, type AuthState } from "../store/useAuthStore";

export type AuthStoreApi = ReturnType<typeof createAuthStore>;

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined);

export interface AuthStoreProviderProps {
  children: React.ReactNode;
  initialState?: AuthState;
}

/**
 * Provider component to wrap the Next.js App Router tree.
 * Creates a client-side singleton store instance that is safe from server-side state leakage.
 */
export const AuthStoreProvider = ({
  children,
  initialState,
}: AuthStoreProviderProps) => {
  const storeRef = useRef<AuthStoreApi>(null);
  
  if (!storeRef.current) {
    storeRef.current = createAuthStore(initialState);
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

/**
 * Custom hook to select and consume states from the secure Auth Zustand store.
 * Usage: const user = useAuthStore((state) => state.user);
 */
export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const storeContext = useContext(AuthStoreContext);

  if (!storeContext) {
    throw new Error("useAuthStore must be used within an AuthStoreProvider");
  }

  return useStore(storeContext, selector);
};

import { createStore } from "zustand";

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const defaultInitState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Creates a brand new, request-isolated instance of the Auth Zustand store.
 * Perfect for SSR safety in Next.js App Router.
 */
export const createAuthStore = (initState: AuthState = defaultInitState) => {
  return createStore<AuthStore>()((set) => ({
    ...initState,
    setUser: (user) =>
      set((state) => ({
        user,
        isAuthenticated: !!user,
        error: null,
      })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, isLoading: false }),
    reset: () => set(defaultInitState),
  }));
};

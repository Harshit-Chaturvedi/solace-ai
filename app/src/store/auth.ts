import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { getMe, type UserProfile } from "../api/auth.js";

const TOKEN_KEY = "solace_jwt_token";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: UserProfile | null;
  hydrate: () => Promise<void>;
  setAuth: (token: string, user: UserProfile) => Promise<void>;
  setUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  token: null,
  user: null,

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ status: "unauthenticated", token: null, user: null });
        return;
      }

      let user: UserProfile | null = null;
      let isUnauthorized = false;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          user = await getMe();
          break;
        } catch (err: unknown) {
          const apiErr = err as { status?: number };
          if (apiErr?.status === 401) {
            isUnauthorized = true;
            break;
          }
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      if (user) {
        set({ status: "authenticated", token, user });
      } else {
        if (isUnauthorized) {
          try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          } catch {
            // secure store error
          }
        }
        set({ status: "unauthenticated", token: null, user: null });
      }
    } catch {
      set({ status: "unauthenticated", token: null, user: null });
    }
  },

  setAuth: async (token: string, user: UserProfile) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {
      // secure store error
    }
    set({ status: "authenticated", token, user });
  },

  setUser: (user: UserProfile) => {
    set({ user });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // secure store error
    }
    set({ status: "unauthenticated", token: null, user: null });
  },
}));

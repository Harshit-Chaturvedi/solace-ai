import { Platform } from "react-native";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { getMe, type UserProfile } from "../api/auth.js";
import { getStoredToken, setStoredToken, clearStoredToken } from "../api/client.js";
import { queryClient } from "../lib/queryClient.js";

const USER_KEY = "solace_user";

async function getStoredUser(): Promise<UserProfile | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === "web") {
      raw = typeof window !== "undefined" ? window.localStorage.getItem(USER_KEY) : null;
    } else {
      raw = await SecureStore.getItemAsync(USER_KEY);
    }
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

async function setStoredUser(user: UserProfile): Promise<void> {
  try {
    const raw = JSON.stringify(user);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.setItem(USER_KEY, raw);
      return;
    }
    await SecureStore.setItemAsync(USER_KEY, raw);
  } catch {
    // ignore
  }
}

async function clearStoredUser(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.removeItem(USER_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    // ignore
  }
}

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
      const token = await getStoredToken();
      if (!token) {
        set({ status: "unauthenticated", token: null, user: null });
        return;
      }

      const cachedUser = await getStoredUser();
      if (cachedUser) {
        set({ status: "authenticated", token, user: cachedUser });
      }

      try {
        const freshUser = await getMe();
        await setStoredUser(freshUser);
        set({ status: "authenticated", token, user: freshUser });
      } catch (err: unknown) {
        const apiErr = err as { status?: number };
        if (apiErr?.status === 401) {
          await clearStoredToken();
          await clearStoredUser();
          set({ status: "unauthenticated", token: null, user: null });
        } else {
          if (!cachedUser) {
            set({ status: "unauthenticated", token: null, user: null });
          }
        }
      }
    } catch {
      set({ status: "unauthenticated", token: null, user: null });
    }
  },

  setAuth: async (token: string, user: UserProfile) => {
    queryClient.clear();
    try {
      await setStoredToken(token);
      await setStoredUser(user);
    } catch {
      // secure store error
    }
    set({ status: "authenticated", token, user });
  },

  setUser: (user: UserProfile) => {
    setStoredUser(user).catch(() => {});
    set({ user });
  },

  logout: async () => {
    try {
      await clearStoredToken();
      await clearStoredUser();
    } catch {
      // secure store error
    }
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // notification cancel error
    }
    queryClient.clear();
    set({ status: "unauthenticated", token: null, user: null });
  },
}));

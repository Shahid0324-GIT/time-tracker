import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;

    const matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;

    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; max-age=${maxAge}; path=/; SameSite=Lax`;
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=; max-age=0; path=/`;
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);

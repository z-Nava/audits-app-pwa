// src/store/userStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  employee_number?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useUserStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => {
        set({ token, user });
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: "audit-session", // clave en localStorage
    }
  )
);

export default useUserStore;

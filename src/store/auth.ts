import { create } from "zustand";

// internal import
import type { User } from "@prisma/client";

type TAuthStore = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;
};

export const useAuth = create<TAuthStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

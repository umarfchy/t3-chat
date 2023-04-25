import { create } from "zustand";

type TAuthStore = {
  currentUser: string | null;
  setCurrentUser: (user: string) => void;
  clearCurrentUser: () => void;
};

export const useAuth = create<TAuthStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

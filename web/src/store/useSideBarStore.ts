// ...existing code...
import { create } from "zustand";

interface SidebarStoreProps {
  forceOpen: boolean;
  setForceOpen: (forceOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarStoreProps>()((set) => ({
  forceOpen: false,
  setForceOpen: (forceOpen) => set({ forceOpen }),
}));

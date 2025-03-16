// ...existing code...
import { create } from "zustand";

interface FilterDrawerStoreProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useFilterDrawer = create<FilterDrawerStoreProps>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

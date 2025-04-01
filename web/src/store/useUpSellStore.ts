import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UpSellStoreStoreProps {
  hasShownEmailModal: boolean;
  setHasShownEmailModal: (value: boolean) => void;
}

export const useUpSellStore = create<UpSellStoreStoreProps>()(
  persist(
    (set) => ({
      hasShownEmailModal: false,
      setHasShownEmailModal: (value: boolean) =>
        set({ hasShownEmailModal: value }),
    }),
    {
      name: "upSellStore",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

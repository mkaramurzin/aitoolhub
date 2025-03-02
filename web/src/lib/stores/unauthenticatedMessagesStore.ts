import { startOfDay } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UnauthenticatedMessagesState {
  date: Date;
  messageCount: number;
  setDate: (date: Date) => void;
  setMessageCount: (count: number) => void;
}

export const unauthenticatedMessagesStore =
  create<UnauthenticatedMessagesState>()(
    persist(
      (set, get) => ({
        // Initial state
        date: startOfDay(new Date()),
        messageCount: 0,
        // Actions to update state
        setDate: (date: Date) => set({ date }),
        setMessageCount: (count: number) => set({ messageCount: count }),
      }),
      {
        name: "unauthenticatedMessages",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );

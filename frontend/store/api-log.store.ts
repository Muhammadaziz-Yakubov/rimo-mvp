import { create } from "zustand";
import { ApiActivityEntry } from "../types/app.types";

interface ApiLogState {
  logs: ApiActivityEntry[];
  addLog: (log: ApiActivityEntry) => void;
  clearLogs: () => void;
}

export const useApiLogStore = create<ApiLogState>((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 200), // keep only last 200 logs on client
    })),
  clearLogs: () => set({ logs: [] }),
}));

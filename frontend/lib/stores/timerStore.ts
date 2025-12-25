import { create } from "zustand";
import { TimerResponse } from "@/lib/types";

interface TimerState {
  runningTimer: TimerResponse | null;
  elapsedSeconds: number;
  intervalId: NodeJS.Timeout | null;

  setRunningTimer: (timer: TimerResponse | null) => void;
  startInterval: () => void;
  stopInterval: () => void;
  updateElapsed: (seconds: number) => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: null,
  elapsedSeconds: 0,
  intervalId: null,

  setRunningTimer: (timer) => {
    set({ runningTimer: timer });
    if (timer) {
      set({ elapsedSeconds: timer.elapsed_seconds });
      get().startInterval();
    } else {
      get().stopInterval();
      set({ elapsedSeconds: 0 });
    }
  },

  startInterval: () => {
    // Clear existing interval
    const currentInterval = get().intervalId;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    // Start new interval (update every second)
    const id = setInterval(() => {
      set((state) => ({
        elapsedSeconds: state.elapsedSeconds + 1,
      }));
    }, 1000);

    set({ intervalId: id });
  },

  stopInterval: () => {
    const id = get().intervalId;
    if (id) {
      clearInterval(id);
      set({ intervalId: null });
    }
  },

  updateElapsed: (seconds) => {
    set({ elapsedSeconds: seconds });
  },

  reset: () => {
    get().stopInterval();
    set({
      runningTimer: null,
      elapsedSeconds: 0,
      intervalId: null,
    });
  },
}));

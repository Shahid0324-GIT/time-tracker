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

const parseUtcTime = (timeString: string) => {
  if (!timeString) return new Date().getTime();

  let isoString = timeString.replace(" ", "T");

  if (!isoString.endsWith("Z") && !isoString.includes("+")) {
    isoString += "Z";
  }

  return new Date(isoString).getTime();
};

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: null,
  elapsedSeconds: 0,
  intervalId: null,

  setRunningTimer: (timer) => {
    const oldId = get().intervalId;
    if (oldId) clearInterval(oldId);

    set({ runningTimer: timer, intervalId: null });

    if (timer) {
      const now = new Date().getTime(); // UTC timestamp
      const start = parseUtcTime(timer.start_time); // UTC timestamp

      // UTC Now - UTC Start = Correct Duration
      const elapsed = Math.max(0, Math.floor((now - start) / 1000));

      set({ elapsedSeconds: elapsed });
      get().startInterval();
    } else {
      set({ elapsedSeconds: 0 });
    }
  },

  startInterval: () => {
    if (get().intervalId) return;
    const id = setInterval(() => {
      const timer = get().runningTimer;
      if (timer) {
        const now = new Date().getTime();
        const start = parseUtcTime(timer.start_time);
        const elapsed = Math.max(0, Math.floor((now - start) / 1000));
        set({ elapsedSeconds: elapsed });
      }
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

  updateElapsed: (seconds) => set({ elapsedSeconds: seconds }),

  reset: () => {
    get().stopInterval();
    set({ runningTimer: null, elapsedSeconds: 0, intervalId: null });
  },
}));

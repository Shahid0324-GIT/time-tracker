import api from "@/lib/api/client";
import {
  TimeEntryWithProject,
  TimerResponse,
  TimerStartRequest,
} from "@/lib/types";

export const timeApi = {
  // Get all entries (we will filter client-side for the dashboard stats for now)
  getAll: async () => {
    const { data } = await api.get<TimeEntryWithProject[]>("/time-entries/");
    return data;
  },

  // Timer specific endpoints
  getRunning: async () => {
    // Returns 204 or null if no timer, so handle that
    try {
      const { data } = await api.get<TimerResponse>(
        "/time-entries/timer/running"
      );
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  startTimer: async (payload: TimerStartRequest) => {
    const { data } = await api.post<TimerResponse>(
      "/time-entries/timer/start",
      payload
    );
    return data;
  },

  stopTimer: async () => {
    const { data } = await api.patch<TimerResponse>("/time-entries/timer/stop");
    return data;
  },
};

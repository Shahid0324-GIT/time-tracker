import api from "@/lib/api/client";
import {
  TimeEntryCreate,
  TimeEntryWithProject,
  TimerResponse,
  TimerStartRequest,
} from "@/lib/types";

export interface TimeEntryFilters {
  start_date?: string;
  end_date?: string;
  project_id?: string;
  client_id?: string;
  is_billable?: boolean;
  is_invoiced?: boolean;
  limit?: number;
}

export const timeApi = {
  // Get all entries (we will filter client-side for the dashboard stats for now)
  getAll: async (params?: TimeEntryFilters) => {
    const { data } = await api.get<TimeEntryWithProject[]>("/time-entries/", {
      params,
    });
    return data;
  },

  // Timer specific endpoints
  getRunning: async () => {
    // Returns 204 or null if no timer, so handle that
    try {
      const { data } = await api.get<TimerResponse>(
        "/time-entries/timer/running",
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
      payload,
    );
    return data;
  },

  stopTimer: async () => {
    const { data } = await api.patch<TimerResponse>("/time-entries/timer/stop");
    return data;
  },

  create: async (payload: {
    project_id: string;
    start_time: string;
    end_time: string;
    description?: string;
    is_billable: boolean;
  }) => {
    const { data } = await api.post("/time-entries/", payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/time-entries/${id}`);
    return data;
  },

  update: async ({ id, payload }: { id: string; payload: TimeEntryCreate }) => {
    const { data } = await api.patch<TimeEntryWithProject>(
      `/time-entries/${id}`,
      payload,
    );
    return data;
  },
};

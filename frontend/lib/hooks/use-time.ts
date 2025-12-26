import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeApi } from "@/lib/api/time";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useTimerStore } from "../stores/timerStore";

interface ApiErrorResponse {
  detail: string;
}

export function useTimeEntries() {
  return useQuery({
    queryKey: ["time-entries"],
    queryFn: timeApi.getAll,
  });
}

export function useTimer() {
  const queryClient = useQueryClient();
  const { setRunningTimer } = useTimerStore();

  // 1. Check for running timer on mount
  const { data: runningTimer, isLoading } = useQuery({
    queryKey: ["timer-running"],
    queryFn: timeApi.getRunning,
  });

  // Start Timer Mutation
  const startMutation = useMutation({
    mutationFn: timeApi.startTimer,
    onSuccess: (data) => {
      setRunningTimer(data);
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer started");
    },
    // FIX: Typed error instead of 'any'
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.detail || "Failed to start timer");
    },
  });

  // Stop Timer Mutation
  const stopMutation = useMutation({
    mutationFn: timeApi.stopTimer,
    onSuccess: () => {
      setRunningTimer(null);
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer stopped");
    },
    // FIX: Typed error instead of 'any'
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.detail || "Failed to stop timer");
    },
  });

  return {
    runningTimer,
    isLoading,
    startTimer: startMutation.mutate,
    stopTimer: stopMutation.mutate,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
  };
}

import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeApi } from "@/lib/api/time";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useTimerStore } from "../stores/timerStore";
import { TimerStartRequest, TimerResponse } from "@/lib/types";

interface ApiErrorResponse {
  detail: string;
}

export function useTimer() {
  const queryClient = useQueryClient();
  const { setRunningTimer, runningTimer: storeTimer } = useTimerStore();
  const isMutating = useRef(false);

  const { data: apiTimer, isLoading } = useQuery({
    queryKey: ["timer-running"],
    queryFn: timeApi.getRunning,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isMutating.current) return;
    if (apiTimer !== undefined) {
      setRunningTimer(apiTimer);
    }
  }, [apiTimer, setRunningTimer]);

  const startMutation = useMutation({
    mutationFn: (variables: TimerStartRequest) => {
      const payload = {
        ...variables,
        start_time: variables.start_time || new Date().toISOString(),
      };
      return timeApi.startTimer(payload);
    },
    onMutate: async (variables) => {
      isMutating.current = true;
      await queryClient.cancelQueries({ queryKey: ["timer-running"] });

      const startTime = variables.start_time || new Date().toISOString();

      const optimisticTimer: TimerResponse = {
        id: "temp-id",
        project_id: variables.project_id,
        description: variables.description,
        start_time: startTime,
        elapsed_seconds: 0,
      };

      setRunningTimer(optimisticTimer);
    },
    onSuccess: (data) => {
      setRunningTimer(data);
      queryClient.setQueryData(["timer-running"], data);
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer started");

      setTimeout(() => {
        isMutating.current = false;
      }, 1000);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      isMutating.current = false;
      setRunningTimer(null);
      toast.error(error.response?.data?.detail || "Failed to start timer");
    },
  });

  const stopMutation = useMutation({
    mutationFn: timeApi.stopTimer,
    onMutate: async () => {
      isMutating.current = true;
      setRunningTimer(null);
    },
    onSuccess: () => {
      queryClient.setQueryData(["timer-running"], null);
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer stopped");
      setTimeout(() => {
        isMutating.current = false;
      }, 1000);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      isMutating.current = false;
      queryClient.invalidateQueries({ queryKey: ["timer-running"] });
      toast.error(error.response?.data?.detail || "Failed to stop timer");
    },
  });

  return {
    runningTimer: storeTimer,
    isLoading,
    startTimer: startMutation.mutate,
    stopTimer: stopMutation.mutate,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
  };
}

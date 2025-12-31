import { useEffect, useRef } from "react"; // <--- Add this
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeApi } from "@/lib/api/time";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useTimerStore } from "../stores/timerStore";

// Define the shape of your backend error response
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

    // Only sync if API data is loaded (undefined means loading)
    if (apiTimer !== undefined) {
      setRunningTimer(apiTimer);
    }
  }, [apiTimer, setRunningTimer]);

  // Start Timer Mutation
  const startMutation = useMutation({
    mutationFn: timeApi.startTimer,
    onMutate: () => {
      isMutating.current = true;
    },
    onSuccess: (data) => {
      // Optimistic update
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
      toast.error(error.response?.data?.detail || "Failed to start timer");
    },
  });

  // Stop Timer Mutation
  const stopMutation = useMutation({
    mutationFn: timeApi.stopTimer,
    onMutate: () => {
      isMutating.current = true;
    },
    onSuccess: () => {
      setRunningTimer(null);
      queryClient.setQueryData(["timer-running"], null);
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast.success("Timer stopped");
      setTimeout(() => {
        isMutating.current = false;
      }, 1000);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      isMutating.current = false;
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

"use client";

import * as React from "react";
import { formatDurationTime } from "@/lib/utils/format";
import { StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/lib/stores/timerStore";

export function GlobalTimerWidget() {
  const { runningTimer, elapsedSeconds, setRunningTimer } = useTimerStore();

  if (!runningTimer) {
    return null; // Don't show anything if no timer is running
  }

  // Handle stop (In a real app, this would call the API first)
  const handleStop = () => {
    // API Call would go here: await api.patch('/time-entries/timer/stop')
    setRunningTimer(null); // Optimistic update
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-900/50 dark:bg-red-900/20">
      <div className="animate-pulse">
        <div className="h-2 w-2 rounded-full bg-red-500" />
      </div>
      <span className="font-mono text-sm font-medium text-red-700 dark:text-red-400">
        {formatDurationTime(elapsedSeconds)}
      </span>
      <div className="mx-2 h-4 w-px bg-red-200 dark:bg-red-800" />
      <span className="max-w-25 truncate text-xs text-muted-foreground hidden sm:inline-block">
        {runningTimer.description || "Untitled Task"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40"
        onClick={handleStop}
      >
        <StopCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}

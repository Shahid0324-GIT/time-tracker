"use client";

import { formatDurationTime } from "@/lib/utils/format";
import { StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/hooks/use-projects";
import { useTimer } from "@/lib/hooks/use-time";
import { useTimerStore } from "@/lib/stores/timerStore";

export function GlobalTimerWidget() {
  const { runningTimer, stopTimer, isStopping } = useTimer();

  const { elapsedSeconds } = useTimerStore();

  const { data: projects } = useProjects();

  if (!runningTimer) {
    return null;
  }

  // Find the project name associated with the running timer
  const project = projects?.find((p) => p.id === runningTimer.project_id);
  const displayName =
    project?.name || runningTimer.description || "Untitled Task";

  return (
    <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-900/50 dark:bg-red-900/20">
      <div className="animate-pulse">
        <div className="h-2 w-2 rounded-full bg-red-500" />
      </div>

      <span className="font-mono text-sm font-medium text-red-700 dark:text-red-400 tabular-nums">
        {formatDurationTime(elapsedSeconds)}
      </span>

      <div className="mx-2 h-4 w-px bg-red-200 dark:bg-red-800" />

      <span className="max-w-25 truncate text-xs text-muted-foreground hidden sm:inline-block">
        {displayName}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40"
        onClick={() => stopTimer()}
        disabled={isStopping}
      >
        {isStopping ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <StopCircle className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Play, Square, Briefcase, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useTimer } from "@/lib/hooks/use-time";
import { useProjects } from "@/lib/hooks/use-projects";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDurationTime } from "@/lib/utils/format";
import { useTimerStore } from "@/lib/stores/timerStore";

export function HeroSection() {
  const {
    runningTimer,
    isLoading: isLoadingTimer,
    startTimer,
    stopTimer,
    isStarting,
    isStopping,
  } = useTimer();

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { user } = useAuthStore();

  const { elapsedSeconds } = useTimerStore();

  const [selectedProject, setSelectedProject] = useState<string>("");

  // Loading State (Skeleton)
  if (isLoadingTimer || isLoadingProjects) {
    return (
      <Card className="border-none shadow-sm h-50 w-full animate-pulse bg-muted/20">
        <CardContent className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // --- SCENARIO A: Timer is Running ---
  if (runningTimer) {
    // Find project details to display name/color
    const project = projects?.find((p) => p.id === runningTimer.project_id);

    return (
      <Card className="relative overflow-hidden border-none bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-xl transition-all">
        {/* Abstract Background Effect */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <CardContent className="flex h-full flex-col justify-between p-6 md:flex-row md:items-center">
          <div className="z-10 space-y-1">
            <h3 className="text-lg font-medium text-indigo-100">
              Current Session
            </h3>

            {/* Ticking Timer */}
            <p className="text-4xl font-bold tracking-tight md:text-6xl font-mono tabular-nums">
              {formatDurationTime(elapsedSeconds)}
            </p>

            <div className="flex items-center gap-2 text-indigo-100 pt-2">
              <Briefcase className="h-4 w-4 opacity-75" />
              <span className="font-medium">
                {project?.name || "Unknown Project"}
              </span>
              {runningTimer.description && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="opacity-75 text-sm max-w-50 truncate">
                    {runningTimer.description}
                  </span>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={() => stopTimer()}
            disabled={isStopping}
            size="lg"
            variant="secondary"
            className="z-10 mt-6 shrink-0 border-0 bg-white/20 text-white hover:bg-white/30 md:mt-0 md:h-16 md:w-32 md:text-lg backdrop-blur-sm"
          >
            {isStopping ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Square className="mr-2 h-5 w-5 fill-current" />
            )}
            Stop
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- SCENARIO B: No Timer (Quick Start) ---
  const activeProjects = projects?.filter((p) => p.is_active) || [];

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          Good Morning, {user?.first_name || "Creator"}
        </CardTitle>
        <CardDescription>
          Ready to track your work today? {format(new Date(), "EEEE, MMMM do")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {activeProjects.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No active projects found.
                  </div>
                ) : (
                  activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => startTimer({ project_id: selectedProject })}
            disabled={!selectedProject || isStarting}
            size="lg"
            className="h-12 px-8 text-base shadow-lg transition-all hover:scale-[1.02]"
          >
            {isStarting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Play className="mr-2 h-5 w-5 fill-current" />
            )}
            Start Timer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

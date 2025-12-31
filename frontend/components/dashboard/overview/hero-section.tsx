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
      <Card className="relative my-4 sm:my-2 overflow-hidden border transition-all duration-300 dark:border-cyan-800/30 dark:bg-linear-to-br dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950 dark:shadow-2xl dark:shadow-cyan-500/10 border-cyan-200/50 bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-100 shadow-xl shadow-blue-500/5 rounded-2xl">
        {/* Animated Background Orbs */}
        <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full blur-3xl transition-all duration-700 dark:bg-cyan-500/20 bg-cyan-300/30 animate-pulse" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full blur-3xl transition-all duration-700 dark:bg-indigo-500/20 bg-indigo-300/30 animate-pulse" />

        {/* Subtle Mesh Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
          }}
        />

        <CardContent className="relative flex h-full flex-col justify-between p-6 md:flex-row md:items-center">
          <div className="z-10 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full dark:bg-cyan-400 bg-cyan-600 animate-pulse shadow-lg dark:shadow-cyan-400/50 shadow-cyan-600/50" />
              <h3 className="text-sm font-semibold tracking-wide uppercase dark:text-cyan-200/90 text-cyan-700">
                Active Session
              </h3>
            </div>

            {/* Ticking Timer */}
            <p className="text-5xl font-bold tracking-tight md:text-7xl font-mono tabular-nums dark:text-white text-slate-900 drop-shadow-sm">
              {formatDurationTime(elapsedSeconds)}
            </p>

            <div className="flex items-center gap-2 dark:text-cyan-100/80 text-cyan-800 pt-3">
              <Briefcase className="h-4 w-4 opacity-75" />
              <span className="font-semibold">
                {project?.name || "Unknown Project"}
              </span>
              {runningTimer.description && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="opacity-70 text-sm max-w-50 truncate">
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
            className="z-10 mt-6 shrink-0 border-0 dark:bg-white/10 bg-slate-900/10 dark:text-white text-slate-900 dark:hover:bg-white/20 hover:bg-slate-900/20 md:mt-0 md:h-16 md:w-32 md:text-lg backdrop-blur-md shadow-lg dark:shadow-cyan-500/20 shadow-slate-900/10 transition-all hover:scale-105 active:scale-95 font-semibold"
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

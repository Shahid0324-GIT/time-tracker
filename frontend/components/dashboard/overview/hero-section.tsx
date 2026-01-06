"use client";

import { useState } from "react";
import { Play, Square, Briefcase, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useTimer } from "@/lib/hooks/use-time";
import { useProjects } from "@/lib/hooks/use-projects";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useGreeting } from "@/lib/hooks/use-greetings";

export function HeroSection() {
  const {
    runningTimer,
    isLoading: isLoadingTimer,
    startTimer,
    stopTimer,
    isStarting,
    isStopping,
  } = useTimer();

  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { user } = useAuthStore();
  const { elapsedSeconds } = useTimerStore();
  const greetings = useGreeting();

  // State for the new description field
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const activeProjects = projects?.filter((p) => p.is_active) || [];

  // --- LOADING STATE ---
  if (isLoadingTimer) {
    return (
      <Card className="border-l-4 border-l-primary shadow-sm h-45 flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-xl">
            {greetings}, {user?.first_name || "Creator"}
          </CardTitle>
          <CardDescription>Checking your active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-12 w-32 animate-pulse rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- SCENARIO A: Timer is Running ---
  if (runningTimer) {
    const project = projects?.find((p) => p.id === runningTimer.project_id);

    return (
      <Card className="relative z-1 my-4 sm:my-2 overflow-hidden border transition-all duration-300 dark:border-cyan-800/30 dark:bg-linear-to-br dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950 dark:shadow-2xl dark:shadow-cyan-500/10 border-cyan-200/50 bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-100 shadow-xl shadow-blue-500/5 rounded-2xl">
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
          <div className="z-10 space-y-2 w-full">
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

            {/* Project Info - Truncated */}
            <div className="flex items-center gap-2 dark:text-cyan-100/80 text-cyan-800 pt-3 overflow-hidden">
              <Briefcase className="h-4 w-4 opacity-75 shrink-0" />
              <span className="font-semibold truncate">
                {project?.name || "Unknown Project"}
              </span>
              {runningTimer.description && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="opacity-70 text-sm max-w-37.5 sm:max-w-xs truncate">
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
  return (
    <Card className="border-l-4 my-4 sm:my-2 border-l-primary shadow-sm transition-all duration-500 ease-in-out">
      <CardHeader>
        <CardTitle className="text-xl">
          {greetings}, {user?.first_name || "Creator"}
        </CardTitle>
        <CardDescription>
          Ready to track your work today? {format(new Date(), "EEEE, MMMM do")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* 1. Project Selector - Fixed Mobile Truncation */}
          <div className="w-full lg:w-72 min-w-0">
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
              disabled={isLoadingProjects}
            >
              {/* Added classes to force span truncation */}
              <SelectTrigger className="h-12 text-base w-full [&>span]:truncate [&>span]:min-w-0">
                <SelectValue
                  placeholder={
                    isLoadingProjects
                      ? "Loading projects..."
                      : "Select a project..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activeProjects.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No active projects found.
                  </div>
                ) : (
                  activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2 max-w-62.5 sm:max-w-md">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Description Input */}
          <div className="flex-1 min-w-0">
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button
            onClick={() =>
              startTimer(
                { project_id: selectedProject, description: description },
                {
                  onSuccess: () => {
                    setDescription("");
                  },
                }
              )
            }
            disabled={!selectedProject || !description || isStarting}
            size="lg"
            className="h-12 px-8 text-base shadow-lg transition-all hover:scale-[1.02] w-full lg:w-auto shrink-0"
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

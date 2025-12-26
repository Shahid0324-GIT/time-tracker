"use client";

import { useState } from "react";
import { Play, Square, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { mockProjects, mockUser } from "@/data/mock";
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
  const { runningTimer, elapsedSeconds, setRunningTimer } = useTimerStore();
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Simulate starting a timer
  const handleStart = () => {
    if (!selectedProject) return;
    // const project = mockProjects.find((p) => p.id === selectedProject);

    setRunningTimer({
      id: "temp-id",
      project_id: selectedProject,
      description: "New Task Started via Dashboard",
      start_time: new Date().toISOString(),
      elapsed_seconds: 0,
    });
  };

  // Simulate stopping
  const handleStop = () => {
    setRunningTimer(null);
  };

  if (runningTimer) {
    // SCENARIO A: Timer is Running
    const project = mockProjects.find((p) => p.id === runningTimer.project_id);

    return (
      <Card className="relative overflow-hidden border-none bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <CardContent className="flex h-full flex-col justify-between p-6 md:flex-row md:items-center">
          <div className="z-10 space-y-1">
            <h3 className="text-lg font-medium text-indigo-100">
              Current Session
            </h3>
            <p className="text-3xl font-bold tracking-tight md:text-5xl font-mono">
              {formatDurationTime(elapsedSeconds)}
            </p>
            <div className="flex items-center gap-2 text-indigo-100">
              <Briefcase className="h-4 w-4 opacity-75" />
              <span className="font-medium">
                {project?.name || "Unknown Project"}
              </span>
              <span className="opacity-50">•</span>
              <span className="opacity-75 text-sm">
                {runningTimer.description}
              </span>
            </div>
          </div>

          <Button
            onClick={handleStop}
            size="lg"
            variant="secondary"
            className="z-10 mt-6 shrink-0 border-0 bg-white/20 text-white hover:bg-white/30 md:mt-0 md:h-16 md:w-32 md:text-lg"
          >
            <Square className="mr-2 h-5 w-5 fill-current" />
            Stop
          </Button>
        </CardContent>
      </Card>
    );
  }

  // SCENARIO B: No Timer (Quick Start)
  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          Good Morning, {mockUser.first_name}
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
                {mockProjects
                  .filter((p) => p.is_active)
                  .map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleStart}
            disabled={!selectedProject}
            size="lg"
            className="h-12 px-8 text-base shadow-lg transition-all hover:scale-[1.02]"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            Start Timer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

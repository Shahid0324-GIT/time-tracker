"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/lib/hooks/use-projects";

interface TrackerFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  projectId: string;
  setProjectId: (id: string) => void;
  // New Prop
  status: string;
  setStatus: (status: string) => void;
}

export function TrackerFilters({
  dateRange,
  setDateRange,
  projectId,
  setProjectId,
  status,
  setStatus,
}: TrackerFiltersProps) {
  const { projects } = useProjects();
  const activeProjects = projects?.filter((p) => p.is_active) || [];

  const isFiltered = projectId !== "all" || status !== "all" || dateRange?.from;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
        {/* DATE RANGE PICKER */}
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-60 justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* PROJECT FILTER */}
        <div className="w-45">
          <Select
            value={projectId === "all" ? undefined : projectId}
            onValueChange={setProjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {activeProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* NEW: STATUS FILTER (Billable) */}
        <div className="w-37.5">
          <Select
            value={status === "all" ? undefined : status}
            onValueChange={setStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="billable">Billable Only</SelectItem>
              <SelectItem value="non_billable">Non-Billable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CLEAR FILTERS BUTTON */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setProjectId("all");
              setStatus("all");
              setDateRange(undefined);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

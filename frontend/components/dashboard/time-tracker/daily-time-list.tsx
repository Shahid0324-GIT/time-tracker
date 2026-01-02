"use client";

import { useMemo, useState } from "react";
import {
  format,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { Trash2, CalendarDays, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDurationTime } from "@/lib/utils/format";
import { TimeEntryWithProject } from "@/lib/types";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";
import { TrackerFilters } from "./tracker-filters";
import { ManualEntryForm } from "./manual-entry-form";
// IMPORT THE HELPER
import { parseBackendDate } from "@/lib/utils/utils";

const getDateLabel = (dateString: string) => {
  // Ensure we parse the date string correctly as a local date for comparison
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM do");
};

interface GroupedEntry {
  date: string;
  totalSeconds: number;
  entries: TimeEntryWithProject[];
}

export function DailyTimeList() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [projectId, setProjectId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const [editingEntry, setEditingEntry] = useState<TimeEntryWithProject | null>(
    null
  );

  const filters = useMemo(() => {
    let isBillable: boolean | undefined = undefined;
    if (status === "billable") isBillable = true;
    if (status === "non_billable") isBillable = false;

    return {
      start_date: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      end_date: dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      project_id: projectId === "all" ? undefined : projectId,
      is_billable: isBillable,
      limit: 500,
    };
  }, [dateRange, projectId, status]);

  const { entries, isLoading, deleteEntry, isDeleting } =
    useTimeEntries(filters);

  // --- GROUPING LOGIC (FIXED TIMEZONE) ---
  const groupedEntries = useMemo(() => {
    if (!entries) return {};

    // Sort by actual time first
    const sorted = [...entries].sort(
      (a, b) =>
        parseBackendDate(b.start_time).getTime() -
        parseBackendDate(a.start_time).getTime()
    );

    return sorted.reduce((groups, entry) => {
      // FIX 1: Parse the backend date to Local Time before formatting as YYYY-MM-DD
      // This ensures entries from 11 PM UTC (which might be 4 AM Tomorrow Local) go into the correct day bucket
      const dateKey = format(parseBackendDate(entry.start_time), "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          totalSeconds: 0,
          entries: [],
        };
      }

      groups[dateKey].entries.push(entry);
      groups[dateKey].totalSeconds += entry.duration_seconds || 0;

      return groups;
    }, {} as Record<string, GroupedEntry>);
  }, [entries]);

  const days = Object.values(groupedEntries);

  const grandTotalSeconds = useMemo(() => {
    return (
      entries?.reduce((acc, entry) => acc + (entry.duration_seconds || 0), 0) ||
      0
    );
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* 1. FILTER BAR */}
      <TrackerFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        projectId={projectId}
        setProjectId={setProjectId}
        status={status}
        setStatus={setStatus}
      />

      {!isLoading && entries && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">
            Total for selected period
          </span>
          <span className="text-xl font-bold font-mono text-foreground">
            {formatDurationTime(grandTotalSeconds)}
          </span>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 w-full animate-pulse rounded-xl bg-muted/50"
            />
          ))}
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {!isLoading && days.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card">
          <div className="mb-4 rounded-full bg-muted p-4">
            <CalendarDays className="h-8 w-8 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold">No Time Entries Found</h3>
          <p className="text-sm max-w-sm mt-1">
            Try adjusting your filters or add a new entry to get started.
          </p>
        </div>
      )}

      {/* 4. LIST VIEW */}
      {!isLoading && days.length > 0 && (
        <div className="space-y-8">
          {days.map((day) => (
            <Card
              key={day.date}
              className="overflow-hidden border-none shadow-sm bg-transparent"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {getDateLabel(day.date)}
                </h3>
                <span className="text-sm font-medium text-muted-foreground">
                  Total: {formatDurationTime(day.totalSeconds)}
                </span>
              </div>

              {/* List of Entries */}
              <div className="divide-y rounded-xl border bg-card">
                {day.entries.map((entry) => {
                  // FIX 2: Parse times for display
                  const startTime = parseBackendDate(entry.start_time);
                  const endTime = entry.end_time
                    ? parseBackendDate(entry.end_time)
                    : null;

                  return (
                    <div
                      key={entry.id}
                      className="group flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Left: Project & Description */}
                      <div className="flex flex-col gap-1 sm:max-w-[50%]">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: entry.project?.color || "#ccc",
                            }}
                          />
                          <span className="font-medium">
                            {entry.project?.name || "No Project"}
                          </span>
                          {entry.is_billable && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 text-muted-foreground"
                            >
                              $
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground wrap-break-word line-clamp-2">
                          {entry.description || "No description"}
                        </p>
                      </div>

                      {/* Right: Time & Actions */}
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex flex-col items-end gap-0.5 text-right">
                          <span className="font-mono text-sm font-medium">
                            {formatDurationTime(entry.duration_seconds || 0)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {/* FIX 3: Display Correct Local Time */}
                            {format(startTime, "HH:mm")}
                            <span>-</span>
                            {endTime ? format(endTime, "HH:mm") : "Now"}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {/* EDIT */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* DELETE */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteEntry(entry.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {editingEntry && (
              <ManualEntryForm
                entryToEdit={editingEntry}
                onSuccess={() => setEditingEntry(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

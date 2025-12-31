"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Trash2, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDurationTime } from "@/lib/utils/format";
import { TimeEntryWithProject } from "@/lib/types";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";

const getDateLabel = (dateString: string) => {
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
  const { entries, isLoading, deleteEntry, isDeleting } = useTimeEntries();
  // --- GROUPING LOGIC ---
  const groupedEntries = useMemo(() => {
    if (!entries) return {};

    // 1. Sort by Start Time (Newest First)
    const sorted = [...entries].sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );

    // 2. Group by Date Key (YYYY-MM-DD)
    return sorted.reduce((groups, entry) => {
      // Use local date string to avoid timezone splits
      const dateKey = format(new Date(entry.start_time), "yyyy-MM-dd");

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

  // --- STATES ---
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-40 w-full animate-pulse rounded-xl bg-muted/50"
          />
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        <div className="mb-4 rounded-full bg-muted p-4">
          <CalendarDays className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold">No Time Entries</h3>
        <p className="text-sm">
          Start the timer or add a manual entry to track your work.
        </p>
      </div>
    );
  }

  return (
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
            {day.entries.map((entry) => (
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
                      {format(new Date(entry.start_time), "HH:mm")}
                      <span>-</span>
                      {entry.end_time
                        ? format(new Date(entry.end_time), "HH:mm")
                        : "Now"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

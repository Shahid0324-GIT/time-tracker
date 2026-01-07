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
import { Trash2, CalendarDays, Loader2, Pencil, Download } from "lucide-react";
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

const getDateLabel = (dateObj: Date) => {
  if (isToday(dateObj)) return "Today";
  if (isYesterday(dateObj)) return "Yesterday";
  return format(dateObj, "EEE, MMM do");
};

const parseDate = (dateString: string) => {
  if (!dateString) return new Date();

  let cleanStr = dateString.replace(" ", "T");
  if (!cleanStr.endsWith("Z") && !cleanStr.includes("+")) {
    cleanStr += "Z";
  }
  return new Date(cleanStr);
};

interface GroupedEntry {
  dateObj: Date;
  dateLabel: string;
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

  // --- GROUPING LOGIC ---
  const groupedEntries = useMemo(() => {
    if (!entries) return {};

    // 1. Sort Entries: Newest -> Oldest (Initial sort)
    const sorted = [...entries].sort((a, b) => {
      return (
        parseDate(b.start_time).getTime() - parseDate(a.start_time).getTime()
      );
    });

    return sorted.reduce((groups, entry) => {
      // Convert to Local Date Object FIRST
      const localDate = parseDate(entry.start_time);
      const dateKey = format(localDate, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateObj: localDate,
          dateLabel: dateKey,
          totalSeconds: 0,
          entries: [],
        };
      }

      groups[dateKey].entries.push(entry);
      groups[dateKey].totalSeconds += entry.duration_seconds || 0;

      return groups;
    }, {} as Record<string, GroupedEntry>);
  }, [entries]);

  // --- DAYS ARRAY LOGIC ---
  const days = useMemo(() => {
    // 1. Sort Days by Date (Newest first)
    const sortedDays = Object.values(groupedEntries).sort((a, b) => {
      return b.dateObj.getTime() - a.dateObj.getTime();
    });

    // 2. ✅ FIX: Group (Sort) entries within each day by Project Name
    sortedDays.forEach((day) => {
      day.entries.sort((a, b) => {
        // Use "zz" to push entries with no project to the bottom
        const projectA = a.project?.name || "zz_NoProject";
        const projectB = b.project?.name || "zz_NoProject";

        // Primary Sort: Project Name (A -> Z)
        const nameComparison = projectA.localeCompare(projectB);
        if (nameComparison !== 0) {
          return nameComparison;
        }

        // Secondary Sort: Start Time (Newest -> Oldest)
        return (
          parseDate(b.start_time).getTime() - parseDate(a.start_time).getTime()
        );
      });
    });

    return sortedDays;
  }, [groupedEntries]);

  const grandTotalSeconds = useMemo(() => {
    return (
      entries?.reduce((acc, entry) => acc + (entry.duration_seconds || 0), 0) ||
      0
    );
  }, [entries]);

  // --- CSV EXPORT ---
  const handleExportCSV = () => {
    if (!entries || entries.length === 0) return;

    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Project",
      "Description",
      "Duration (h)",
      "Billable",
    ];

    const rows = entries.map((e) => {
      const start = parseDate(e.start_time);
      const end = e.end_time ? parseDate(e.end_time) : null;

      return [
        format(start, "yyyy-MM-dd"), // Local Date
        format(start, "HH:mm"), // Local Time
        end ? format(end, "HH:mm") : "Running",
        e.project?.name || "No Project",
        `"${e.description?.replace(/"/g, '""') || ""}"`,
        e.duration_seconds ? (e.duration_seconds / 3600).toFixed(2) : "0.00",
        e.is_billable ? "Yes" : "No",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `time_export_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {/* 2. TOTALS & EXPORT BUTTON */}
      {!isLoading && entries && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">
            Total for selected period
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold font-mono text-foreground">
              {formatDurationTime(grandTotalSeconds)}
            </span>
            {entries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 3. LOADING STATE */}
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

      {/* 4. EMPTY STATE */}
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

      {/* 5. LIST VIEW */}
      {!isLoading && days.length > 0 && (
        <div className="space-y-8">
          {days.map((day) => (
            <Card
              key={day.dateLabel}
              className="overflow-hidden border-none shadow-sm bg-transparent"
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {getDateLabel(day.dateObj)}
                </h3>
                <span className="text-sm font-medium text-muted-foreground">
                  Total: {formatDurationTime(day.totalSeconds)}
                </span>
              </div>

              <div className="divide-y rounded-xl border bg-card">
                {day.entries.map((entry) => {
                  const start = parseDate(entry.start_time);
                  const end = entry.end_time ? parseDate(entry.end_time) : null;

                  return (
                    <div
                      key={entry.id}
                      className="group flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
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

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex flex-col items-end gap-0.5 text-right">
                          <span className="font-mono text-sm font-medium">
                            {formatDurationTime(entry.duration_seconds || 0)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {format(start, "HH:mm")}
                            <span>-</span>
                            {end ? format(end, "HH:mm") : "Now"}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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

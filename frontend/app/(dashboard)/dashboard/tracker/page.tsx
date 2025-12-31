"use client";

import { ManualEntryForm } from "@/components/dashboard/time-tracker/manual-entry-form";
import { DailyTimeList } from "@/components/dashboard/time-tracker/daily-time-list";
import { Separator } from "@/components/ui/separator";

export default function TimeTrackerPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Tracker</h2>
          <p className="text-muted-foreground">
            Log manual hours or edit your tracking history.
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Left Column: Manual Entry Form (Fixed Sticky on Large Screens) */}
        <div className="lg:col-span-3">
          <div className="sticky top-20">
            <ManualEntryForm />

            {/* Optional: Helpful Tip */}
            <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Pro Tip:</p>
              Use the global timer in the top right header to track time while
              you navigate other pages.
            </div>
          </div>
        </div>

        {/* Right Column: Daily History List */}
        <div className="lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">History</h3>
          </div>
          <DailyTimeList />
        </div>
      </div>
    </div>
  );
}

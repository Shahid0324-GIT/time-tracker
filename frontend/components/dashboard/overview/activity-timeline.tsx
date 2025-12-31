"use client";

import { useMemo } from "react";
import { FileText, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, formatCurrency } from "@/lib/utils/format";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { InvoiceStatus } from "@/lib/types";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";

export function ActivityTimeline() {
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const { entries: timeEntries, isLoading: isLoadingTime } = useTimeEntries();

  // --- MERGE & SORT DATA ---
  const activities = useMemo(() => {
    if (!invoices || !timeEntries) return [];

    const invoiceItems = invoices.map((inv) => ({
      type: "invoice",
      id: inv.id,
      title: `Invoice #${inv.invoice_number}`,
      subtitle: `${formatCurrency(inv.total)} to ${
        inv.client?.name || "Unknown Client"
      }`,
      date: inv.created_at,
      status: inv.status,
    }));

    const timeItems = timeEntries.map((entry) => ({
      type: "time",
      id: entry.id,
      title: "Time Logged",
      subtitle: `${entry.description || "No description"} (${
        entry.project?.name || "Untitled Project"
      })`,
      date: entry.created_at || entry.start_time, // Fallback to start_time if created_at is missing
      status: "completed",
    }));

    // Combine, Sort by Date (Newest First), and Take Top 5
    return [...invoiceItems, ...timeItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices, timeEntries]);

  // --- LOADING STATE ---
  if (isLoadingInvoices || isLoadingTime) {
    return (
      <Card className="col-span-4 lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-37.5 mb-2" />
          <Skeleton className="h-4 w-62.5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-50" />
                  <Skeleton className="h-3 w-37.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 lg:col-span-3 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions across the platform
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-50 items-center justify-center text-sm text-muted-foreground">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-8">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start">
                {/* Icon Container */}
                <div className="relative z-10 mr-4 flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm">
                  {item.type === "invoice" ? (
                    <FileText className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1">
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.date)}
                  </time>
                  {item.status === InvoiceStatus.PAID && (
                    <div className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Paid
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { FileText, Clock, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatRelativeTime, formatCurrency } from "@/lib/utils/format";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useClients } from "@/lib/hooks/use-clients";
import { InvoiceStatus } from "@/lib/types";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";
import ActivityTimelineSkeleton from "@/components/layout/activity-timeline-skeleton";

export function ActivityTimeline() {
  const { entries: timeEntries, isLoading: isLoadingTime } = useTimeEntries({
    limit: 20,
  });

  const { invoices, isLoading: isLoadingInvoices } = useInvoices();

  const { clients, isLoading: isLoadingClients } = useClients();

  const activities = useMemo(() => {
    const safeInvoices = invoices || [];
    const safeTimeEntries = timeEntries || [];
    const safeClients = clients || [];

    const invoiceItems = safeInvoices.map((inv) => {
      const client =
        inv.client || safeClients.find((c) => c.id === inv.client_id);
      const clientName = client?.name || "Unknown Client";

      return {
        type: "invoice",
        id: inv.id,
        title: `Invoice #${inv.invoice_number}`,
        subtitle: `${formatCurrency(inv.total)} to ${clientName}`,
        date: inv.created_at,
        status: inv.status,
      };
    });

    const timeItems = safeTimeEntries.map((entry) => ({
      type: "time",
      id: entry.id,
      title: "Time Logged",
      subtitle: `${entry.description || "No description"} (${
        entry.project?.name || "Untitled Project"
      })`,
      date: entry.created_at || entry.start_time,
      status: "completed",
    }));

    return [...invoiceItems, ...timeItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices, timeEntries, clients]);

  if (isLoadingInvoices || isLoadingTime || isLoadingClients) {
    return <ActivityTimelineSkeleton />;
  }

  return (
    <Card className="col-span-4 lg:col-span-3 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions across the platform
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {activities.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground min-h-50">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-8 mt-4">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start group">
                {/* Icon Container */}
                <div className="relative z-10 mr-4 flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm group-hover:border-primary/50 transition-colors">
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
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1">
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.date)}
                  </time>
                  {item.status === InvoiceStatus.PAID && (
                    <div className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
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

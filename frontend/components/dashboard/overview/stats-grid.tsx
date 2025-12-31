"use client";

import { DollarSign, Clock, AlertCircle, Briefcase } from "lucide-react";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useProjects } from "@/lib/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import { InvoiceStatus } from "@/lib/types";
import StatsGridSkeleton from "@/components/layout/stats-grid-skeleton";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";

export function StatsGrid() {
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const { entries: timeEntries, isLoading: isLoadingEntries } =
    useTimeEntries();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();

  // --- LOADING STATE ---
  if (isLoadingInvoices || isLoadingEntries || isLoadingProjects) {
    return <StatsGridSkeleton />;
  }

  // --- CALCULATIONS ---

  // 1. Total Revenue (Paid Invoices)
  const totalRevenue = (invoices || [])
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  // 2. Total Hours (All Time Entries)
  const totalSeconds = (timeEntries || []).reduce(
    (sum, entry) => sum + (entry.duration_seconds || 0),
    0
  );
  const totalHours = formatHours(totalSeconds);

  // 3. Outstanding Invoices (Sent + Overdue)
  const outstandingInvoices = (invoices || []).filter((inv) =>
    [InvoiceStatus.SENT, InvoiceStatus.OVERDUE].includes(inv.status)
  );
  const outstandingAmount = outstandingInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.total),
    0
  );

  // 4. Active Projects (Count)
  const activeProjectsCount = (projects || []).filter(
    (p) => p.is_active
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lifetime earnings
          </p>
        </CardContent>
      </Card>

      {/* Hours Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Hours Tracked
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {(timeEntries || []).length} sessions
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Payment
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(outstandingAmount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {outstandingInvoices.length} invoice(s) due
          </p>
        </CardContent>
      </Card>

      {/* Active Projects (Replaces generic "Avg Rate") */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Projects
          </CardTitle>
          <Briefcase className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjectsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently in progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

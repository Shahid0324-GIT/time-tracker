import { useMemo } from "react";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";
import { useProjects } from "@/lib/hooks/use-projects";
import { InvoiceStatus } from "@/lib/types";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

export function useAnalytics(dateRange: DateRange | undefined) {
  const { invoices, isLoading: loadingInvoices } = useInvoices();
  const { entries, isLoading: loadingEntries } = useTimeEntries({
    limit: 500,
  }); // Fetch more for analytics
  const { projects, isLoading: loadingProjects } = useProjects();

  const isLoading = loadingInvoices || loadingEntries || loadingProjects;

  const data = useMemo(() => {
    if (
      isLoading ||
      !invoices ||
      !entries ||
      !projects ||
      !dateRange?.from ||
      !dateRange?.to
    ) {
      return null;
    }

    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);

    // 1. FILTER DATA BY DATE RANGE
    const filteredInvoices = invoices.filter((inv) =>
      isWithinInterval(new Date(inv.issue_date), { start, end })
    );

    const filteredEntries = entries.filter((entry) =>
      isWithinInterval(new Date(entry.start_time), { start, end })
    );

    // 2. CALCULATE KPI METRICS

    // Revenue
    const revenue = filteredInvoices
      .filter((i) => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + Number(i.total), 0);

    const pendingRevenue = filteredInvoices
      .filter(
        (i) =>
          i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE
      )
      .reduce((sum, i) => sum + Number(i.total), 0);

    // Time
    const totalSeconds = filteredEntries.reduce(
      (sum, e) => sum + (e.duration_seconds || 0),
      0
    );
    const totalHours = totalSeconds / 3600;

    const billableSeconds = filteredEntries
      .filter((e) => e.is_billable)
      .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
    const billableHours = billableSeconds / 3600;

    // Utilization Rate (Billable / Total)
    const utilizationRate =
      totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    // 3. PROJECT PERFORMANCE (Top 5)
    const projectStats: Record<
      string,
      { name: string; revenue: number; hours: number }
    > = {};

    // Let's calculate "Production Value" (Hours * Project Rate)
    filteredEntries.forEach((entry) => {
      if (!entry.project_id) return;
      const project = projects.find((p) => p.id === entry.project_id);
      if (!project) return;

      if (!projectStats[project.name]) {
        projectStats[project.name] = {
          name: project.name,
          revenue: 0,
          hours: 0,
        };
      }

      const hours = (entry.duration_seconds || 0) / 3600;
      projectStats[project.name].hours += hours;

      if (entry.is_billable) {
        projectStats[project.name].revenue +=
          hours * Number(project.hourly_rate || 0);
      }
    });

    const topProjects = Object.values(projectStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenue,
      pendingRevenue,
      totalHours,
      billableHours,
      utilizationRate,
      topProjects,
      invoiceCount: filteredInvoices.length,
      timeEntryCount: filteredEntries.length,
    };
  }, [invoices, entries, projects, dateRange, isLoading]);

  return { data, isLoading };
}

"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useProjects } from "@/lib/hooks/use-projects";
import { InvoiceStatus } from "@/lib/types";
import { format, subMonths } from "date-fns";
import AnalyticsSkeletopn from "@/components/layout/analytics-skeleton";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";

export function AnalyticsCharts() {
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { entries: timeEntries, isLoading: isLoadingTime } = useTimeEntries();

  // --- 1. PREPARE REVENUE DATA (Last 6 Months) ---
  const revenueData = useMemo(() => {
    if (!invoices) return [];

    // Create array of last 6 month names (e.g., ["Jul", "Aug", ...])
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return format(d, "MMM"); // "Jan", "Feb"
    });

    // Group paid invoices by month
    const revenueByMonth: Record<string, number> = {};

    invoices.forEach((inv) => {
      if (inv.status === InvoiceStatus.PAID) {
        const monthName = format(new Date(inv.issue_date), "MMM");
        // Only count if it falls within our label range (simple filter)
        if (months.includes(monthName)) {
          revenueByMonth[monthName] =
            (revenueByMonth[monthName] || 0) + parseFloat(inv.total);
        }
      }
    });

    // Map to Recharts format
    return months.map((month) => ({
      name: month,
      total: revenueByMonth[month] || 0,
    }));
  }, [invoices]);

  // --- 2. PREPARE PROJECT DISTRIBUTION (By Hours Tracked) ---
  const projectDistribution = useMemo(() => {
    if (!projects || !timeEntries) return [];

    // Calculate total seconds per project
    const hoursByProject: Record<string, number> = {};
    timeEntries.forEach((t) => {
      hoursByProject[t.project_id] =
        (hoursByProject[t.project_id] || 0) + (t.duration_seconds || 0);
    });

    // Map to Recharts format, filtering out projects with 0 hours
    return projects
      .filter((p) => p.is_active)
      .map((p) => ({
        name: p.name,
        value: Math.round((hoursByProject[p.id] || 0) / 3600), // Convert to hours
        color: p.color,
      }))
      .filter((item) => item.value > 0) // Only show projects with activity
      .sort((a, b) => b.value - a.value) // Sort biggest first
      .slice(0, 5); // Limit to top 5 to prevent clutter
  }, [projects, timeEntries]);

  // --- LOADING STATE ---
  if (isLoadingInvoices || isLoadingProjects || isLoadingTime) {
    return <AnalyticsSkeletopn />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-7">
      {/* --- CHART 1: REVENUE --- */}
      <Card className="col-span-4 min-w-0">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Monthly paid revenue (Last 6 months)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{ width: "100%", height: 300 }}
            className="overflow-hidden"
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 500, height: 300 }}
            >
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number | undefined) => [
                    `$${value ?? 0}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* --- CHART 2: PROJECT HOURS DISTRIBUTION --- */}
      <Card className="col-span-3 min-w-0">
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
          <CardDescription>Hours tracked per project</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{ width: "100%", height: 300 }}
            className="relative overflow-hidden"
          >
            {projectDistribution.length > 0 ? (
              <>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{ width: 300, height: 300 }}
                >
                  <PieChart>
                    <Pie
                      data={projectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) => [
                        `${value ?? 0} hrs`,
                        "Tracked",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-2xl font-bold">
                    {projectDistribution.reduce(
                      (acc, curr) => acc + curr.value,
                      0
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No time data tracked yet.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {projectDistribution.map((p, i) => (
              <div
                key={i}
                className="flex items-center text-xs text-muted-foreground"
              >
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

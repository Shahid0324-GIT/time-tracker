"use client";

import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { BarChart3, TrendingUp, Clock, Wallet, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  // Default to current month
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data, isLoading } = useAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Safe defaults if data is null
  const stats = data || {
    revenue: 0,
    pendingRevenue: 0,
    totalHours: 0,
    billableHours: 0,
    utilizationRate: 0,
    topProjects: [],
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid invoices in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billable Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(stats.billableHours * 3600)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.utilizationRate.toFixed(1)}% Utilization Rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.pendingRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sent & Overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Effective Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.billableHours > 0
                ? formatCurrency(stats.revenue / stats.billableHours)
                : "$0.00"}
              <span className="text-sm font-normal text-muted-foreground">
                /hr
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on paid revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* TOP PROJECTS CHART */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Projects by Value</CardTitle>
            <CardDescription>
              Estimated production value (Hours × Hourly Rate)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-87.5 w-full">
              {stats.topProjects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topProjects}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number | undefined) => [
                        formatCurrency(value || 0),
                        "Value",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  No project activity in this period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TIME BREAKDOWN */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Time Breakdown</CardTitle>
            <CardDescription>Billable vs. Non-Billable Hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 mt-4">
              {/* Billable Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Billable</span>
                  <span className="text-muted-foreground">
                    {formatHours(stats.billableHours * 3600)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.utilizationRate}%` }}
                  />
                </div>
              </div>

              {/* Non-Billable Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Non-Billable</span>
                  <span className="text-muted-foreground">
                    {formatHours(
                      (stats.totalHours - stats.billableHours) * 3600
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${100 - stats.utilizationRate}%` }}
                  />
                </div>
              </div>

              {/* Summary Box */}
              <div className="rounded-lg bg-muted/50 p-4 mt-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Tracked</span>
                  <span className="text-lg font-bold">
                    {formatHours(stats.totalHours * 3600)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Efficiency</span>
                  <span>{stats.utilizationRate.toFixed(0)}% Billable</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

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
import { mockProjects } from "@/data/mock";

// --- Mock Data (Same as before) ---
const revenueData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 2400 },
  { name: "May", total: 3200 },
  { name: "Jun", total: 2800 },
  { name: "Jul", total: 4100 },
];

const projectDistribution = mockProjects.map((p) => ({
  name: p.name,
  value: parseFloat(p.hourly_rate) * 10,
  color: p.color,
}));

export function AnalyticsCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-7">
      <Card className="col-span-4 min-w-0">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Monthly revenue performance for 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Wrapper with enforced dimensions and overflow clip for safety */}
          <div
            style={{ width: "100%", height: 300 }}
            className="overflow-hidden"
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 400, height: 300 }} // FIX 3: Suppress initial measurement warning
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

      {/* Pie Chart Card */}
      <Card className="col-span-3 min-w-0">
        <CardHeader>
          <CardTitle>Project Distribution</CardTitle>
          <CardDescription>Revenue share by project</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Wrapper with enforced dimensions and overflow clip */}
          <div
            style={{ width: "100%", height: 300 }}
            className="relative overflow-hidden"
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 300, height: 300 }} // FIX 3: Suppress initial measurement warning (square for pie)
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-bold">{mockProjects.length}</span>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </div>
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

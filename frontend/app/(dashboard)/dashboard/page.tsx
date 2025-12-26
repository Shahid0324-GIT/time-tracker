import { Metadata } from "next";
import { HeroSection } from "@/components/dashboard/overview/hero-section";
import { StatsGrid } from "@/components/dashboard/overview/stats-grid";
import { AnalyticsCharts } from "@/components/dashboard/overview/analytics-charts";
import { ActivityTimeline } from "@/components/dashboard/overview/activity-timeline";

export const metadata: Metadata = {
  title: "Dashboard | Time Tracker Application",
  description: "Overview of your projects and invoices",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <section>
        <HeroSection />
      </section>

      <section>
        <StatsGrid />
      </section>

      {/* 3. Charts & Visuals */}
      <section>
        <AnalyticsCharts />
      </section>

      {/* 4. Detailed Feed (Could be split with another component later) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityTimeline />

        {/* Placeholder for a secondary widget (e.g., Quick Tasks) */}
        <div className="col-span-4 lg:col-span-4 rounded-xl border border-dashed bg-muted/50 p-8 flex items-center justify-center text-muted-foreground text-sm">
          Coming Soon: Quick Tasks & Reminders
        </div>
      </div>
    </div>
  );
}

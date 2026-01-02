"use client";
import { HeroSection } from "@/components/dashboard/overview/hero-section";
import { StatsGrid } from "@/components/dashboard/overview/stats-grid";
import { AnalyticsCharts } from "@/components/dashboard/overview/analytics-charts";
import { ActivityTimeline } from "@/components/dashboard/overview/activity-timeline";
import { PaymentWatchlist } from "@/components/dashboard/overview/payment-watchlist"; // Import

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
      {/* 1. Hero: Active Timer or Quick Start */}
      <section>
        <HeroSection />
      </section>

      {/* 2. Key Metrics */}
      <section>
        <StatsGrid />
      </section>

      {/* 3. Charts & Visuals */}
      <section>
        <AnalyticsCharts />
      </section>

      {/* 4. Detailed Feed & Watchlist */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ActivityTimeline />
        <PaymentWatchlist />
      </div>
    </div>
  );
}

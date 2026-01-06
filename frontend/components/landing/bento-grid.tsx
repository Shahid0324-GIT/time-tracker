"use client";

import { motion } from "framer-motion";
import { BarChart3, ShieldCheck, Download, Clock } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import BlurText from "@/components/ui/react-bits/BlurText";

export function BentoGrid() {
  return (
    <section
      id="details"
      className="py-32 relative overflow-hidden scroll-mt-28"
    >
      {/* Background Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-cyan-100/50 dark:bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header with BlurText */}
        <div className="text-center mb-20 space-y-4 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white flex flex-col items-center gap-2">
            <BlurText
              text="Everything you need"
              className="text-gray-900 dark:text-white"
              delay={50}
              animateBy="words"
              direction="bottom"
            />
            <div className="flex gap-2">
              <span className="text-gray-900 dark:text-white">to</span>
              <BlurText
                text="scale."
                className="text-cyan-600 dark:text-cyan-400"
                delay={200}
                animateBy="letters"
                direction="top"
              />
            </div>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg pt-4"
          >
            Built for speed, security, and scalability. No bloat, just the
            features high-performance freelancers rely on.
          </motion.p>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Card 1: Analytics (Large Span) */}
          <SpotlightCard
            className="md:col-span-2 p-8 bg-white dark:bg-transparent"
            spotlightColor="rgba(34, 211, 238, 0.15)"
          >
            <div className="h-full flex flex-col justify-between z-10 relative">
              <div className="space-y-2">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 w-fit rounded-xl border border-cyan-200 dark:border-cyan-500/20">
                  <BarChart3 className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Visualize your revenue streams, billable hours, and client
                  distribution with interactive charts. Know exactly where your
                  money comes from.
                </p>
              </div>

              {/* Decorative Mini Chart */}
              <div className="flex items-end gap-2 h-24 w-full opacity-50 mask-gradient-b">
                {[40, 70, 45, 90, 60, 80, 50, 95, 60, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="flex-1 bg-cyan-300/60 dark:bg-cyan-500/30 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Security (Small) */}
          <SpotlightCard
            className="md:col-span-1 p-8 bg-white dark:bg-transparent"
            spotlightColor="rgba(168, 85, 247, 0.15)"
          >
            <div className="h-full flex flex-col justify-between">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 w-fit rounded-xl border border-purple-200 dark:border-purple-500/20">
                <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Bank-Grade Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your data is encrypted at rest and in transit. We use
                  industry-standard authentication to keep your client data
                  safe.
                </p>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Global Timer (Small) */}
          <SpotlightCard
            className="md:col-span-1 p-8 bg-white dark:bg-transparent"
            spotlightColor="rgba(234, 179, 8, 0.15)"
          >
            <div className="h-full flex flex-col justify-between">
              <div className="p-3 bg-amber-50 dark:bg-yellow-500/10 w-fit rounded-xl border border-amber-200 dark:border-yellow-500/20">
                <Clock className="w-8 h-8 text-amber-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Global Timer
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track time from anywhere in the app. The floating widget
                  follows you so you never forget to stop the clock.
                </p>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Export (Large Span) */}
          <SpotlightCard
            className="md:col-span-2 p-8 bg-white dark:bg-transparent"
            spotlightColor="rgba(34, 197, 94, 0.15)"
          >
            <div className="h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <div className="p-3 bg-emerald-50 dark:bg-green-500/10 w-fit rounded-xl border border-emerald-200 dark:border-green-500/20">
                  <Download className="w-8 h-8 text-emerald-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Accountant-Ready Exports
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tax season? No problem. Export all your data to CSV or PDF
                    with a single click. Compatible with QuickBooks, Xero, and
                    more.
                  </p>
                </div>
              </div>

              {/* Decorative UI Element */}
              <div className="relative w-full md:w-48 h-32 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col gap-2 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <div className="h-2 w-1/2 bg-gray-300 dark:bg-white/20 rounded-full" />
                <div className="h-2 w-3/4 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="mt-auto flex justify-end">
                  <div className="px-3 py-1 rounded-md bg-emerald-100 dark:bg-green-500/20 text-emerald-700 dark:text-green-400 text-xs font-mono">
                    export_data.csv
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

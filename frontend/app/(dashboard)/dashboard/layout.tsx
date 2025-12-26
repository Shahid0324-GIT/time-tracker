import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Time Tracker - Dashboard",
  description:
    "Professional time tracking and invoicing application for tracking time, managing tasks, and generating invoices efficiently.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </main>
  );
}

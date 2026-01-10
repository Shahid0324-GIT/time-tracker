import type { Metadata } from "next";
import DashboardClient from "@/components/layout/dashboard-layout";

export const metadata: Metadata = {
  title: "Dashboard | Freelance Flow Application",
  description: "Overview of your projects and invoices",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardClient>{children}</DashboardClient>;
}

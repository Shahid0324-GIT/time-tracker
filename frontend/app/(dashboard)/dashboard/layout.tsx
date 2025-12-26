import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/header/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Time Tracker - Dashboard",
  description: "Professional time tracking and invoicing application.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

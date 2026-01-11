"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/header/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/authStore";
import FreelanceLoader from "../ui/loader";

export default function DashboardClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading, isAuthenticated } = useAuthStore();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="size-full min-h-screen flex justify-center items-center bg-background">
        <FreelanceLoader />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 transition-colors duration-500">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

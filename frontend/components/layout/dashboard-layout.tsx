"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/header/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { Loader2Icon } from "lucide-react";

export default function DashboardClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="size-full min-h-screen flex justify-center items-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 transition-all">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

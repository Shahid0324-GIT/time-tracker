"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { GlobalTimerWidget } from "./global-timer-widget";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader() {
  const pathname = usePathname();

  // Simple breadcrumb logic: /dashboard/projects -> Home > Dashboard > Projects
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 px-4">
        {/* Sidebar Trigger (Mobile/Desktop) */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Dynamic Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.length > 1 && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {segments[segments.length - 1]}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 px-4">
        <GlobalTimerWidget />

        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-600" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}

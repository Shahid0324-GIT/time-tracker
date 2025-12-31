"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Plus,
  Briefcase,
  Users,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { GlobalTimerWidget } from "./global-timer-widget";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { InvoiceStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { ManualEntryForm } from "../time-tracker/manual-entry-form";

// CHECK THIS PATH: Import your existing form component

export function DashboardHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // State to control the Quick Add Modal
  const [isTimeEntryOpen, setIsTimeEntryOpen] = useState(false);

  // --- NOTIFICATIONS LOGIC ---
  const { data: invoices } = useInvoices();

  const notifications = (invoices || [])
    .filter((inv) => inv.status === InvoiceStatus.OVERDUE)
    .map((inv) => ({
      id: inv.id,
      title: `Overdue Invoice #${inv.invoice_number}`,
      message: `${formatCurrency(inv.total)} due from ${inv.client?.name}`,
      time: inv.due_date,
      type: "alert",
    }));

  const hasNotifications = notifications.length > 0;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex flex-1 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

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
        <div className="flex items-center gap-3 px-4">
          <GlobalTimerWidget />

          {/* --- QUICK ADD DROPDOWN --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Quick Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* MODAL TRIGGER: Time Entry */}
              {/* We use onSelect to trigger state change */}
              <DropdownMenuItem
                onSelect={() => setIsTimeEntryOpen(true)}
                className="cursor-pointer"
              >
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Time Entry</span>
              </DropdownMenuItem>

              {/* LINKS: Other items remain as links for now */}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/projects" className="cursor-pointer">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Project</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/clients" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Client</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/invoices" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Invoice</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- NOTIFICATIONS POPOVER --- */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {hasNotifications && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {hasNotifications && (
                  <span className="text-xs text-muted-foreground">
                    {notifications.length} Unread
                  </span>
                )}
              </div>
              <div className="max-h-75 overflow-y-auto">
                {!hasNotifications ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">All caught up!</p>
                    <p className="text-xs">No pending alerts.</p>
                  </div>
                ) : (
                  <div className="grid">
                    {notifications.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0 cursor-pointer"
                      >
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {note.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {note.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground pt-1">
                            Due: {note.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <ThemeToggle />
        </div>
      </header>

      {/* --- QUICK ADD DIALOGS --- */}
      <Dialog open={isTimeEntryOpen} onOpenChange={setIsTimeEntryOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Quick Time Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ManualEntryForm onSuccess={() => setIsTimeEntryOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

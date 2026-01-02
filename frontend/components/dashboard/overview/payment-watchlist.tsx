"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useClients } from "@/lib/hooks/use-clients";
import { InvoiceStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";

export function PaymentWatchlist() {
  const { invoices } = useInvoices();
  const { clients } = useClients();

  const unpaidInvoices = useMemo(() => {
    if (!invoices) return [];

    // Filter for Sent or Overdue
    const pending = invoices.filter(
      (inv) =>
        inv.status === InvoiceStatus.SENT ||
        inv.status === InvoiceStatus.OVERDUE
    );

    // Sort by Due Date (Closest first)
    return pending
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 4);
  }, [invoices]);

  return (
    <Card className="col-span-4 lg:col-span-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Watchlist
          {unpaidInvoices.length > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0 text-xs"
            >
              {unpaidInvoices.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Unpaid invoices ordered by due date</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {unpaidInvoices.length === 0 ? (
          <div className="flex h-full min-h-50 flex-col items-center justify-center text-center text-muted-foreground space-y-3">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm">No pending invoices found.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {unpaidInvoices.map((inv) => {
              const client = clients?.find((c) => c.id === inv.client_id);
              const isOverdue = inv.status === InvoiceStatus.OVERDUE;
              const dueDate = new Date(inv.due_date);

              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-full p-1.5",
                        isOverdue
                          ? "bg-red-100 text-red-600 dark:bg-red-900/20"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
                      )}
                    >
                      {isOverdue ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {client?.name || "Unknown Client"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        #{inv.invoice_number} • Due {format(dueDate, "MMM d")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(Number(inv.total))}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        isOverdue ? "text-red-500" : "text-muted-foreground"
                      )}
                    >
                      {isOverdue ? "Overdue" : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

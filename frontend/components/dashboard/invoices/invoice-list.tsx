"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  FileText,
  Download,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { InvoiceStatus } from "@/lib/types";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useClients } from "@/lib/hooks/use-clients"; // 1. Import useClients
import { invoicesApi } from "@/lib/api/invoices";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";
import InvoiceSkeleton from "@/components/layout/invoice-skeleton";
import { getStatusBadge } from "@/lib/utils/constants";

interface InvoiceListProps {
  searchQuery?: string;
  statusFilter?: string;
}

export function InvoiceList({
  searchQuery = "",
  statusFilter = "all",
}: InvoiceListProps) {
  const { invoices, isLoading, deleteInvoice, updateInvoice } = useInvoices();

  // 2. Fetch clients to look up names
  const { clients } = useClients();

  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- FILTER LOGIC ---
  const filteredInvoices = invoices?.filter((inv) => {
    const clientName =
      inv.client?.name ||
      clients?.find((c) => c.id === inv.client_id)?.name ||
      "";

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(query) ||
      clientName.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ? true : inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- ACTIONS ---
  const markAsPaid = async (id: string) => {
    await updateInvoice({ id, payload: { status: InvoiceStatus.PAID } });
  };

  const markAsSent = async (id: string) => {
    await updateInvoice({ id, payload: { status: InvoiceStatus.SENT } });
  };

  const handleDownload = async (id: string, invoiceNumber: string) => {
    try {
      setDownloadingId(id);
      const blob = await invoicesApi.downloadPdf(id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return <InvoiceSkeleton />;
  }

  if (!filteredInvoices || filteredInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FileText className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold">No Invoices Found</h3>
        <p className="text-sm max-w-sm mt-1 mb-4">
          Generate an invoice to get paid for your hard work.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => {
              // 3. Find Client Name safely
              const client = clients?.find((c) => c.id === inv.client_id);
              const clientName = inv.client?.name || client?.name || "Unknown";

              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">
                    #{inv.invoice_number}
                  </TableCell>

                  <TableCell>
                    <span className="font-medium">{clientName}</span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("capitalize", getStatusBadge(inv.status))}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(inv.issue_date), "MMM d, yyyy")}
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(inv.total))}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        {/* Download PDF */}
                        <DropdownMenuItem
                          onClick={() =>
                            handleDownload(inv.id, inv.invoice_number)
                          }
                          className="cursor-pointer"
                        >
                          {downloadingId === inv.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download PDF
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Status Actions */}
                        {inv.status === InvoiceStatus.DRAFT && (
                          <DropdownMenuItem
                            onClick={() => markAsSent(inv.id)}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />{" "}
                            Mark Sent
                          </DropdownMenuItem>
                        )}
                        {inv.status !== InvoiceStatus.PAID && (
                          <DropdownMenuItem
                            onClick={() => markAsPaid(inv.id)}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                            Mark Paid
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => setInvoiceToDelete(inv.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* DELETE ALERT */}
      <AlertDialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Associated time entries will be
              marked as &quot;Uninvoiced&quot; again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (invoiceToDelete) deleteInvoice(invoiceToDelete);
                setInvoiceToDelete(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

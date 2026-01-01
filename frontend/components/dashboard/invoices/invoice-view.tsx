"use client";

import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/format";
import { Loader2, Download, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceViewProps {
  invoiceId: string;
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => invoicesApi.getOne(invoiceId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>;
  }

  const handleDownload = async () => {
    try {
      const blob = await invoicesApi.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 w-full p-4 md:p-0">
      {/* HEADER: Status & Actions */}
      <div className="flex items-center justify-between print:hidden bg-muted/20 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Status:
          </span>
          <Badge variant="outline" className="text-sm capitalize px-3">
            {invoice.status}
          </Badge>
        </div>
        <Button size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* INVOICE CONTENT */}
      <div className="w-full">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              INVOICE
            </h1>
            <p className="text-muted-foreground mt-1 font-mono">
              #{invoice.invoice_number}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <span className="text-muted-foreground">Issue Date:</span>
              <span className="font-medium">
                {format(new Date(invoice.issue_date), "MMM d, yyyy")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium">
                {format(new Date(invoice.due_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Bill To
            </h3>
            <div className="font-semibold text-lg">{invoice.client?.name}</div>
            {invoice.client?.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Building2 className="h-3.5 w-3.5" /> {invoice.client.company}
              </div>
            )}
            {invoice.client?.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="h-3.5 w-3.5" /> {invoice.client.email}
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-md border mb-8 overflow-hidden w-full">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.line_items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {Number(item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(Number(item.rate))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(item.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-md space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Tax ({Number(invoice.tax_rate) * 100}%)
              </span>
              <span>{formatCurrency(Number(invoice.tax_amount))}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(Number(invoice.total))}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.payment_terms) && (
          <div className="bg-muted/10 rounded-lg p-4 text-sm space-y-2 border border-dashed">
            {invoice.notes && (
              <div>
                <span className="font-semibold text-foreground">Notes:</span>
                <span className="text-muted-foreground ml-1">
                  {invoice.notes}
                </span>
              </div>
            )}
            {invoice.payment_terms && (
              <div>
                <span className="font-semibold text-foreground">
                  Payment Terms:
                </span>
                <span className="text-muted-foreground ml-1">
                  {invoice.payment_terms}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

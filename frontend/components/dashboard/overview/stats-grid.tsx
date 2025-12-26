import { DollarSign, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { mockInvoices, mockTimeEntries } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatHours } from "@/lib/utils/format";
import { InvoiceStatus } from "@/lib/types";

export function StatsGrid() {
  // 1. Calculate Revenue (Paid Invoices)
  const totalRevenue = mockInvoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  // 2. Calculate Hours (All Time Entries)
  const totalSeconds = mockTimeEntries.reduce(
    (sum, entry) => sum + (entry.duration_seconds || 0),
    0
  );
  const totalHours = parseFloat(formatHours(totalSeconds));

  // 3. Calculate Outstanding (Overdue + Sent)
  const outstandingAmount = mockInvoices
    .filter((inv) =>
      [InvoiceStatus.SENT, InvoiceStatus.OVERDUE].includes(inv.status)
    )
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  const outstandingCount = mockInvoices.filter(
    (inv) => inv.status === InvoiceStatus.OVERDUE
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      {/* Hours Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Hours Tracked
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {mockTimeEntries.length} sessions
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Invoices Due
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(outstandingAmount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {outstandingCount} overdue invoice(s)
          </p>
        </CardContent>
      </Card>

      {/* Average Rate (Derived) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg. Hourly Rate
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$135.00</div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on active projects
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

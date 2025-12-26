import { FileText, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { mockInvoices, mockTimeEntries } from "@/data/mock";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatRelativeTime, formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

// Merge and sort data
const activities = [
  ...mockInvoices.map((inv) => ({
    type: "invoice",
    id: inv.id,
    title: `Invoice #${inv.invoice_number}`,
    subtitle: `${formatCurrency(inv.total)} to ${inv.client?.name}`,
    date: inv.created_at,
    status: inv.status,
  })),
  ...mockTimeEntries.map((entry) => ({
    type: "time",
    id: entry.id,
    title: "Time Logged",
    subtitle: `${entry.description} (${entry.project?.name})`,
    date: entry.created_at,
    status: "completed",
  })),
]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5); // Take top 5

export function ActivityTimeline() {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions across the platform
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((item) => (
            <div key={item.id} className="flex items-start">
              {/* Icon Container */}
              <div className="relative z-10 mr-4 flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm">
                {item.type === "invoice" ? (
                  <FileText className="h-4 w-4 text-blue-500" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-col items-end gap-1">
                <time className="text-xs text-muted-foreground">
                  {formatRelativeTime(item.date)}
                </time>
                {item.status === "paid" && (
                  <div className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Paid
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

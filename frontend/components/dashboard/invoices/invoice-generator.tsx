"use client";

import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Loader2,
  ChevronsRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "@/lib/hooks/use-clients";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { formatCurrency, formatDurationTime } from "@/lib/utils/format";
import { TAX_RATES, PAYMENT_TERMS } from "@/lib/utils/constants";
import { InvoiceFormValues, invoiceSchema } from "@/lib/schemas";

// --- STEPS DEFINITION ---
type Step = "select-client" | "select-time" | "configure";

interface InvoiceGeneratorProps {
  onSuccess: () => void;
}

export function InvoiceGenerator({ onSuccess }: InvoiceGeneratorProps) {
  const [step, setStep] = useState<Step>("select-client");

  // Hooks
  const { clients } = useClients();
  const { createInvoice, isCreating } = useInvoices();

  const { entries: allUnbilledEntries, isLoading: isLoadingEntries } =
    useTimeEntries({
      is_billable: true,
      is_invoiced: false,
      limit: 500,
    });

  // --- FORM SETUP ---
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: "",
      time_entry_ids: [],
      issue_date: new Date(),
      due_date: addDays(new Date(), 14),
      tax_rate: "0.00",
      payment_terms: "Net 15",
      notes: "",
    },
  });

  const selectedClientId = useWatch({
    control: form.control,
    name: "client_id",
  });
  const selectedEntryIds = useWatch({
    control: form.control,
    name: "time_entry_ids",
  });
  const taxRate = useWatch({
    control: form.control,
    name: "tax_rate",
  });

  // --- DERIVED DATA ---

  // 1. Filter entries for selected client
  const clientEntries = useMemo(() => {
    if (!selectedClientId || !allUnbilledEntries) return [];
    return allUnbilledEntries.filter(
      (e) => e.project?.client_id === selectedClientId
    );
  }, [selectedClientId, allUnbilledEntries]);

  // 2. Calculate Totals for Preview
  const totals = useMemo(() => {
    const selectedEntries = clientEntries.filter((e) =>
      selectedEntryIds.includes(e.id)
    );

    let subtotal = 0;
    selectedEntries.forEach((e) => {
      // Calculate cost: (seconds / 3600) * hourly_rate
      const hours = (e.duration_seconds || 0) / 3600;
      const rate = Number(e.project?.hourly_rate || 0);
      subtotal += hours * rate;
    });

    const tax = subtotal * Number(taxRate);
    const total = subtotal + tax;

    return { subtotal, tax, total, count: selectedEntries.length };
  }, [clientEntries, selectedEntryIds, taxRate]);

  // --- HANDLERS ---

  const handleClientSelect = (clientId: string) => {
    form.setValue("client_id", clientId);
    form.setValue("time_entry_ids", []);
    setStep("select-time");
  };

  const toggleAllEntries = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "time_entry_ids",
        clientEntries.map((e) => e.id)
      );
    } else {
      form.setValue("time_entry_ids", []);
    }
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    await createInvoice({
      ...data,
      // Convert dates to YYYY-MM-DD strings for backend
      issue_date: format(data.issue_date, "yyyy-MM-dd"),
      due_date: format(data.due_date, "yyyy-MM-dd"),
    });
    onSuccess();
  };

  return (
    <Form {...form}>
      <div className="h-full flex flex-col">
        {/* STEP 1: SELECT CLIENT */}
        {step === "select-client" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Who is this invoice for?</h3>
              <p className="text-sm text-muted-foreground">
                Select a client to see unbilled time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-100 overflow-y-auto p-1">
              {clients?.map((client) => (
                <Button
                  key={client.id}
                  variant="outline"
                  type="button" // Important: Prevent form submission
                  className={cn(
                    "justify-between h-auto py-4 px-6",
                    selectedClientId === client.id &&
                      "border-primary bg-primary/5"
                  )}
                  onClick={() => handleClientSelect(client.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-base">
                      {client.name}
                    </span>
                    {client.company && (
                      <span className="text-xs text-muted-foreground">
                        {client.company}
                      </span>
                    )}
                  </div>
                  <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
              {clients?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No clients found. Add a client first.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT TIME ENTRIES */}
        {step === "select-time" && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setStep("select-client")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <h3 className="font-medium">Unbilled Time</h3>
              <div className="w-17.5"></div> {/* Spacer */}
            </div>

            {isLoadingEntries ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="animate-spin" />
              </div>
            ) : clientEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-medium">No unbilled time found</p>
                <p className="text-sm text-muted-foreground">
                  This client is all caught up!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedEntryIds.length === clientEntries.length &&
                      clientEntries.length > 0
                    }
                    onCheckedChange={toggleAllEntries}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All ({clientEntries.length})
                  </label>
                </div>

                <ScrollArea className="h-100 pr-4 border rounded-md p-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="time_entry_ids"
                      render={() => (
                        <FormItem>
                          {clientEntries.map((entry) => (
                            <FormField
                              key={entry.id}
                              control={form.control}
                              name="time_entry_ids"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={entry.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/50 cursor-pointer"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          entry.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                entry.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== entry.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex-1 grid grid-cols-12 gap-2">
                                      <div className="col-span-12 sm:col-span-6">
                                        <p className="text-sm font-medium">
                                          {entry.project?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                          {entry.description ||
                                            "No description"}
                                        </p>
                                      </div>
                                      <div className="col-span-6 sm:col-span-3 text-right">
                                        <p className="text-sm font-mono">
                                          {format(
                                            new Date(entry.start_time),
                                            "MMM d"
                                          )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatDurationTime(
                                            entry.duration_seconds || 0
                                          )}
                                        </p>
                                      </div>
                                      <div className="col-span-6 sm:col-span-3 text-right">
                                        {/* Estimate Cost */}
                                        <p className="text-sm font-semibold">
                                          {formatCurrency(
                                            ((entry.duration_seconds || 0) /
                                              3600) *
                                              Number(
                                                entry.project?.hourly_rate || 0
                                              )
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </FormItem>
                      )}
                    />
                  </div>
                </ScrollArea>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep("configure")}
                    disabled={selectedEntryIds.length === 0}
                  >
                    Next: Configure ({selectedEntryIds.length})
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: CONFIGURE & REVIEW */}
        {step === "configure" && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("select-time")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <h3 className="font-medium">Final Details</h3>
              <div className="w-17.5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* DATES */}
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* TAX RATE */}
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Tax" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAX_RATES.map((rate) => (
                          <SelectItem key={rate.value} value={rate.value}>
                            {rate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PAYMENT TERMS */}
              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_TERMS.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* NOTES */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thank you for your business!"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUMMARY CARD */}
            <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totals.count} items)</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg" disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Invoice
              </Button>
            </div>
          </form>
        )}
      </div>
    </Form>
  );
}

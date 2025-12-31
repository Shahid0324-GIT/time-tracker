"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from "@/lib/hooks/use-projects";
import { timeEntrySchema, TimeEntryFormValues } from "@/lib/schemas";
import { useTimeEntries } from "@/lib/hooks/use-time-entries";

export function ManualEntryForm() {
  const { createEntry, isCreating } = useTimeEntries();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const activeProjects = projects?.filter((p) => p.is_active) || [];

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      project_id: "",
      description: "",
      date: new Date(),
      start_time: "09:00",
      end_time: "17:00",
      is_billable: true,
    },
  });

  function onSubmit(data: TimeEntryFormValues) {
    const combineDateTime = (date: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      return newDate.toISOString();
    };

    const payload = {
      project_id: data.project_id,
      description: data.description,
      is_billable: data.is_billable,
      start_time: combineDateTime(data.date, data.start_time),
      end_time: combineDateTime(data.date, data.end_time),
    };

    createEntry(payload);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Plus className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-lg">Add Manual Entry</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Row 1: Project & Description */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingProjects}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="What did you work on?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Date & Times */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Billable & Submit */}
          <div className="flex items-center justify-between pt-2">
            <FormField
              control={form.control}
              name="is_billable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    {/* Fix: Checkbox needs specific checked/onCheckedChange handling */}
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Billable</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      This time will be added to the next invoice.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isCreating} size="lg">
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Entry
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

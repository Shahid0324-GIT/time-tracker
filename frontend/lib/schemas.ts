import { z } from "zod";
import { ProjectStatus } from "./types";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const timeEntrySchema = z
  .object({
    project_id: z.string().min(1, "Please select a project"),
    description: z.string().max(500, "Description is too long").optional(),
    date: z.date({
      message: "Date is required",
    }),
    start_time: z
      .string()
      .regex(timeRegex, "Invalid time format (HH:MM)")
      .min(1, "Start time is required"),
    end_time: z
      .string()
      .regex(timeRegex, "Invalid time format (HH:MM)")
      .min(1, "End time is required"),
    is_billable: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      return data.end_time > data.start_time;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;

export const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client_id: z.string().optional(),
  description: z.string().optional(),
  hourly_rate: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Rate must be a positive number",
    }),
  status: z.enum(ProjectStatus),
  color: z.string().min(1, "Color is required"),
});

export type FormValues = z.infer<typeof formSchema>;

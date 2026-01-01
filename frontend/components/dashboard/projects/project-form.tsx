"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/lib/hooks/use-projects";
import { useClients } from "@/lib/hooks/use-clients";
import { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils/utils";
import { formSchema, FormValues } from "@/lib/schemas";
import { PROJECT_COLORS } from "@/lib/utils/constants";

interface ProjectFormProps {
  onSuccess?: () => void;
  projectToEdit?: Project;
}

export function ProjectForm({ onSuccess, projectToEdit }: ProjectFormProps) {
  const { createProject, updateProject, isCreating, isUpdating } =
    useProjects();
  const { clients, isLoading: isLoadingClients } = useClients();

  const isSubmitting = isCreating || isUpdating;

  const defaultValues: FormValues = {
    name: projectToEdit?.name || "",
    client_id: projectToEdit?.client_id || undefined,
    description: projectToEdit?.description || "",
    hourly_rate: projectToEdit?.hourly_rate || "0",
    status: projectToEdit?.status || ProjectStatus.ACTIVE,
    color: projectToEdit?.color || PROJECT_COLORS[6],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (projectToEdit) {
      form.reset({
        name: projectToEdit.name,
        client_id: projectToEdit.client_id || "none",
        description: projectToEdit.description || "",
        hourly_rate: projectToEdit.hourly_rate,
        status: projectToEdit.status,
        color: projectToEdit.color,
      });
    }
  }, [projectToEdit, form]);

  async function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      client_id:
        data.client_id === "none" || !data.client_id
          ? undefined
          : data.client_id,
    };

    if (projectToEdit) {
      await updateProject({ id: projectToEdit.id, payload });
    } else {
      await createProject(payload);
    }

    if (onSuccess) onSuccess();
  }

  return (
    <div className={cn("grid gap-6", onSuccess ? "px-0" : "px-1")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* NAME */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Website Redesign" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CLIENT & STATUS ROW */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                    disabled={isLoadingClients}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Client (Internal)</SelectItem>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProjectStatus.ACTIVE}>
                        Active
                      </SelectItem>
                      <SelectItem value={ProjectStatus.COMPLETED}>
                        Completed
                      </SelectItem>
                      <SelectItem value={ProjectStatus.ARCHIVED}>
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* HOURLY RATE */}
          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The default billable rate for this project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* COLOR PICKER */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Color</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "h-6 w-6 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          field.value === color &&
                            "ring-2 ring-ring ring-offset-2 scale-110"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => form.setValue("color", color)}
                      >
                        {field.value === color && (
                          <Check className="h-3 w-3 text-white mx-auto" />
                        )}
                        <span className="sr-only">Pick {color}</span>
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DESCRIPTION */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Details about the project scope..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {projectToEdit ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

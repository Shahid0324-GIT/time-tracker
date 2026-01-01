"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/lib/hooks/use-clients";
import { Client } from "@/lib/types";
import { cn } from "@/lib/utils/utils";
import {
  clientFormSchema as formSchema,
  ClientFormValues as FormValues,
} from "@/lib/schemas";

interface ClientFormProps {
  onSuccess?: () => void;
  clientToEdit?: Client;
}

export function ClientForm({ onSuccess, clientToEdit }: ClientFormProps) {
  const { createClient, updateClient, isCreating, isUpdating } = useClients();
  const isSubmitting = isCreating || isUpdating;

  // Default Values
  const defaultValues: FormValues = {
    name: clientToEdit?.name || "",
    email: clientToEdit?.email || "",
    company: clientToEdit?.company || "",
    notes: clientToEdit?.notes || "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when clientToEdit changes
  useEffect(() => {
    if (clientToEdit) {
      form.reset({
        name: clientToEdit.name,
        email: clientToEdit.email || "",
        company: clientToEdit.company || "",
        notes: clientToEdit.notes || "",
      });
    }
  }, [clientToEdit, form]);

  async function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      email: data.email || undefined,
      company: data.company || undefined,
      notes: data.notes || undefined,
    };

    if (clientToEdit) {
      await updateClient({ id: clientToEdit.id, payload });
    } else {
      await createClient(payload);
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
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* COMPANY */}
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* NOTES */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Billing details, contact preferences, etc."
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
              {clientToEdit ? "Update Client" : "Add Client"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

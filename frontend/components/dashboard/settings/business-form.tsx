"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

const businessSchema = z.object({
  business_name: z.string().optional(),
  business_address: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type BusinessValues = z.infer<typeof businessSchema>;

export function BusinessForm() {
  const { user, setUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      business_name: user?.business_name || "",
      business_address: user?.business_address || "",
      tax_id: user?.tax_id || "",
      website: user?.website || "",
    },
  });

  async function onSubmit(data: BusinessValues) {
    setIsSaving(true);
    try {
      const updatedUser = await authApi.updateProfile({
        business_name: data.business_name || undefined,
        business_address: data.business_address || undefined,
        tax_id: data.tax_id || undefined,
        website: data.website || undefined,
      });
      setUser(updatedUser);
      toast.success("Business details updated");
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred. Failed to update business details.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-xl"
      >
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business / Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Design Studio" {...field} />
              </FormControl>
              <FormDescription>
                This name will appear at the top of your invoices.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Freelance St, New York, NY"
                  className="min-h-20 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID / VAT</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Business Info
          </Button>
        </div>
      </form>
    </Form>
  );
}

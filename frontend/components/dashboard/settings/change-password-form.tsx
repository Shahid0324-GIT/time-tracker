"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { AxiosError } from "axios";
import { useAuthStore } from "@/lib/stores/authStore";

const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirm_new_password: z.string().min(1, "Confirm new password"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "New passwords do not match",
    path: ["confirm_new_password"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  async function onSubmit(data: PasswordValues) {
    if (user?.email === "janedoe@example.com") {
      toast.error("Demo account password cannot be changed.");
      return;
    }

    setIsSaving(true);
    try {
      await authApi.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success("Password changed successfully");
      form.reset(); // Clear the form on success
    } catch (error: unknown) {
      console.error(error);
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.detail || "Failed to change password"
          : "Failed to change password";
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
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm_new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving || user?.email === "janedoe@example.com"}
            variant="destructive"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </div>
      </form>
    </Form>
  );
}

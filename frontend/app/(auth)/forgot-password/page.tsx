"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequireGuest } from "@/lib/hooks/useRequireAuth";
import { Route } from "next";

const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  useRequireGuest();
  // ✅ Destructure isSendingReset from useAuth
  const { forgotPassword, isSendingReset } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    forgotPassword({ email: data.email });
  };

  return (
    <Card className="shadow-xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-white/20 dark:border-gray-700/20 max-w-md w-full">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
        <CardDescription>
          No worries, we&apos;ll send you reset instructions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      disabled={isSendingReset} // Disable input while sending
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSendingReset}>
              {isSendingReset ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Link
          href={"/login" as Route}
          className={`flex items-center text-sm text-muted-foreground hover:text-primary transition-colors ${
            isSendingReset ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to log in
        </Link>
      </CardFooter>
    </Card>
  );
}

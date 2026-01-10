"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Suspense } from "react";

const verifySchema = z.object({
  otp: z.string().min(6, "OTP must be 6 characters"),
});

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { verifyEmail, isVerifying } = useAuth();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: z.infer<typeof verifySchema>) => {
    if (!email) {
      toast.error("Email is missing. Please register again.");
      return;
    }
    verifyEmail({ email, otp: data.otp });
  };

  if (!email) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Missing email parameter.
      </div>
    );
  }

  return (
    <Card className="shadow-xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-white/20 dark:border-gray-700/20 max-w-md w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit verification code to <br />
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 flex flex-col items-center"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="gap-2">
                        {/* Adjust slots based on your design preference */}
                        <InputOTPSlot
                          index={0}
                          className="h-12 w-10 sm:h-14 sm:w-12 text-lg"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-12 w-10 sm:h-14 sm:w-12 text-lg"
                        />
                        <InputOTPSlot
                          index={2}
                          className="h-12 w-10 sm:h-14 sm:w-12 text-lg"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-12 w-10 sm:h-14 sm:w-12 text-lg"
                        />
                        <InputOTPSlot
                          index={4}
                          className="h-12 w-10 sm:h-14 sm:w-12 text-lg"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-12 w-10 sm:h-14 sm:w-12 text-lg"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                className="underline hover:text-primary"
                onClick={() => toast.info("Coming soon!")}
              >
                Resend
              </button>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

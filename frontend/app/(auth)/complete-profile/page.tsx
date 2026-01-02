"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { Route } from "next";

const setupSchema = z.object({
  business_name: z.string().optional(),
  business_address: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().optional(),
});

type SetupValues = z.infer<typeof setupSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      business_name: "",
      business_address: "",
      tax_id: "",
      website: "",
    },
  });

  const onSubmit = async (data: SetupValues) => {
    setIsSaving(true);
    try {
      // 1. Update Profile
      const updatedUser = await authApi.updateProfile({
        business_name: data.business_name || undefined,
        business_address: data.business_address || undefined,
        tax_id: data.tax_id || undefined,
        website: data.website || undefined,
      });

      // 2. Update Store
      setUser(updatedUser);

      toast.success("Profile setup complete!");
      router.push("/dashboard" as Route);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save details. You can try again in Settings.");
      router.push("/dashboard" as Route);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard" as Route);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="shadow-xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-white/20 dark:border-gray-700/20 max-w-md w-full">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">One last thing!</CardTitle>
          <CardDescription>
            Add your business details so your invoices look professional.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business / Display Name</Label>
              <Input
                id="business_name"
                placeholder="e.g. Acme Design Studio"
                {...form.register("business_name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea
                id="business_address"
                placeholder="123 Freelance St, New York, NY"
                className="min-h-20 resize-none"
                {...form.register("business_address")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID / VAT</Label>
                <Input
                  id="tax_id"
                  placeholder="Optional"
                  {...form.register("tax_id")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://"
                  {...form.register("website")}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pt-0">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            Skip for now <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

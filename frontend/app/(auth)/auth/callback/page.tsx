"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Route } from "next";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Authentication failed. Please try again.");
      router.push("/login" as Route);
      return;
    }

    if (token) {
      // Store token
      // We need to decode the JWT to get user info
      // Or fetch user info from /auth/me endpoint

      // For now, we'll just store the token and fetch user info
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          login(user, token);
          toast.success("Successfully logged in!");
          router.push("/dashboard" as Route);
        })
        .catch(() => {
          toast.error("Failed to fetch user info");
          router.push("/login" as Route);
        });
    } else {
      toast.error("No token received");
      router.push("/login" as Route);
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

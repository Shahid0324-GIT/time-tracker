"use client";
import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth"; // Import our API wrapper
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Route } from "next";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  // Use a ref to prevent double-firing in React Strict Mode
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const error = searchParams.get("error");

    if (error) {
      toast.error("Authentication failed. Please try again.");
      router.push("/login" as Route);
      return;
    }

    // verification function
    const verifyUser = async () => {
      try {
        const user = await authApi.getMe();
        login(user);

        if (!user.business_name) {
          toast.info("Welcome! Let's set up your business profile.");
          router.push("/complete-profile" as Route);
        } else {
          toast.success("Successfully logged in!");
          router.push("/dashboard" as Route);
        }
      } catch (err) {
        console.error("Callback verification failed", err);
        toast.error("Failed to verify authentication");
        router.push("/login" as Route);
      }
    };

    verifyUser();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Finalizing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

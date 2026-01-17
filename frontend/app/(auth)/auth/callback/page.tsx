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
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const error = searchParams.get("error");
    const token = searchParams.get("token"); // ✅ Get Token

    if (error) {
      toast.error("Authentication failed.");
      router.push("/login" as Route);
      return;
    }

    const finalizeLogin = async () => {
      try {
        if (token) {
          await authApi.setSession(token);
        }

        const user = await authApi.getMe();
        login(user);

        toast.success("Successfully logged in!");

        window.history.replaceState({}, document.title, "/auth/callback");

        if (!user.business_name) {
          router.push("/complete-profile" as Route);
        } else {
          router.push("/dashboard" as Route);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to finalize session.";
        toast.error(msg);
        router.push("/login" as Route);
      }
    };

    finalizeLogin();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Finalizing secure login...</p>
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

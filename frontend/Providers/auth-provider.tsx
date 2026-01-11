"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  AUTH_CALLBACK_ROUTES,
  GUEST_ONLY_ROUTES,
  PUBLIC_SHARED_ROUTES,
} from "@/lib/config/navigation";
import FreelanceLoader from "@/components/ui/loader";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, setLoading, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authApi.getMe();
        login(user);

        if (GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
          router.replace("/dashboard");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        logout();

        const isGuestRoute = GUEST_ONLY_ROUTES.some((route) =>
          pathname.startsWith(route)
        );
        const isPublicRoute = PUBLIC_SHARED_ROUTES.includes(pathname);
        const isCallbackRoute = AUTH_CALLBACK_ROUTES.some((route) =>
          pathname.startsWith(route)
        );

        if (!isGuestRoute && !isPublicRoute && !isCallbackRoute) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="size-full min-h-screen flex justify-center items-center">
        <FreelanceLoader />
      </div>
    );
  }

  return <>{children}</>;
}

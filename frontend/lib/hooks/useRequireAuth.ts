"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return { isAuthenticated, user, isLoading };
}

export function useRequireGuest() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return { isAuthenticated, isLoading };
}

export function useCheckAuth() {
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return { isAuthenticated, user, isLoading };
}

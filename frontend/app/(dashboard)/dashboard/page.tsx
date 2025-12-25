"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard" as Route);
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);
  return <h1>Dashboard</h1>;
}

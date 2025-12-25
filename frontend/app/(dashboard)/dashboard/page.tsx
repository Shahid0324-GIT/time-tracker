"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Dashboard() {
  useRequireAuth();
  return <h1>Dashboard</h1>;
}

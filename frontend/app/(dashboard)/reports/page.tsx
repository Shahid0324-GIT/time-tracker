"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Reports() {
  useRequireAuth();
  return <h1>Reports</h1>;
}

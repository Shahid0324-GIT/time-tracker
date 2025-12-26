"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Help() {
  useRequireAuth();
  return <h1>Help</h1>;
}

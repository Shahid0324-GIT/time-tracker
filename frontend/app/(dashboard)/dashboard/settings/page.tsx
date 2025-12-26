"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Settings() {
  useRequireAuth();
  return <h1>Settings</h1>;
}

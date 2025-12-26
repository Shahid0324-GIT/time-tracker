"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Tracker() {
  useRequireAuth();
  return <h1>Tracker</h1>;
}

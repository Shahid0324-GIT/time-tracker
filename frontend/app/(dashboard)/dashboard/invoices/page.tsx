"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Invoices() {
  useRequireAuth();
  return <h1>Invoices</h1>;
}

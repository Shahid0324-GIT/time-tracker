"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Clients() {
  useRequireAuth();
  return <h1>Clients</h1>;
}

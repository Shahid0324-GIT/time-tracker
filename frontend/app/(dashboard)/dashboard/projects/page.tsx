"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function Projects() {
  useRequireAuth();
  return <h1>Projects</h1>;
}

import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

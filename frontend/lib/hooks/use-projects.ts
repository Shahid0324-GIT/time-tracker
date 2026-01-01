import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { ProjectCreate } from "@/lib/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ApiError {
  detail: string;
}

export function useProjects() {
  const queryClient = useQueryClient();
  const queryKey = ["projects"];

  const query = useQuery({
    queryKey,
    queryFn: projectsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to create project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: projectsApi.update,
    onSuccess: () => {
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to delete project");
    },
  });

  return {
    projects: query.data,
    isLoading: query.isLoading,
    isError: query.isError,

    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteProject: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

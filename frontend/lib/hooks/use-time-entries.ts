import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timeApi, TimeEntryFilters } from "@/lib/api/time";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Interface for the error response
interface ApiError {
  detail: string;
}

export function useTimeEntries(filters?: TimeEntryFilters) {
  const queryClient = useQueryClient();
  const queryKey = ["time-entries", filters];

  // --- QUERY: GET ALL ---
  const query = useQuery({
    queryKey,
    queryFn: () => timeApi.getAll(filters),
  });

  // --- MUTATION: CREATE ---
  const createMutation = useMutation({
    mutationFn: timeApi.create,
    onSuccess: () => {
      toast.success("Time entry added successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to create entry");
    },
  });

  // --- MUTATION: UPDATE ---
  const updateMutation = useMutation({
    mutationFn: timeApi.update,
    onSuccess: () => {
      toast.success("Entry updated successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to update entry");
    },
  });

  // --- MUTATION: DELETE ---
  const deleteMutation = useMutation({
    mutationFn: timeApi.delete,
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to delete entry");
    },
  });

  return {
    // Query Data
    entries: query.data,
    isLoading: query.isLoading,
    isError: query.isError,

    // Actions
    createEntry: createMutation.mutate,
    isCreating: createMutation.isPending,

    deleteEntry: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    updateEntry: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

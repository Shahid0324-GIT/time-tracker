import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api/clients";
import { ClientCreate } from "@/lib/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ApiError {
  detail: string;
}

export function useClients() {
  const queryClient = useQueryClient();
  const queryKey = ["clients"];

  // --- QUERY: GET ALL ---
  const query = useQuery({
    queryKey,
    queryFn: clientsApi.getAll,
  });

  // --- MUTATION: CREATE ---
  const createMutation = useMutation({
    mutationFn: (data: ClientCreate) => clientsApi.create(data),
    onSuccess: () => {
      toast.success("Client added successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to add client");
    },
  });

  // --- MUTATION: UPDATE ---
  const updateMutation = useMutation({
    mutationFn: clientsApi.update,
    onSuccess: () => {
      toast.success("Client updated successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to update client");
    },
  });

  // --- MUTATION: DELETE ---
  const deleteMutation = useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => {
      toast.success("Client deleted");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to delete client");
    },
  });

  return {
    clients: query.data,
    isLoading: query.isLoading,
    isError: query.isError,

    createClient: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateClient: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteClient: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

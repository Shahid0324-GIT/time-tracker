import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import { InvoiceCreate } from "@/lib/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ApiError {
  detail: string;
}

export function useInvoices() {
  const queryClient = useQueryClient();
  const queryKey = ["invoices"];

  // --- QUERY: GET ALL ---
  const query = useQuery({
    queryKey,
    queryFn: invoicesApi.getAll,
  });

  // --- MUTATION: CREATE ---
  const createMutation = useMutation({
    mutationFn: (data: InvoiceCreate) => invoicesApi.create(data),
    onSuccess: () => {
      toast.success("Invoice generated successfully");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to create invoice");
    },
  });

  // --- MUTATION: UPDATE ---
  const updateMutation = useMutation({
    mutationFn: invoicesApi.update,
    onSuccess: () => {
      toast.success("Invoice updated");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to update invoice");
    },
  });

  // --- MUTATION: DELETE ---
  const deleteMutation = useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.detail || "Failed to delete invoice");
    },
  });

  return {
    invoices: query.data,
    isLoading: query.isLoading,
    isError: query.isError,

    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateInvoice: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteInvoice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

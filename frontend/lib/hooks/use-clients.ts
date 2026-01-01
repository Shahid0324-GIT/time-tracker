import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api/clients";

export function useClients() {
  const queryKey = ["clients"];

  const query = useQuery({
    queryKey,
    queryFn: clientsApi.getAll,
  });

  return {
    clients: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

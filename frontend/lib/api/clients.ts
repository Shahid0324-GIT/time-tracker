import api from "@/lib/api/client";
import { Client, ClientCreate, ClientUpdate } from "@/lib/types";

export const clientsApi = {
  getAll: async () => {
    const { data } = await api.get<Client[]>("/clients/");
    return data;
  },

  create: async (payload: ClientCreate) => {
    const { data } = await api.post<Client>("/clients/", payload);
    return data;
  },

  update: async ({ id, payload }: { id: string; payload: ClientUpdate }) => {
    const { data } = await api.patch<Client>(`/clients/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
  },
};

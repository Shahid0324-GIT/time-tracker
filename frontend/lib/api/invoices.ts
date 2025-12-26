import api from "@/lib/api/client";
import { Invoice } from "../types";

export const invoicesApi = {
  getAll: async () => {
    const { data } = await api.get<Invoice[]>("/invoices/");
    return data;
  },
};

import api from "@/lib/api/client";
import { InvoiceWithDetails } from "../types";

export const invoicesApi = {
  getAll: async () => {
    const { data } = await api.get<InvoiceWithDetails[]>("/invoices/");
    return data;
  },
};

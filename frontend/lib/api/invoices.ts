import api from "@/lib/api/client";
import {
  Invoice,
  InvoiceWithDetails,
  InvoiceCreate,
  InvoiceUpdate,
} from "@/lib/types";

export const invoicesApi = {
  // Get all invoices (summary view)
  getAll: async () => {
    const { data } = await api.get<InvoiceWithDetails[]>("/invoices/");
    return data;
  },

  // Get single invoice with full line items
  getOne: async (id: string) => {
    const { data } = await api.get<InvoiceWithDetails>(`/invoices/${id}`);
    return data;
  },

  // Create new invoice from time entries
  create: async (payload: InvoiceCreate) => {
    const { data } = await api.post<Invoice>("/invoices/generate", payload);
    return data;
  },

  // Update status, notes, etc.
  update: async ({ id, payload }: { id: string; payload: InvoiceUpdate }) => {
    const { data } = await api.patch<Invoice>(`/invoices/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/invoices/${id}`);
    return data;
  },

  downloadPdf: async (id: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },
};

import { InvoiceStatus, ProjectStatus } from "../types";

export const PROJECT_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#f43f5e", // Rose
  "#64748b", // Slate
];

export const INVOICE_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  sent: "bg-blue-500/10 text-blue-600 border-blue-200",
  paid: "bg-green-500/10 text-green-600 border-green-200",
  overdue: "bg-red-500/10 text-red-600 border-red-200",
};

export const PROJECT_STATUS_COLORS = {
  active: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  completed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  archived: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  default: "bg-gray-100 text-gray-800",
};

export const TAX_RATES = [
  { label: "No Tax (0%)", value: "0.00" },
  { label: "5%", value: "0.05" },
  { label: "8%", value: "0.08" },
  { label: "10%", value: "0.10" },
  { label: "15%", value: "0.15" },
  { label: "20%", value: "0.20" },
];

export const PAYMENT_TERMS = [
  "Due on Receipt",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
];

export const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return PROJECT_STATUS_COLORS.active;
    case ProjectStatus.COMPLETED:
      return PROJECT_STATUS_COLORS.completed;
    case ProjectStatus.ARCHIVED:
      return PROJECT_STATUS_COLORS.archived;
    default:
      return PROJECT_STATUS_COLORS.default;
  }
};

export const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.PAID:
      return INVOICE_STATUS_COLORS.paid;
    case InvoiceStatus.SENT:
      return INVOICE_STATUS_COLORS.sent;
    case InvoiceStatus.OVERDUE:
      return INVOICE_STATUS_COLORS.overdue;
    default:
      return INVOICE_STATUS_COLORS.draft;
  }
};

// ==========================================
// USER & AUTH
// ==========================================
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

// ==========================================
// CLIENTS
// ==========================================
export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface ClientCreate {
  name: string;
  email?: string;
  company?: string;
  notes?: string;
}

export interface ClientUpdate {
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
  is_active?: boolean;
}

// ==========================================
// PROJECTS
// ==========================================
export enum ProjectStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export interface Project {
  id: string;
  user_id: string;
  client_id?: string;
  name: string;
  description?: string;
  hourly_rate: string; // Decimal as string
  currency: string;
  budget_hours?: string;
  status: ProjectStatus;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithClient extends Project {
  client?: Client;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  client_id?: string;
  hourly_rate: string;
  currency?: string;
  budget_hours?: string;
  color?: string;
  status?: ProjectStatus;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  client_id?: string;
  hourly_rate?: string;
  currency?: string;
  budget_hours?: string;
  color?: string;
  status?: ProjectStatus;
}

// ==========================================
// TIME ENTRIES
// ==========================================
export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  is_billable: boolean;
  is_invoiced: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  computed_duration: number;
}

export interface TimeEntryWithProject extends TimeEntry {
  project?: ProjectWithClient;
}

export interface TimeEntryCreate {
  project_id: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_billable?: boolean;
}

export interface TimeEntryManual {
  project_id: string;
  description?: string;
  start_time: string;
  duration_seconds: number;
  is_billable?: boolean;
}

export interface TimerStartRequest {
  project_id: string;
  description?: string;
}

export interface TimerResponse {
  id: string;
  project_id: string;
  description?: string;
  start_time: string;
  elapsed_seconds: number;
}

// ==========================================
// INVOICES
// ==========================================
export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  time_entry_id?: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  notes?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithDetails extends Invoice {
  client?: Client;
  line_items: InvoiceLineItem[];
}

export interface InvoiceCreate {
  client_id: string;
  time_entry_ids: string[];
  issue_date: string;
  due_date: string;
  tax_rate: string;
  notes?: string;
  payment_terms?: string;
}

export interface InvoiceUpdate {
  status?: InvoiceStatus;
  issue_date?: string;
  due_date?: string;
  tax_rate?: string;
  notes?: string;
  payment_terms?: string;
}

// API Error
export interface ApiError {
  detail: string;
}

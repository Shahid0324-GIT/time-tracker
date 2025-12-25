import {
  User,
  Client,
  ProjectWithClient,
  TimeEntryWithProject,
  InvoiceWithDetails,
  ProjectStatus,
  InvoiceStatus,
} from "@/lib/types";

// ==========================================
// MOCK USER
// ==========================================
export const mockUser: User = {
  id: "u1",
  email: "alex@freelancer.com",
  first_name: "Alex",
  last_name: "Dev",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  created_at: "2023-01-01T00:00:00Z",
};

// ==========================================
// MOCK CLIENTS
// ==========================================
export const mockClients: Client[] = [
  {
    id: "c1",
    name: "Acme Corp",
    email: "billing@acme.com",
    company: "Acme Corporation",
    is_active: true,
    created_at: "2023-01-15T10:00:00Z",
    notes: "Big enterprise client, pays Net 60.",
  },
  {
    id: "c2",
    name: "TechStart Inc",
    email: "founders@techstart.io",
    company: "TechStart",
    is_active: true,
    created_at: "2023-03-10T14:30:00Z",
    notes: "Fast moving startup, weekly billing.",
  },
  {
    id: "c3",
    name: "Local Coffee",
    email: "owner@localcoffee.com",
    company: "Local Coffee Shop",
    is_active: true,
    created_at: "2023-05-20T09:15:00Z",
    notes: "Website maintenance only.",
  },
];

// ==========================================
// MOCK PROJECTS
// ==========================================
export const mockProjects: ProjectWithClient[] = [
  {
    id: "p1",
    user_id: "u1",
    client_id: "c1",
    client: mockClients[0],
    name: "Website Redesign",
    description: "Full overhaul of corporate website.",
    hourly_rate: "150.00",
    currency: "USD",
    budget_hours: "100",
    status: ProjectStatus.ACTIVE,
    color: "#3B82F6", // Blue
    is_active: true,
    created_at: "2023-06-01T10:00:00Z",
    updated_at: "2023-06-05T10:00:00Z",
  },
  {
    id: "p2",
    user_id: "u1",
    client_id: "c2",
    client: mockClients[1],
    name: "Mobile App MVP",
    description: "React Native app for iOS and Android.",
    hourly_rate: "120.00",
    currency: "USD",
    budget_hours: "200",
    status: ProjectStatus.ACTIVE,
    color: "#10B981", // Green
    is_active: true,
    created_at: "2023-07-15T09:00:00Z",
    updated_at: "2023-07-20T09:00:00Z",
  },
  {
    id: "p3",
    user_id: "u1",
    client_id: "c3",
    client: mockClients[2],
    name: "Shopify Maintenance",
    description: "Monthly updates and product uploads.",
    hourly_rate: "85.00",
    currency: "USD",
    budget_hours: "10",
    status: ProjectStatus.ACTIVE,
    color: "#F59E0B", // Orange/Yellow
    is_active: true,
    created_at: "2023-02-01T10:00:00Z",
    updated_at: "2023-02-01T10:00:00Z",
  },
  {
    id: "p4",
    user_id: "u1",
    client_id: "c1",
    client: mockClients[0],
    name: "Legacy System Audit",
    description: "Security check of old backend.",
    hourly_rate: "200.00",
    currency: "USD",
    budget_hours: "50",
    status: ProjectStatus.COMPLETED,
    color: "#6B7280", // Gray
    is_active: true,
    created_at: "2023-01-20T10:00:00Z",
    updated_at: "2023-03-01T10:00:00Z",
  },
];

// ==========================================
// MOCK TIME ENTRIES
// ==========================================
// Helper to create dates relative to today
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

export const mockTimeEntries: TimeEntryWithProject[] = [
  {
    id: "t1",
    user_id: "u1",
    project_id: "p1",
    project: mockProjects[0],
    description: "Designing homepage hero section",
    start_time: new Date(today.setHours(9, 0, 0)).toISOString(),
    end_time: new Date(today.setHours(11, 30, 0)).toISOString(),
    duration_seconds: 9000, // 2.5 hours
    computed_duration: 9000,
    is_billable: true,
    is_invoiced: false,
    is_active: true,
    created_at: new Date(today.setHours(9, 0, 0)).toISOString(),
    updated_at: new Date(today.setHours(9, 0, 0)).toISOString(),
  },
  {
    id: "t2",
    user_id: "u1",
    project_id: "p2",
    project: mockProjects[1],
    description: "Setting up Supabase auth",
    start_time: new Date(today.setHours(13, 0, 0)).toISOString(),
    end_time: new Date(today.setHours(15, 0, 0)).toISOString(),
    duration_seconds: 7200, // 2 hours
    computed_duration: 7200,
    is_billable: true,
    is_invoiced: false,
    is_active: true,
    created_at: new Date(today.setHours(13, 0, 0)).toISOString(),
    updated_at: new Date(today.setHours(13, 0, 0)).toISOString(),
  },
  {
    id: "t3",
    user_id: "u1",
    project_id: "p1",
    project: mockProjects[0],
    description: "Client meeting & requirements gathering",
    start_time: new Date(yesterday.setHours(10, 0, 0)).toISOString(),
    end_time: new Date(yesterday.setHours(11, 0, 0)).toISOString(),
    duration_seconds: 3600, // 1 hour
    computed_duration: 3600,
    is_billable: true,
    is_invoiced: true, // Already billed
    is_active: true,
    created_at: new Date(yesterday.setHours(10, 0, 0)).toISOString(),
    updated_at: new Date(yesterday.setHours(10, 0, 0)).toISOString(),
  },
  {
    id: "t4",
    user_id: "u1",
    project_id: "p3",
    project: mockProjects[2],
    description: "Fixing checkout bug",
    start_time: new Date(twoDaysAgo.setHours(14, 0, 0)).toISOString(),
    end_time: new Date(twoDaysAgo.setHours(14, 45, 0)).toISOString(),
    duration_seconds: 2700, // 45 mins
    computed_duration: 2700,
    is_billable: true,
    is_invoiced: false,
    is_active: true,
    created_at: new Date(twoDaysAgo.setHours(14, 0, 0)).toISOString(),
    updated_at: new Date(twoDaysAgo.setHours(14, 0, 0)).toISOString(),
  },
];

// ==========================================
// MOCK INVOICES
// ==========================================
export const mockInvoices: InvoiceWithDetails[] = [
  {
    id: "inv1",
    user_id: "u1",
    client_id: "c1",
    client: mockClients[0],
    invoice_number: "INV-00102",
    status: InvoiceStatus.OVERDUE,
    issue_date: "2023-11-01",
    due_date: "2023-11-15",
    subtotal: "1500.00",
    tax_rate: "0.0",
    tax_amount: "0.0",
    total: "1500.00",
    created_at: "2023-11-01T10:00:00Z",
    updated_at: "2023-11-01T10:00:00Z",
    line_items: [
      {
        id: "li1",
        invoice_id: "inv1",
        description: "Website Redesign - Phase 1",
        quantity: "10",
        rate: "150.00",
        amount: "1500.00",
        created_at: "2023-11-01T10:00:00Z",
      },
    ],
  },
  {
    id: "inv2",
    user_id: "u1",
    client_id: "c2",
    client: mockClients[1],
    invoice_number: "INV-00103",
    status: InvoiceStatus.PAID,
    issue_date: "2023-12-01",
    due_date: "2023-12-15",
    subtotal: "2400.00",
    tax_rate: "0.0",
    tax_amount: "0.0",
    total: "2400.00",
    created_at: "2023-12-01T09:00:00Z",
    updated_at: "2023-12-05T14:00:00Z", // Paid date
    line_items: [
      {
        id: "li2",
        invoice_id: "inv2",
        description: "Mobile App Development - Sprint 1",
        quantity: "20",
        rate: "120.00",
        amount: "2400.00",
        created_at: "2023-12-01T09:00:00Z",
      },
    ],
  },
  {
    id: "inv3",
    user_id: "u1",
    client_id: "c1",
    client: mockClients[0],
    invoice_number: "INV-00104",
    status: InvoiceStatus.DRAFT,
    issue_date: new Date().toISOString().split("T")[0], // Today
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // +30 days
    subtotal: "3600.00", // Matches t3 entry above
    tax_rate: "0.0",
    tax_amount: "0.0",
    total: "3600.00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    line_items: [
      {
        id: "li3",
        invoice_id: "inv3",
        time_entry_id: "t3",
        description: "Client meeting & requirements gathering",
        quantity: "1",
        rate: "150.00",
        amount: "150.00",
        created_at: new Date().toISOString(),
      },
    ],
  },
];

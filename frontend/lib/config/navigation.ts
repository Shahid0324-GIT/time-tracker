import {
  LayoutGrid,
  Clock,
  Briefcase,
  Users,
  Receipt,
  BarChart3,
  Settings,
  // HelpCircle,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    title: "Platform",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutGrid,
      },
      {
        title: "Time Tracker",
        url: "/dashboard/tracker",
        icon: Clock,
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: Briefcase,
      },
      {
        title: "Clients",
        url: "/dashboard/clients",
        icon: Users,
      },
      {
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
];

export const SECONDARY_NAV_ITEMS = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  // {
  //   title: "Help",
  //   url: "/dashboard/help",
  //   icon: HelpCircle,
  // },
];

export const GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/complete-profile",
];

export const PUBLIC_SHARED_ROUTES = ["/"];
export const AUTH_CALLBACK_ROUTES = ["/auth/callback"];

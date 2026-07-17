import {
  LayoutDashboard,
  Coins,
  FileText,
  TrendingUp,
  Brain,
  FileCheck,
  Calculator,
  Link2,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  group: string;
  badgeKey?: "unreadCount" | "attentionRequired" | "apiDisconnected";
  children?: any[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "Bosh oyna",
  },
  {
    title: "AI Yordamchi",
    href: "/support",
    icon: Brain,
    group: "Sun'iy intellekt",
  },
  {
    title: "Tranzaksiyalar",
    href: "/transactions",
    icon: FileText,
    group: "Moliya (Finance)",
  },
  {
    title: "Soliq hisobotlari",
    href: "/reports",
    icon: FileCheck,
    group: "Hisobotlar (Reports)",
  },
  {
    title: "Soliq kalkulyatori",
    href: "/tax-calculator",
    icon: Calculator,
    group: "Hisobotlar (Reports)",
  },
  {
    title: "Integratsiyalar",
    href: "/integrations",
    icon: Link2,
    group: "Tizim (System)",
  },
  {
    title: "Sozlamalar",
    href: "/settings",
    icon: Settings,
    group: "Tizim (System)",
  },
];

export const INTEGRATION_NAV_ITEMS: NavItem[] = [];
export const SYSTEM_NAV_ITEMS: NavItem[] = [];
export const FOOTER_NAV_ITEMS: NavItem[] = [];

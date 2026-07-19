"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { useSidebarStore } from "@/store/sidebar.store";
import { useNotificationStore } from "@/store/notification.store";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useLanguageStore } from "@/store/language.store";
import { t } from "@/locales/t";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  ChevronDown,
  Moon,
  Sun,
  Sparkles,
  Clock,
  Database,
  ArrowRight,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiClient } from "@/services/api-client";
import { toast } from "react-hot-toast";

const getMenuTitle = (title: string) => {
  switch (title) {
    case "Dashboard":
      return t("nav.dashboard");
    case "Rimo AI":
      return t("nav.support");
    case "Tranzaksiyalar":
      return t("nav.transactions");
    case "Soliq hisobotlari":
      return t("nav.reports");
    case "Soliq kalkulyatori":
      return t("nav.taxCalculator");
    case "Integratsiyalar":
      return t("nav.integrations");
    case "Sozlamalar":
      return t("nav.settings");
    default:
      return title;
  }
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggle } = useSidebarStore();
  const { unreadCount } = useNotificationStore();
  const { user, workspace, workspaces, role, clearAuth, switchWorkspace } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { lang, setLanguage } = useLanguageStore();

  // Expanded parent menus state
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "Moliya (Finance)": true,
    "Hisobotlar (Reports)": true,
  });

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
      clearAuth();
      toast.success("Tizimdan muvaffaqiyatli chiqildi.");
      router.push("/connect-government");
    } catch (e) {
      clearAuth();
      router.push("/connect-government");
    }
  };

  const navBadgeValue = (key?: string) => {
    if (key === "unreadCount") return unreadCount > 0 ? unreadCount : undefined;
    return undefined;
  };

  const navItemClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-200 group relative",
      isActive
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
        : "text-[#64748b] hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
    );

  const subNavItemClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-2 pl-9 pr-3.5 py-2 rounded-[8px] text-[11px] font-semibold transition-all duration-200 relative border-l border-slate-100 dark:border-slate-800",
      isActive
        ? "text-[#2563eb] border-l-[#2563eb] font-bold"
        : "text-[#64748b] hover:text-slate-900 dark:hover:text-slate-200"
    );

  return (
    <motion.div
      animate={{ width: isCollapsed ? "76px" : "260px" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-screen border-r border-[#e5e7eb] dark:border-[#1e293b] bg-white dark:bg-[#0b0f19] select-none z-30 shrink-0 shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-[64px] px-5 border-b border-[#e5e7eb] dark:border-[#1e293b]">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-transparent overflow-hidden shadow-sm">
            <img src="/rimo.png" alt="Rimo Logo" className="h-full w-full object-cover" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-bold text-[#0f172a] dark:text-[#f8fafc] tracking-tight text-[13px] leading-tight">
                  Rimo
                </span>
                <span className="text-[9px] text-[#64748b] font-bold tracking-wider uppercase leading-tight">
                  Financial OS
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {!isCollapsed ? (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={toggle}
            className="absolute top-[20px] -right-3.5 p-1 rounded-full border border-[#e5e7eb] dark:border-[#1e293b] bg-white dark:bg-[#0d111c] text-[#64748b] shadow-sm hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] z-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      {workspace && !isCollapsed && (
        <div className="px-4 pt-4 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between w-full px-3.5 py-2.5 text-left rounded-[12px] border border-[#e5e7eb] dark:border-[#1e293b] bg-[#f8fafc] dark:bg-[#151b2c] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all cursor-pointer group">
              <span className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/5 dark:bg-white/5 shrink-0">
                  <Building2 className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold truncate text-[#0f172a] dark:text-[#f8fafc]">
                    {workspace.name}
                  </span>
                  <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider mt-0.5">
                    {role === "Admin" ? "Boshqaruvchi" : "Foydalanuvchi"}
                  </span>
                </div>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#64748b] group-hover:text-slate-800 dark:group-hover:text-white transition-colors shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 bg-white dark:bg-[#151b2c] border-[#e5e7eb] dark:border-[#1e293b] shadow-lg rounded-[12px] p-1.5 z-[100]">
              <div className="px-3 py-1.5 text-[9px] font-bold text-[#64748b] uppercase tracking-wider">
                Ish maydonini almashtirish
              </div>
              {workspaces.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => switchWorkspace(w, "Admin")}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-[8px] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1e293b]"
                >
                  {w.name}
                  {w.id === workspace.id && (
                    <div className="h-2 w-2 rounded-full bg-[#2563eb]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
        <div className="space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children;
            const Icon = item.icon;

            // Check active state
            const isParentActive = item.href ? (
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
            ) : (
              item.children?.some(c => pathname === c.href)
            );

            const isExpanded = expandedItems[item.title];

            if (hasChildren) {
              return (
                <div key={item.title} className="space-y-0.5">
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-200 text-[#64748b] hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer group"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4.5 w-4.5 shrink-0 text-[#64748b] group-hover:text-slate-900 dark:group-hover:text-slate-200" />
                      {!isCollapsed && <span>{getMenuTitle(item.title)}</span>}
                    </span>
                    {!isCollapsed && (
                      isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  {isExpanded && !isCollapsed && (
                    <div className="space-y-0.5 mt-0.5">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={subNavItemClass(isChildActive)}
                          >
                            <span>{getMenuTitle(child.title)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const badge = navBadgeValue(item.badgeKey);

            return (
              <Link key={item.href} href={item.href || "#"} className={navItemClass(!!isParentActive)}>
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    isParentActive
                      ? "text-white dark:text-slate-900"
                      : "text-[#64748b] group-hover:text-slate-900 dark:group-hover:text-slate-200"
                  )}
                />
                {!isCollapsed && <span className="flex-1">{getMenuTitle(item.title)}</span>}
                {badge !== undefined && !isCollapsed && (
                  <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {badge}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-[64px] pointer-events-none scale-0 group-hover:scale-100 bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg transition-all duration-150 whitespace-nowrap z-50 font-medium">
                    {getMenuTitle(item.title)}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-950 rotate-45" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Theme and Logout Buttons */}
      <div className="px-4 py-3 border-t border-[#e5e7eb] dark:border-[#1e293b] space-y-2 bg-white dark:bg-[#0b0f19]">
        {/* Language Selector */}
        <div className="px-0.5">
          {!isCollapsed ? (
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full h-8 text-[10px] font-bold border border-slate-205 dark:border-slate-800 rounded-lg bg-white dark:bg-[#151b2c] text-slate-700 dark:text-slate-300 px-2 cursor-pointer outline-none focus:border-slate-900 transition-all"
            >
              <option value="uz">O'zbekcha (Lotin)</option>
              <option value="uz-cyr">Ўзбекча (Крил)</option>
              <option value="en">English (Eng)</option>
              <option value="ru">Русский (Рус)</option>
            </select>
          ) : (
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full h-8 text-[9px] font-extrabold border border-slate-205 dark:border-slate-800 rounded-lg bg-white dark:bg-[#151b2c] text-slate-750 dark:text-slate-300 cursor-pointer outline-none text-center px-1"
            >
              <option value="uz">UZ</option>
              <option value="uz-cyr">КР</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          )}
        </div>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold text-[#64748b] hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all group relative cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="h-4.5 w-4.5 shrink-0 text-[#64748b]" />
          ) : (
            <Sun className="h-4.5 w-4.5 shrink-0 text-[#64748b]" />
          )}
          {!isCollapsed && <span>{theme === "light" ? "Tungi rejim" : "Kunduzgi rejim"}</span>}
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group relative cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-[#dc2626]" />
          {!isCollapsed && <span>Tizimdan chiqish</span>}
        </button>
      </div>

      {/* Profile Info */}
      {user && !isCollapsed && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#f8fafc] dark:bg-[#151b2c] border border-[#e5e7eb] dark:border-[#1e293b]">
            <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-bold shrink-0">
              {(user.user?.profile?.fullname || user.juridical?.name || "User")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-[#0f172a] dark:text-[#f8fafc] truncate leading-tight">
                {user.user?.profile?.fullname || user.juridical?.name || "Foydalanuvchi"}
              </span>
              <span className="text-[9px] text-[#64748b] truncate leading-tight mt-0.5">
                STIR: {user.pin}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

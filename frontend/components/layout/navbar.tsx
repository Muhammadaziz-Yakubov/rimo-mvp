"use client";

import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { Bell, CircleHelp, ShieldAlert, User, Settings } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { OfflineIndicator } from "../feedback/offline-indicator";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const pathname = usePathname();

  const initials = (user?.user?.profile?.fullname || user?.juridical?.name || "F")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2);

  // Dynamic Page Title & Description in Uzbek (100% Translated)
  let pageTitle = "Bosh sahifa";
  let pageDesc = "Tizimning umumiy holati va oxirgi hisobotlar monitoringi.";

  if (pathname === "/dashboard") {
    pageTitle = "Bosh sahifa";
    pageDesc = "Tizimning umumiy holati va oxirgi hisobotlar monitoringi.";
  } else if (pathname === "/reports/new") {
    pageTitle = "Yangi hisobot";
    pageDesc = "Yangi hisobot loyihasini yaratish va davlat organlariga yuborish.";
  } else if (pathname === "/reports") {
    pageTitle = "Topshirilgan hisobotlar";
    pageDesc = "Barcha yuborilgan va qabul qilingan soliq hisobotlari jurnali.";
  } else if (pathname === "/tax-calculator") {
    pageTitle = "Soliq kalkulyatori";
    pageDesc = "Soliq to'lovlarini avtomatik hisoblash va kelajakdagi xavflarni tahlil qilish.";
  } else if (pathname === "/notifications") {
    pageTitle = "Bildirishnomalar";
    pageDesc = "Sessiyalar, muddatlar va topshiriqlar bo'yicha bildirishnomalar jurnali.";
  } else if (pathname === "/organizations") {
    pageTitle = "Tashkilot";
    pageDesc = "Ulanishlar va yuridik shaxslar ma'lumotlari.";
  } else if (pathname === "/settings" || pathname.startsWith("/settings")) {
    pageTitle = "Sozlamalar";
    pageDesc = "Profil ma'lumotlari va xavfsizlik sozlamalarini boshqarish.";
  }

  return (
    <header className="relative flex items-center justify-between h-[72px] px-6 border-b border-[#e5e7eb] dark:border-[#1e293b] bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl z-25 shrink-0">
      <OfflineIndicator />

      {/* Chap: Sahifa nomi va tavsifi */}
      <div className="flex flex-col min-w-0 pr-4">
        <h2 className="text-base font-bold text-[#0f172a] dark:text-[#f8fafc] tracking-tight leading-tight">
          {pageTitle}
        </h2>
        <p className="text-[10px] text-[#64748b] truncate leading-tight mt-0.5 max-w-[360px] hidden sm:block">
          {pageDesc}
        </p>
      </div>

      {/* O'ng tomon: Qidiruv, Bildirishnoma, Profil */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Qidiruv */}
        <div className="w-[180px] sm:w-[240px]">
          <CommandPalette />
        </div>

        {/* Oflayn ko'rsatgich */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#dc2626] bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-full shrink-0">
            <ShieldAlert className="h-3 w-3" />
            Oflayn rejim
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* Yordam */}
          <button
            onClick={() => router.push("/support")}
            className="p-2 rounded-xl text-[#64748b] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] hover:text-[#0f172a] dark:hover:text-[#f8fafc] transition-colors"
            title="Yordam markazi"
          >
            <CircleHelp className="h-4.5 w-4.5" />
          </button>

          {/* Bildirishnomalar */}
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 rounded-xl text-[#64748b] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] hover:text-[#0f172a] dark:hover:text-[#f8fafc] transition-colors"
            title="Bildirishnomalar"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-[#dc2626]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
              </span>
            )}
          </button>
        </div>

        <div className="h-5 w-px bg-[#e5e7eb] dark:bg-[#1e293b] shrink-0" />

        {/* Profil */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors focus:outline-none cursor-pointer group">
              <div className="h-7 w-7 rounded-full bg-[#2563eb]/15 text-[#2563eb] flex items-center justify-center text-[10px] font-bold ring-1 ring-blue-500/20 shrink-0">
                {initials}
              </div>
              <div className="flex flex-col items-start hidden lg:flex text-left">
                <span className="text-[11px] font-bold text-[#0f172a] dark:text-[#f8fafc] max-w-[110px] truncate leading-tight">
                  {user.user?.profile?.fullname || user.juridical?.name || "Foydalanuvchi"}
                </span>
                <span className="text-[9px] text-[#64748b] leading-tight mt-0.5">
                  {user.credential?.username || user.pin}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-[#151b2c] border-[#e5e7eb] dark:border-[#1e293b] shadow-lg rounded-[16px] p-1.5"
            >
              <div className="px-3.5 py-2.5">
                <p className="text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] truncate">
                  {user.user?.profile?.fullname || user.juridical?.name || "Foydalanuvchi"}
                </p>
                <p className="text-[9px] text-[#64748b] truncate mt-0.5">
                  STIR: {user.pin}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-[#e5e7eb] dark:bg-[#1e293b]" />
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2.5 text-xs py-2 px-3 rounded-[10px] cursor-pointer hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]"
              >
                <User className="h-3.5 w-3.5 text-[#64748b]" />
                <span>Profil sozlamalari</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings/security")}
                className="flex items-center gap-2.5 text-xs py-2 px-3 rounded-[10px] cursor-pointer hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]"
              >
                <Settings className="h-3.5 w-3.5 text-[#64748b]" />
                <span>Xavfsizlik</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

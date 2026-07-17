"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/use-api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { formatUzDateTime } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { cn } from "@/lib/utils";

const NOTIF_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  deadline_approaching: { label: "Muddat yaqinlashmoqda", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
  api_disconnected: { label: "API uzildi", color: "text-red-600 bg-red-50 dark:bg-red-950/20" },
  token_expired: { label: "Sessiya tugadi", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
  submission_success: { label: "Topshirildi", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
  submission_failed: { label: "Xatolik", color: "text-red-600 bg-red-50 dark:bg-red-950/20" },
  government_maintenance: { label: "Texnik ishlar", color: "text-zinc-600 bg-zinc-100 dark:bg-zinc-800" },
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              {t("notifications.title")}
            </h1>
            <p className="text-[#64748b] text-xs mt-1">
              {t("notifications.description")}
            </p>
          </div>
          {unread > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#2563eb] text-white">
              {unread} yangi
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-400">
            <Bell className="h-12 w-12 opacity-25" />
            <p className="text-sm">{t("notifications.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => {
              const typeInfo = NOTIF_TYPE_LABELS[notif.type] || { label: notif.type, color: "text-zinc-600 bg-zinc-100" };
              return (
                <Card
                  key={notif._id}
                  className={cn(
                    "border-[#e5e7eb] dark:border-[#1e293b] shadow-sm rounded-xl transition-all",
                    !notif.read && "border-l-4 border-l-[#2563eb] bg-blue-50/20 dark:bg-blue-950/5"
                  )}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 mt-0.5", typeInfo.color)}>
                      {typeInfo.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{notif.title}</p>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                    <div className="shrink-0 text-[10px] text-zinc-400 mt-0.5 whitespace-nowrap">
                      {formatUzDateTime(notif.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, LogIn, LogOut, Send, ShieldAlert, Plus, AlertTriangle } from "lucide-react";
import { useAuditLogs } from "@/hooks/use-api";
import { formatUzDateTime } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { cn } from "@/lib/utils";

const ACTION_META: Record<string, { label: string; icon: any; color: string }> = {
  login: { label: "Tizimga kirish", icon: LogIn, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
  logout: { label: "Tizimdan chiqish", icon: LogOut, color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800" },
  submit: { label: "Hisobot yuborildi", icon: Send, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
  submit_failed: { label: "Yuborish muvaffaqiyatsiz", icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-950/20" },
  workspace_created: { label: "Ish maydoni yaratildi", icon: Plus, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/20" },
  sync: { label: "Sinxronizatsiya", icon: History, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
};

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("auditLogs.title")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {t("auditLogs.description")}
          </p>
        </div>

        {/* Table */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold py-3 pl-6">Amal</TableHead>
                  <TableHead className="text-xs font-semibold py-3">Foydalanuvchi IP</TableHead>
                  <TableHead className="text-xs font-semibold py-3">Ish maydoni</TableHead>
                  <TableHead className="text-xs font-semibold py-3">Vaqt</TableHead>
                  <TableHead className="text-xs font-semibold py-3 pr-6">Ma'lumot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="py-4">
                        <div className="h-4 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <History className="h-10 w-10 opacity-25" />
                        <p className="text-sm">{t("auditLogs.empty")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any, i: number) => {
                    const meta = ACTION_META[log.action] || { label: log.action, icon: History, color: "text-zinc-500 bg-zinc-100" };
                    const Icon = meta.icon;
                    return (
                      <TableRow key={log._id || i} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-850/10">
                        <TableCell className="py-3 pl-6">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", meta.color)}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {meta.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-zinc-500 font-mono">
                          {log.userIp || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-zinc-500">
                          {log.workspaceId || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-zinc-500">
                          {formatUzDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell className="py-3 pr-6 text-xs text-zinc-400 font-mono max-w-[200px] truncate">
                          {log.details ? JSON.stringify(log.details).substring(0, 80) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

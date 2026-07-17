"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { useApiActivity } from "@/hooks/use-api";
import { formatUzDateTime } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { cn } from "@/lib/utils";

export default function ApiActivityPage() {
  const { data: logs = [], isLoading } = useApiActivity();

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("apiActivity.title")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {t("apiActivity.description")}
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
                  <TableHead className="text-xs font-semibold py-3">Holat</TableHead>
                  <TableHead className="text-xs font-semibold py-3">Vaqt</TableHead>
                  <TableHead className="text-xs font-semibold py-3 pr-6">Tafsilot</TableHead>
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
                        <Activity className="h-10 w-10 opacity-25" />
                        <p className="text-sm">{t("apiActivity.empty")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any, i: number) => {
                    const isSuccess = log.success !== false && log.action !== "submit_failed";
                    return (
                      <TableRow key={log._id || i} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-850/10">
                        <TableCell className="py-3 pl-6">
                          <div className="flex items-center gap-2">
                            {isSuccess ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                            )}
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {log.action}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-zinc-500 font-mono">
                          {log.userIp || "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                            isSuccess
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400"
                          )}>
                            {isSuccess ? "Muvaffaqiyatli" : "Xatolik"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-zinc-500">
                          {formatUzDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell className="py-3 pr-6 text-xs text-zinc-400 font-mono max-w-[200px] truncate">
                          {log.details ? JSON.stringify(log.details).substring(0, 60) : "—"}
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

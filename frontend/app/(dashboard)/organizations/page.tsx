"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  ShieldCheck,
  AlertCircle,
  WifiOff,
  Loader2,
  FileText,
  User,
  Hash,
  CalendarClock,
} from "lucide-react";
import { useOrganizations } from "@/hooks/use-api";
import { formatUzDate } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { cn } from "@/lib/utils";

const USER_TYPE_LABELS: Record<string, string> = {
  juridical: "Yuridik shaxs",
  basic: "Jismoniy shaxs",
  authority: "Davlat idorasi",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof ShieldCheck }> = {
  connected: {
    label: "Ulangan",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    icon: ShieldCheck,
  },
  disconnected: {
    label: "Ulanmagan",
    color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    icon: WifiOff,
  },
  syncing: {
    label: "Sinxronizatsiya...",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: Loader2,
  },
  error: {
    label: "Xatolik",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    icon: AlertCircle,
  },
};

export default function OrganizationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: organizations = [], isLoading, isError } = useOrganizations();

  const filtered = organizations.filter((org: any) => {
    const q = search.toLowerCase();
    const name = (org.name || "").toLowerCase();
    const tin = String(org.tin || "");
    const username = (org.credentialUsername || "").toLowerCase();
    return name.includes(q) || tin.includes(q) || username.includes(q);
  });

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("organizations.title")}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              {t("organizations.description")}
            </p>
          </div>
          <Button
            onClick={() => router.push("/reports/new")}
            className="bg-[#0B7A3B] hover:bg-[#096631] text-white shadow-sm shrink-0"
          >
            <FileText className="mr-2 h-4 w-4" />
            {t("organizations.createReport")}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-white dark:bg-zinc-900"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 opacity-60" />
            <div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Ma'lumotlarni yuklashda xatolik yuz berdi
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Iltimos, sahifani yangilang yoki qayta kiring.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <Building2 className="h-8 w-8 text-zinc-400 opacity-60" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {t("organizations.empty")}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                {t("organizations.emptyDesc")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((org: any) => {
              const statusCfg = STATUS_CONFIG[org.status] ?? STATUS_CONFIG.disconnected;
              const StatusIcon = statusCfg.icon;
              const userTypeLabel = USER_TYPE_LABELS[org.userType] ?? org.userType ?? "—";

              return (
                <Card
                  key={org.id}
                  className={cn(
                    "border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900 hover:shadow-md transition-all duration-200",
                    org.status === "connected" && "border-l-4 border-l-emerald-500"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Org Avatar */}
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-lg",
                            org.status === "connected"
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          )}
                        >
                          {(org.name?.[0] || org.credentialUsername?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                            {org.name || org.credentialUsername || "—"}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5 flex items-center gap-1">
                            <Hash className="h-3 w-3 shrink-0" />
                            STIR: {org.tin ?? "—"}
                          </CardDescription>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0",
                          statusCfg.color
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "h-3 w-3",
                            org.status === "syncing" && "animate-spin"
                          )}
                        />
                        {statusCfg.label}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3 pb-4">
                    {/* User type */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>{t("organizations.userType")}:</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 font-medium border-zinc-200 dark:border-zinc-700"
                      >
                        {userTypeLabel}
                      </Badge>
                    </div>

                    {/* Credential username */}
                    {org.credentialUsername && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">{org.credentialUsername}</span>
                      </div>
                    )}

                    {/* Last sync */}
                    {org.lastSyncAt && (
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {t("organizations.lastSync")}: {formatUzDate(org.lastSyncAt)}
                        </span>
                      </div>
                    )}

                    {/* Divider + action */}
                    <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs bg-[#0B7A3B] hover:bg-[#096631] text-white"
                        onClick={() =>
                          router.push(`/reports/new?tin=${org.tin}&orgName=${encodeURIComponent(org.name || "")}`)
                        }
                        disabled={org.status !== "connected"}
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        {t("organizations.createReport")}
                      </Button>
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

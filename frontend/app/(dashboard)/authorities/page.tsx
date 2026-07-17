"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Search,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Cable,
} from "lucide-react";
import { useAuthorities, useSyncAuthority } from "@/hooks/use-api";
import { getTranslation } from "@/utils/multilang";
import { formatUzDate, formatUzDateTime } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AuthoritiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: authorities = [], isLoading } = useAuthorities();
  const syncMutation = useSyncAuthority();

  const handleSync = async (id: string) => {
    try {
      await syncMutation.mutateAsync(id);
      toast.success(t("authorities.syncSuccess"));
    } catch {
      toast.error(t("authorities.syncFailed"));
    }
  };

  const filtered = authorities.filter((auth: any) => {
    const name = getTranslation(auth.title, "uz")?.toLowerCase() || "";
    const tin = auth.tin?.toString() || "";
    const q = searchTerm.toLowerCase();
    return name.includes(q) || tin.includes(q);
  });

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("authorities.title")}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              {t("authorities.description")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm bg-white dark:bg-zinc-900"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
            <Building2 className="h-12 w-12 opacity-30" />
            <p className="text-sm">{t("authorities.empty")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((auth: any) => {
              const isSyncing = syncMutation.isPending && syncMutation.variables === auth._id;
              return (
                <Card
                  key={auth._id}
                  className={cn(
                    "border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900 hover:shadow-md transition-all duration-200 group",
                    auth.connectionStatus === "connected" && "border-l-4 border-l-emerald-500"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          {auth.connectionStatus === "connected" ? (
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                            {getTranslation(auth.title, "uz") || auth.credentialUsername || "—"}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            STIR: {auth.tin || "—"}
                          </CardDescription>
                        </div>
                      </div>
                      <StatusBadge
                        status={auth.connectionStatus || "disconnected"}
                        type="authority"
                        className="shrink-0 text-[10px]"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Cable className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {t("authorities.lastSync")}: {formatUzDate(auth.lastSyncAt) || "—"}
                      </span>
                    </div>
                    {auth.code && (
                      <div className="text-xs text-zinc-400 font-mono">
                        {auth.code}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs font-semibold"
                        onClick={() => handleSync(auth._id)}
                        disabled={isSyncing || syncMutation.isPending}
                      >
                        <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isSyncing && "animate-spin")} />
                        {isSyncing ? t("authorities.syncing") : t("common.sync")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => router.push(`/authorities/${auth._id}`)}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
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

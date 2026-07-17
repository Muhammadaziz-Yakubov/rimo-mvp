"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cable, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useAuthorities } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth.store";
import { getTranslation } from "@/utils/multilang";
import { formatUzDateTime } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { cn } from "@/lib/utils";

export default function ConnectionsPage() {
  const { data: authorities = [], isLoading } = useAuthorities();
  const { user, workspace } = useAuthStore();

  const connected = authorities.filter((a: any) => a.connectionStatus === "connected");
  const disconnected = authorities.filter((a: any) => a.connectionStatus !== "connected");

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("connections.title")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {t("connections.description")}
          </p>
        </div>

        {/* Overall Status */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              connected.length > 0
                ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            )}>
              {connected.length > 0 ? (
                <ShieldCheck className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {connected.length > 0
                  ? `${connected.length} ta tashkilot ulangan`
                  : "Hech bir tashkilot ulanmagan"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                api.hisobot.gov.uz integratsiyasi · Ish maydoni: {workspace?.name || "—"}
              </p>
            </div>
            <div className="ml-auto">
              <span className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                connected.length > 0
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {connected.length > 0 ? "Faol" : "Ulanmagan"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Authorities list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : authorities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
            <Cable className="h-12 w-12 opacity-25" />
            <p className="text-sm">{t("connections.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {authorities.map((auth: any) => (
              <Card key={auth._id} className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    auth.connectionStatus === "connected"
                      ? "bg-emerald-100 dark:bg-emerald-950/30"
                      : "bg-zinc-100 dark:bg-zinc-800"
                  )}>
                    {auth.connectionStatus === "connected" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                      {getTranslation(auth.title, "uz") || auth.credentialUsername || "—"}
                    </p>
                    <div className="flex gap-3 mt-1 text-[10px] text-zinc-400">
                      <span>STIR: {auth.tin || "—"}</span>
                      <span>·</span>
                      <span>Kod: {auth.code || "—"}</span>
                      <span>·</span>
                      <span>Oxirgi sinx: {formatUzDateTime(auth.lastSyncAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                      auth.connectionStatus === "connected"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                    )}>
                      {auth.connectionStatus === "connected" ? t("authorities.connected") : t("authorities.disconnected")}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ExternalLink className="h-4 w-4 text-zinc-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reconnect hint */}
        {disconnected.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10 shadow-sm rounded-xl">
            <CardContent className="p-5 flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {t("connections.reconnect")}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{t("connections.reconnectDesc")}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

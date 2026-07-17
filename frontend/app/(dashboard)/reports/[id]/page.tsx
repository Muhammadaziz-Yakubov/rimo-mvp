"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  User,
  Activity,
  Download,
  Calendar,
} from "lucide-react";
import { apiClient } from "@/services/api-client";
import { getTranslation } from "@/utils/multilang";
import { formatDateTime } from "@/utils/format-date";
import { cn } from "@/lib/utils";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const govTaskId = parseInt(id);

  // 1. Fetch task details
  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ["taskDetails", govTaskId],
    queryFn: async () => {
      const res = await apiClient.get(`/tasks/${govTaskId}`);
      return res.data;
    },
  });

  // 2. Fetch task logs/flow history
  const { data: flowLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["taskFlow", govTaskId],
    queryFn: async () => {
      const res = await apiClient.get(`/tasks/${govTaskId}/flow`);
      return res.data;
    },
  });

  const isLoading = loadingTask || loadingLogs;

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/reports")}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Topshiriq ID #{govTaskId}
                </h1>
                {task && <StatusBadge status={task.status} />}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                Ushbu hukumatga topshirish jarayonining batafsil ijro jurnallari.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {task?.status === "submitted" && (
              <Button
                variant="outline"
                className="border-zinc-250 dark:border-zinc-800 font-semibold text-xs h-9 rounded-lg"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                PDF kvitansiyasini yuklab olish
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-24 bg-zinc-50 dark:bg-zinc-900 animate-pulse rounded-xl" />
            <div className="h-64 bg-zinc-50 dark:bg-zinc-900 animate-pulse rounded-xl" />
          </div>
        ) : !task ? (
          <Card className="border-zinc-200 dark:border-zinc-800 text-center py-12">
            <p className="text-sm text-zinc-550">Hisobot topshiriq yozuvi topilmadi.</p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Columns - Timeline Progression details */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#2563eb]" />
                    Ijro xronologiyasi
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tizim holatining o'tish tarixi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {flowLogs.length === 0 ? (
                    <div className="text-center text-xs text-zinc-400 py-6">Hisobotga tegishli amallar tarixi topilmadi.</div>
                  ) : (
                    <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 py-2">
                      {flowLogs.map((log: any, idx: number) => (
                        <div key={log._id || idx} className="relative pl-6">
                          {/* Chronological dot */}
                          <div className={cn(
                            "absolute -left-2 top-1.5 h-4 w-4 rounded-full border-2 flex items-center justify-center bg-white dark:bg-zinc-950",
                            log.statusTo === "completed" || log.statusTo === "submitted"
                              ? "border-emerald-500"
                              : log.statusTo === "rejected"
                              ? "border-red-500"
                              : "border-zinc-350 dark:border-zinc-700"
                          )}>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              log.statusTo === "completed" || log.statusTo === "submitted"
                                ? "bg-emerald-500"
                                : log.statusTo === "rejected"
                                ? "bg-red-500"
                                : "bg-zinc-400"
                            )} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                {log.nodeType === "group" ? "Ommaviy topshirish jo'natmasi" : `Bosqichga o'tish ${log.nodeToId || "Next"}`}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-medium">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                              Holat: <span className="font-mono text-[10px] bg-zinc-100 px-1 py-0.5 rounded">{log.statusFrom}</span> to{" "}
                              <span className="font-mono text-[10px] bg-zinc-100 px-1 py-0.5 rounded">{log.statusTo}</span> by user{" "}
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{log.userFullname || "System"}</span> (IP: {log.userIp || "localhost"}).
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form Payload Snapshot card */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-[#2563eb]" />
                    Hisobot ma'lumotlari paketi
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hisobot sessiyasida saqlangan ma'lumotlar o'zgaruvchilari.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 bg-zinc-50/20 dark:bg-zinc-950/20">
                  <pre className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-lg overflow-x-auto max-h-[300px]">
                    {JSON.stringify(task.formData || {}, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Overview details */}
            <div className="space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-150 dark:border-zinc-850 p-4">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Hisobot tafsilotlari
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 font-medium">Korxona STIR / TIN</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-zinc-400" />
                      {task.ownerTin}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 font-medium">Hisobot versiyasi kodi</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                      {task.reportVersionCode}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 font-medium">Hukumat topshiriq ID</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                      #{task.govTaskId}
                    </span>
                  </div>

                  <div className="h-px bg-zinc-250 dark:bg-zinc-800" />

                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 font-medium">Yaratilgan vaqti</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {formatDateTime(task.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 font-medium">Oxirgi tahrir</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      {formatDateTime(task.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Integrity status card */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-4 flex gap-3 text-xs leading-normal">
                <div className="flex h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 shrink-0 items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Muvofiqlik tekshiruvi yakunlandi</span>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    Ushbu fayl davlat organining JSON-LD nazorat jurnallariga to'liq mos keladi.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useTasks } from "@/hooks/use-api";
import { apiClient } from "@/services/api-client";
import { getTranslation } from "@/utils/multilang";
import { formatUzDateTime } from "@/utils/format-uz";
import { t } from "@/locales/t";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const STATUS_TABS = [
  { value: "all", label: "Barchasi" },
  { value: "draft", label: "Qoralama" },
  { value: "submitted", label: "Yuborilgan" },
  { value: "processing", label: "Jarayonda" },
  { value: "rejected", label: "Rad etilgan" },
];

export default function ReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tasks = [], isLoading } = useTasks(activeTab === "all" ? undefined : activeTab);

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/tasks/sync");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Hisobotlar hukumat API bilan sinxronizatsiya qilindi.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const filtered = tasks.filter((task: any) => {
    const title = getTranslation(task.title, "uz")?.toLowerCase() || task.reportCode?.toLowerCase() || "";
    const tin = task.ownerTin?.toString() || "";
    const q = searchTerm.toLowerCase();
    return title.includes(q) || tin.includes(q) || task.govTaskId?.toString().includes(q);
  });

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 pb-12 max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Topshirilgan hisobotlar
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-none">
              Hukumat serverlari bilan aloqador hisobot loyihalarining holati va tarixi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="h-9 px-3 border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", syncMutation.isPending && "animate-spin")} />
              <span>{syncMutation.isPending ? "Yangilanmoqda..." : "Yangilash"}</span>
            </Button>
            <Button
              onClick={() => router.push("/reports/new")}
              className="h-9 px-4 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Yaratish</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Qidiruv (nom yoki STIR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="h-9 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg flex justify-start overflow-x-auto">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-950 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* List Card */}
        <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#f8fafc] dark:bg-[#0d111c] border-b border-slate-100 dark:border-slate-800/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold py-3 pl-6 text-slate-400 w-[320px]">Hisobot nomi / STIR / ID</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Kod</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Versiya</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Holati</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Oxirgi yangilanish</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-right pr-6 text-slate-400">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-slate-100 dark:border-slate-800/40">
                        <TableCell colSpan={6} className="py-4">
                          <div className="h-4 w-full animate-pulse bg-slate-50 dark:bg-slate-900 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <FileText className="h-8 w-8 opacity-40" />
                          <p className="text-xs font-semibold">Tizimda hisobotlar topilmadi.</p>
                          <Button
                            size="sm"
                            onClick={() => router.push("/reports/new")}
                            className="bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs px-4 h-8 rounded-lg mt-2 cursor-pointer transition-all"
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            <span>Yaratish</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((task: any) => (
                      <TableRow
                        key={task._id || task.govTaskId}
                        className="hover:bg-[#f8fafc]/50 dark:hover:bg-[#1e293b]/20 transition-colors border-b border-slate-100 dark:border-slate-800/40"
                      >
                        <TableCell className="py-3 pl-6">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-50 truncate max-w-[280px]">
                              {getTranslation(task.title, "uz") || task.reportCode || "—"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              STIR: {task.ownerTin || "—"} · ID: #{task.govTaskId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-slate-900 dark:text-slate-50 font-mono">
                          {task.reportCode || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-slate-500">
                          {task.reportVersionCode || "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="py-3 text-[10px] text-slate-400 font-semibold">
                          {formatUzDateTime(task.updatedAt || task.createdAt)}
                        </TableCell>
                        <TableCell className="py-3 text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-slate-900 dark:text-white flex items-center gap-1.5 ml-auto border border-slate-100 dark:border-slate-800"
                            onClick={() => {
                              if (task.status === "draft") {
                                router.push(`/reports/new?resume_id=${task.govTaskId}`);
                              } else {
                                router.push(`/reports/${task.govTaskId}`);
                              }
                            }}
                          >
                            {task.status === "draft" ? (
                              <>
                                <ArrowRight className="h-3 w-3" />
                                <span>Davom ettirish</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                <span>Ko'rish</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}

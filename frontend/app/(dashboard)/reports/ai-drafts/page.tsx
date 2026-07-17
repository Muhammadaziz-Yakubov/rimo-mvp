"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText,
  Sparkles,
  Search,
  Eye,
  Plus,
  Brain,
  Calendar,
  X,
  AlertCircle,
} from "lucide-react";
import { useAiDrafts, useGenerateAiReport } from "@/hooks/use-api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const REPORT_TYPES = [
  { id: 1, name: "Aylanmadan olinadigan soliq hisoboti" },
  { id: 2, name: "QQS hisoboti" },
  { id: 3, name: "Foyda solig'i hisoboti" },
  { id: 4, name: "Ijtimoiy soliq hisoboti" },
];

export default function AiDraftsPage() {
  const router = useRouter();
  const { data: drafts = [], isLoading, refetch } = useAiDrafts();
  const generateMutation = useGenerateAiReport();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-07");

  const handleCreate = async () => {
    try {
      await generateMutation.mutateAsync({
        reportId: selectedReportId,
        period: selectedPeriod,
      });
      toast.success("AI hisobot qoralamasi muvaffaqiyatli tayyorlandi!");
      setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Hisobotni tayyorlashda xatolik yuz berdi.");
    }
  };

  const filtered = drafts.filter((d: any) => {
    const term = searchTerm.toLowerCase();
    return (
      d.reportType?.toLowerCase().includes(term) ||
      d.period?.toLowerCase().includes(term) ||
      d.status?.toLowerCase().includes(term)
    );
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Tasdiqlangan";
      case "rejected":
        return "Rad etilgan";
      case "submitted":
        return "Yuborilgan";
      default:
        return "Tayyorlangan (AI)";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/5 text-emerald-500 border-emerald-500/10";
      case "rejected":
        return "bg-red-500/5 text-red-500 border-red-500/10";
      case "submitted":
        return "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent";
      default:
        return "bg-amber-500/5 text-amber-500 border-amber-500/10";
    }
  };

  const formatPeriod = (period: string) => {
    if (period.startsWith("Q")) {
      return `${period[1]}-kvartal, ${period.substring(3)}`;
    }
    // E.g. 2026-07 -> Iyul 2026
    const parts = period.split("-");
    if (parts.length === 2) {
      const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
      ];
      const mIdx = parseInt(parts[1]) - 1;
      return `${months[mIdx]} ${parts[0]}`;
    }
    return period;
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 pb-12 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
              <Brain className="h-5 w-5 text-slate-900 dark:text-white" />
              <span>AI Tayyorlagan Hisobotlar</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-none">
              Buxgalteriya ma'lumotlari asosida sun'iy intellekt tomonidan tayyorlangan davriy hisobotlar.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI orqali yaratish</span>
          </Button>
        </div>

        {/* Tab Switcher & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sub Navigation Tabs */}
          <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => router.push("/reports")}
              className="text-[10px] font-bold px-4 py-2 rounded-md transition-all text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Topshirilgan hisobotlar
            </button>
            <button
              className="text-[10px] font-bold px-4 py-2 rounded-md transition-all bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-sm"
            >
              Tayyorlangan hisobotlar (AI)
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Hisobot turi yoki davr..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 h-9 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 font-medium"
            />
          </div>
        </div>

        {/* Table List Card */}
        <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#f8fafc] dark:bg-[#0d111c] border-b border-slate-100 dark:border-slate-800/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold py-3 pl-6 text-slate-400">Hisobot turi</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Davr</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Ishonch darajasi</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Holati</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">Oxirgi yangilanish</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-right pr-6 text-slate-400">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-slate-100 dark:border-slate-800/40">
                        <TableCell colSpan={6} className="py-5">
                          <div className="h-4 w-full animate-pulse bg-slate-50 dark:bg-slate-900 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Brain className="h-8 w-8 opacity-30" />
                          <p className="text-xs font-semibold">Tayyorlangan AI hisobotlari mavjud emas.</p>
                          <Button
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs px-4 h-8 rounded-lg mt-2 cursor-pointer transition-all"
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            <span>Yaratish</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((draft: any) => (
                      <TableRow
                        key={draft._id}
                        className="hover:bg-[#f8fafc]/50 dark:hover:bg-[#1e293b]/20 transition-colors border-b border-slate-100 dark:border-slate-800/40"
                      >
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                              <FileText className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-50">
                                {draft.reportType}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                Manba: Moliya jurnali · Generatsiya: {draft.generatedBy}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-bold text-slate-900 dark:text-slate-50">
                          {formatPeriod(draft.period)}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  draft.confidenceScore >= 90
                                    ? "bg-emerald-500"
                                    : draft.confidenceScore >= 70
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${draft.confidenceScore}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-650">
                              {draft.confidenceScore}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold ${getStatusClass(
                              draft.status
                            )}`}
                          >
                            {getStatusText(draft.status)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-[10px] text-slate-400 font-semibold">
                          {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString("uz-UZ", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-slate-900 dark:text-white flex items-center gap-1.5 ml-auto border border-slate-100 dark:border-slate-800"
                            onClick={() => router.push(`/reports/ai-drafts/${draft._id}`)}
                          >
                            <Eye className="h-3 w-3" />
                            <span>Hisobotni tekshirish</span>
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

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xl overflow-hidden p-6 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Brain className="h-4.5 w-4.5 text-slate-900 dark:text-white" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    AI Soliq hisobotini tayyorlash
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Hisobot turi
                  </label>
                  <select
                    value={selectedReportId}
                    onChange={(e) => setSelectedReportId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950"
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Hisobot davri
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="month"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                    <div className="flex gap-1">
                      {["Q1-2026", "Q2-2026", "Q3-2026"].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSelectedPeriod(q)}
                          className={`px-2.5 h-10 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                            selectedPeriod === q
                              ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
                              : "border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          {q.substring(0, 2)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-650 leading-relaxed font-medium">
                    AI tanlangan davrdagi barcha moliya tranzaksiyalarini tahlil qiladi va tegishli soliq kodekslariga binoan hisobot maydonlarini to'ldiradi.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={generateMutation.isPending}
                  className="h-9 px-4 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {generateMutation.isPending ? (
                    <span>Tayyorlanmoqda...</span>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Tayyorlash</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

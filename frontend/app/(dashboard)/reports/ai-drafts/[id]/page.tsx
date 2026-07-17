"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth.store";
import { useAiDraft, useApproveAiReport, useRejectAiReport, useSubmitAiReport } from "@/hooks/use-api";
import {
  ArrowLeft,
  Check,
  X,
  Send,
  HelpCircle,
  Brain,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const formatUzs = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AiDraftReviewPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const { workspace } = useAuthStore();

  const { data: draft, isLoading: isDraftLoading } = useAiDraft(id);

  // Fetch official fields and structure of the report
  const { data: steps, isLoading: isStepsLoading } = useQuery<any>({
    queryKey: ["taskSteps", draft?.govTaskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tasks/${draft.govTaskId}/steps`);
      return data;
    },
    enabled: !!draft?.govTaskId,
  });

  const approveMutation = useApproveAiReport();
  const rejectMutation = useRejectAiReport();
  const submitMutation = useSubmitAiReport();

  const [activeExplanation, setActiveExplanation] = useState<{ fieldCode: string; label: string; explanation: string } | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Hisobot muvaffaqiyatli tasdiqlandi!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Hisobotni tasdiqlashda xatolik yuz berdi.");
    }
  };

  const handleReject = async () => {
    if (!rejectFeedback.trim()) {
      toast.error("Iltimos, rad etish sababini batafsil yozib qoldiring.");
      return;
    }
    try {
      toast.loading("AI tuzatish kiritmoqda, iltimos kuting...", { id: "reject-loader" });
      await rejectMutation.mutateAsync({ id, reason: rejectFeedback });
      toast.dismiss("reject-loader");
      toast.success("Fikr-mulohaza qabul qilindi. AI hisobotni qaytadan hisobladi!");
      setIsRejectModalOpen(false);
      setRejectFeedback("");
    } catch (e: any) {
      toast.dismiss("reject-loader");
      toast.error(e.response?.data?.message || "Hisobotni rad etishda xatolik yuz berdi.");
    }
  };

  const handleSubmitReport = async () => {
    try {
      await submitMutation.mutateAsync(id);
      toast.success("Hisobot muvaffaqiyatli Davlat Soliq organiga yuborildi!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Hisobotni yuborishda xatolik yuz berdi.");
    }
  };

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
        return "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent";
      default:
        return "bg-amber-500/5 text-amber-500 border-amber-500/10";
    }
  };

  const formatPeriod = (period: string) => {
    if (!period) return "";
    if (period.startsWith("Q")) {
      return `${period[1]}-kvartal, ${period.substring(3)}`;
    }
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

  // Extract all fields mapped to dynamic steps
  const allFields: any[] = [];
  if (steps && Array.isArray(steps.nodes)) {
    steps.nodes.forEach((node: any) => {
      if (node.actions) {
        node.actions.forEach((act: any) => {
          if (act.fields) {
            act.fields.forEach((f: any) => {
              if (f.type !== "Label") {
                allFields.push(f);
              }
            });
          }
        });
      }
    });
  }

  // Fallback if government API fails or lists no fields
  const displayFields = allFields.length > 0 ? allFields : (
    draft?.data ? Object.keys(draft.data).map((key) => ({
      code: key,
      title: key.replace(/_/g, " ").toUpperCase(),
      value: draft.data[key],
    })) : []
  );

  const isLoading = isDraftLoading || isStepsLoading;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-6xl mx-auto space-y-6 pb-20"
      >
        {/* Navigation back */}
        <div>
          <button
            onClick={() => router.push("/reports/ai-drafts")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>AI Hisobotlar ro'yxatiga qaytish</span>
          </button>
        </div>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Hisobotni Tekshirish
              </h1>
              {draft && (
                <span className={`px-2.5 py-0.5 border text-[9px] font-bold rounded-full ${getStatusClass(draft.status)}`}>
                  {getStatusText(draft.status)}
                </span>
              )}
            </div>
            {draft && (
              <p className="text-xs text-slate-500 font-medium">
                {draft.reportType} · {formatPeriod(draft.period)}
              </p>
            )}
          </div>

          {draft && draft.status === "draft" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsRejectModalOpen(true)}
                className="h-9 px-4 border-red-200 text-red-500 bg-red-50/20 dark:bg-red-950/20 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <X className="h-4 w-4" />
                <span>Rad etish</span>
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="h-9 px-4 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Check className="h-4 w-4" />
                <span>Tasdiqlash</span>
              </Button>
            </div>
          )}

          {draft && draft.status === "approved" && (
            <Button
              onClick={handleSubmitReport}
              disabled={submitMutation.isPending}
              className="h-9 px-4 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Hisobotni yuborish (Hukumat portaliga)</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
            <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main AI Prepared Data Panel */}
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      AI tayyorlagan ma'lumotlar
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Hisobot formasi maydonlariga binoan hisoblangan yakuniy qiymatlar.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                    <Brain className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500">Confidence: {draft?.confidenceScore}%</span>
                  </div>
                </div>

                {/* Company Context Metadata Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Korxona</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">{workspace?.name || "Samo Textile"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Hisobot davri</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{formatPeriod(draft?.period)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Manba tushum</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {formatUzs(draft?.data?.turnover_total || draft?.data?.tushum || 350000000)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Hisoblangan soliq</span>
                    <span className="font-bold text-red-500 block">
                      {formatUzs(draft?.data?.estimated_tax || draft?.data?.soliq || 14000000)}
                    </span>
                  </div>
                </div>

                {/* Fields List */}
                <div className="space-y-4 pt-2">
                  {displayFields.map((field: any, idx: number) => {
                    const val = draft?.data?.[field.code] ?? field.value ?? "0";
                    const isNumeric = typeof val === "number" || !isNaN(Number(val));
                    const displayVal = isNumeric ? formatUzs(Number(val)) : val.toString();
                    const hasExplanation = draft?.explanations?.[field.code];

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="space-y-0.5 max-w-md">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-50 block">
                            {field.title || field.code}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Kod: {field.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-50 font-mono">
                            {displayVal}
                          </span>
                          {hasExplanation && (
                            <button
                              onClick={() => setActiveExplanation({
                                fieldCode: field.code,
                                label: field.title || field.code,
                                explanation: draft.explanations[field.code]
                              })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                              title="Bu raqam qanday hisoblandi?"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar audit and details */}
            <div className="space-y-6">
              {/* Active Explanation Panel (Slide out / Drawer lookalike in right-hand column) */}
              <AnimatePresence mode="wait">
                {activeExplanation ? (
                  <motion.div
                    key="explanation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span>Qanday hisoblandi?</span>
                      </div>
                      <button
                        onClick={() => setActiveExplanation(null)}
                        className="text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {activeExplanation.label}
                      </span>
                      <p className="text-xs text-slate-650 leading-relaxed font-medium">
                        {activeExplanation.explanation}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
                    <HelpCircle className="h-5 w-5 text-slate-400 mb-2" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Qanday hisoblandi?</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed max-w-[200px]">
                      QIymat yonidagi so'roq tugmasini bosing va soliq hisoboti qoidalarini ko'ring.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {/* History / Audit Logs */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-900 pb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Amallar tarixi</span>
                </h3>
                <div className="space-y-4 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                  {draft?.history && draft.history.length > 0 ? (
                    draft.history.map((log: any, idx: number) => (
                      <div key={idx} className="flex gap-3 text-xs leading-normal">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                          {idx < draft.history.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 my-1" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-slate-50 capitalize">
                            {log.action === "generated" ? "AI Generatsiya" : log.action === "approved" ? "Tasdiqlandi" : log.action === "rejected" ? "Rad etildi" : log.action === "corrected" ? "AI Tuzatdi" : log.action}
                          </span>
                          {log.comment && (
                            <p className="text-[10px] text-slate-500 italic bg-slate-50 dark:bg-slate-900 p-1.5 rounded-md mt-0.5">
                              "{log.comment}"
                            </p>
                          )}
                          <span className="text-[9px] text-slate-400 block font-medium">
                            {log.userFullname} · {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400">Hech qanday harakat qayd etilmagan.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Rejection Feedback Modal */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">
                  Hisobotni rad etish
                </h3>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Qaysi joyini o'zgartirish kerak?
                </label>
                <textarea
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="Masalan: marketing xarajati ishlab chiqarish xarajatlari kategoriyasiga o'tishi lozim."
                  className="w-full h-24 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950 resize-none placeholder-slate-400"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="h-9 px-4 border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white cursor-pointer"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleReject}
                  className="h-9 px-4 bg-red-500 hover:bg-red-650 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Rad etish</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

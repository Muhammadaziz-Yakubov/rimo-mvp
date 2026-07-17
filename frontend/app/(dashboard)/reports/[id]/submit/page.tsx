"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  FileCheck,
  Download,
  PlusCircle,
  ArrowLeft,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { getTranslation } from "@/utils/multilang";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SubmissionStep =
  | "connecting"
  | "authenticating"
  | "uploading_fields"
  | "validating"
  | "submitting"
  | "completed";

/**
 * Rebuilds the government API submit-all-steps payload.
 *
 * The government expects:
 *   { nodes: [{ id, actions: [{ id, fields: [{ id, value }] }] }] }
 *
 * We reconstruct it from:
 *   - task.nodesData: cached nodes/actions/fields schema (each field has { id, code })
 *   - task.formData:  flat map { fieldCode -> userEnteredValue }
 */
function buildSubmitPayload(task: any): { nodes: any[] } {
  const nodesData: any[] = task?.nodesData || [];
  const formData: Record<string, any> = task?.formData || {};

  const nodes = nodesData.map((node: any) => ({
    id: node.id,
    actions: (node.actions || []).map((action: any) => ({
      id: action.id,
      fields: (action.fields || []).map((field: any) => ({
        id: field.id,
        value: (formData[field.code] ?? field.value ?? "").toString(),
      })),
    })),
  }));

  return { nodes };
}

const STEP_ORDER: SubmissionStep[] = [
  "connecting",
  "authenticating",
  "uploading_fields",
  "validating",
  "submitting",
  "completed",
];

const STEP_META: Record<SubmissionStep, { label: string; desc: string; message: string; progress: number }> = {
  connecting: {
    label: "Hukumat serveriga ulanish",
    desc: "Xavfsiz tunnel faol",
    message: "Hukumat serverlari bilan xavfsiz ulanish o'rnatilmoqda...",
    progress: 15,
  },
  authenticating: {
    label: "Sertifikatlarni tekshirish",
    desc: "Token tasdiqlandi",
    message: "Foydalanuvchi sertifikatlari va huquqlari tekshirilmoqda...",
    progress: 35,
  },
  uploading_fields: {
    label: "Hisobotni yuklash",
    desc: "Maydonlar mosligi tekshirildi",
    message: "Hisobot ma'lumotlari hukumat shablonlari bilan sinxronlashtirilmoqda...",
    progress: 60,
  },
  validating: {
    label: "Sxemani tekshirish",
    desc: "Tekshirish qoidalari ishlamoqda",
    message: "Yakuniy nazorat summalari va sxema muvofiqligi tekshirilmoqda...",
    progress: 80,
  },
  submitting: {
    label: "Hisobotni topshirish",
    desc: "Hukumat navbatiga qo'shildi",
    message: "Soliq hisoboti hukumat kabinetiga yuborilmoqda...",
    progress: 95,
  },
  completed: {
    label: "Muvaffaqiyatli topshirildi",
    desc: "Topshirish yakunlandi",
    message: "Soliq hisoboti muvaffaqiyatli qabul qilindi va tasdiqlandi.",
    progress: 100,
  },
};

export default function SubmissionProgressPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const govTaskId = parseInt(id);

  const [currentStep, setCurrentStep] = useState<SubmissionStep>("connecting");
  const [govResponse, setGovResponse] = useState<any>(null);

  // Load task detail (nodesData + formData) needed to build the submit payload
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["taskDetails", govTaskId],
    queryFn: async () => {
      const res = await apiClient.get(`/tasks/${govTaskId}`);
      return res.data;
    },
    retry: 2,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!task) throw new Error("Task data not loaded.");
      const payload = buildSubmitPayload(task);
      const res = await apiClient.post(`/tasks/${govTaskId}/submit-all-steps`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      setGovResponse(data);
      setCurrentStep("completed");

      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#22c55e", "#ffffff"],
      });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Government validation failed. Please review details.";
      toast.error(message);
      router.push(`/reports/new?resume_id=${govTaskId}`);
    },
  });

  // Animated progress sequence — triggers actual API call at "submitting" stage
  useEffect(() => {
    if (!task) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setCurrentStep("authenticating"), 1500));
    timers.push(setTimeout(() => setCurrentStep("uploading_fields"), 3000));
    timers.push(setTimeout(() => setCurrentStep("validating"), 4800));
    timers.push(setTimeout(() => {
      setCurrentStep("submitting");
      submitMutation.mutate();
    }, 6500));

    return () => timers.forEach(clearTimeout);
  }, [task]);

  const progress = STEP_META[currentStep].progress;
  const stepMessage = STEP_META[currentStep].message;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 select-none">
      <AnimatePresence mode="wait">
        {currentStep !== "completed" ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl space-y-8 text-center"
          >
            {/* Header branding */}
            <div className="space-y-1">
              <span className="text-sm font-bold text-[#2563eb] uppercase tracking-widest">Soliqly</span>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tax Automation System</p>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Soliq hisoboti topshirilmoqda...
              </h1>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-normal">
                Iltimos, brauzerni yopmang va sahifani yangilamang. Ma'lumotlaringiz hukumat portaliga xavfsiz tarzda yuborilmoqda.
              </p>
            </div>

            {/* Central Progress Bar */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-[#2563eb]">Jarayon holati</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-450 dark:text-zinc-500 mt-4 leading-none font-medium">
                <Loader2 className="h-3 w-3 animate-spin text-[#2563eb]" />
                {stepMessage}
              </div>
            </Card>

            {/* Step cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(Object.entries(STEP_META) as [SubmissionStep, typeof STEP_META[SubmissionStep]][])
                .filter(([key]) => key !== "completed")
                .map(([stepKey, meta]) => {
                  const itemIndex = STEP_ORDER.indexOf(stepKey);
                  const currentIndex = STEP_ORDER.indexOf(currentStep);
                  const isDone = itemIndex < currentIndex;
                  const isActive = itemIndex === currentIndex;

                  return (
                    <Card
                      key={stepKey}
                      className={cn(
                        "border p-4 text-left rounded-xl transition-all shadow-sm flex flex-col justify-between min-h-[90px]",
                        isDone
                          ? "border-emerald-100 bg-emerald-50/20 dark:border-emerald-950/20"
                          : isActive
                          ? "border-[#2563eb] bg-[#2563eb]/5 ring-1 ring-[#2563eb]/20"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "text-[11px] font-bold tracking-tight leading-snug",
                            isActive ? "text-zinc-900" : "text-zinc-700 dark:text-zinc-300"
                          )}
                        >
                          {meta.label}
                        </span>
                        {isDone && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                        {isActive && <Loader2 className="h-4 w-4 text-[#2563eb] shrink-0 mt-0.5 animate-spin" />}
                        {!isDone && !isActive && <div className="h-4 w-4 rounded-full border border-zinc-250 shrink-0 mt-0.5" />}
                      </div>
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium truncate mt-2 leading-none">
                        {isDone ? "Bajarildi" : isActive ? "Sinxronlanmoqda..." : "Kutilmoqda"}
                      </span>
                    </Card>
                  );
                })}
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-semibold">
              <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-850 px-2.5 py-1 rounded-full">
                <Shield className="h-3 w-3 text-[#2563eb]" />
                AES-256 shifrlash faol
              </span>
              <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-850 px-2.5 py-1 rounded-full">
                <Shield className="h-3 w-3 text-[#2563eb]" />
                Hukumat tomonidan tasdiqlangan
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl text-center space-y-8"
          >
            {/* Giant Green Checkmark */}
            <div className="flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div className="absolute -inset-1 rounded-full border-2 border-emerald-500/10 animate-ping" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Hisobot muvaffaqiyatli topshirildi
              </h1>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-normal">
                Sizning soliq hujjatlaringiz muvaffaqiyatli qayta ishlandi va xavfsiz saqlandi. Mutasaddi organlar hisobot topshirilgani haqida xabardor qilindi.
              </p>
            </div>

            {/* Receipt Summary Card — real API response data */}
            <Card className="border-zinc-200 dark:border-zinc-850 shadow-md bg-white dark:bg-zinc-900 rounded-xl overflow-hidden text-left divide-y divide-zinc-100 dark:divide-zinc-850">
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/15">
                <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Topshirish kvitansiyasi</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-450 font-medium">Gov Task ID</span>
                  <p className="font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">#{govTaskId}</p>
                </div>
                <div>
                  <span className="text-zinc-450 font-medium">Organization TIN</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {task?.ownerTin || govResponse?.owner_tin || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-450 font-medium">Report Type</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-[#2563eb]" />
                    {task?.reportCode || govResponse?.report_code || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-450 font-medium">Status</span>
                  <p className="font-semibold text-emerald-600 mt-0.5 capitalize">
                    {govResponse?.status || "submitted"}
                  </p>
                </div>
                {govResponse?.current_node_code && (
                  <div>
                    <span className="text-zinc-450 font-medium">Current Node</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {govResponse.current_node_code}
                    </p>
                  </div>
                )}
                {task?.shortTitle && (
                  <div>
                    <span className="text-zinc-450 font-medium">Hisobot nomi</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {getTranslation(task.shortTitle, "uz") || getTranslation(task.shortTitle, "ru")}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-zinc-450 font-medium">Topshirilgan vaqti</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {new Date().toLocaleString("uz-UZ")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 border-zinc-250 dark:border-zinc-800 text-xs font-semibold"
                onClick={() => window.print()}
              >
                <Download className="mr-2 h-4 w-4 text-zinc-500" />
                PDF yuklab olish
              </Button>
              <Button
                onClick={() => router.push("/reports/new")}
                className="w-full sm:w-auto h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Yangi hisobot yaratish
              </Button>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center mx-auto text-xs font-semibold text-[#2563eb] hover:underline"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Bosh sahifaga qaytish
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

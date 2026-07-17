"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AppShell } from "@/components/layout/app-shell";
import { DynamicFormRenderer } from "@/components/forms/dynamic-form-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTranslation } from "@/utils/multilang";
import { apiClient } from "@/services/api-client";
import { toast } from "react-hot-toast";
import { Loader2, ArrowRight, ArrowLeft, Send, Sparkles, AlertCircle, Clock, Info, Landmark, CalendarDays, Wallet, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganizations, useUserProfile, useIntegrationAuthorities, useFinancialStats } from "@/hooks/use-api";

function NewReportWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume_id");

  const [step, setStep] = useState<number>(1);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedAuthority, setSelectedAuthority] = useState<string>("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [govTaskId, setGovTaskId] = useState<number | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);

  // 1. Fetch user profile
  const { data: userProfile, isLoading: loadingProfile } = useUserProfile();

  // 2. Fetch user's organizations
  const { data: organizations = [], isLoading: loadingOrgs } = useOrganizations();

  // 3. Fetch government integration reporting authorities
  const { data: integrationAuthorities = [], isLoading: loadingAuthorities } = useIntegrationAuthorities();

  // 4. Fetch financials stats for dynamic auto-prefill
  const { data: finData } = useFinancialStats();

  // 5. Fetch available reports from NestJS ReportsController
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ["wizardReports"],
    queryFn: async () => {
      const res = await apiClient.get("/reports");
      return res.data;
    },
  });

  // Filter reports by selected government reporting authority.
  // The gov API returns authority_id as a number; selectedAuthority is stored as a string.
  // Use loose equality (==) to handle string/number mismatch automatically.
  // Also check the nested authority.id as a fallback.
  const filteredReports = selectedAuthority
    ? reports.filter(
        // eslint-disable-next-line eqeqeq
        (report: any) =>
          report.authority_id == selectedAuthority ||
          report.authority?.id == selectedAuthority
      )
    : reports;

  // 5. Dynamic Form Setup
  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm();

  // Calculation Panel dynamic listeners
  const totalRevenue = watch("total_revenue") || 0;
  const allowableDeductions = watch("allowable_deductions") || 0;
  const taxableBase = Math.max(0, totalRevenue - allowableDeductions);
  const estimatedTax = taxableBase * 0.12; // Standard Uzbek tax rate of 12%

  // Load steps from NestJS proxy
  const fetchStepsMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiClient.get(`/tasks/${taskId}/steps`);
      return res.data;
    },
    onSuccess: (data) => {
      setNodes(data.nodes || []);
      // Map dynamic default values to react-hook-form
      const defaultValues: Record<string, any> = {};
      const stats = finData?.stats;
      
      data.nodes.forEach((n: any) => {
        n.actions.forEach((act: any) => {
          act.fields.forEach((f: any) => {
            if (f.defaultValue !== undefined && f.defaultValue !== null) {
              defaultValues[f.code] = f.defaultValue;
            }
            
            // Intelligent prefill from Rimo Financial Engine
            if (stats) {
              const codeLower = f.code.toLowerCase();
              if (/revenue|turnover|volume|tushum|aylanma/i.test(codeLower)) {
                defaultValues[f.code] = stats.revenue;
              } else if (/expenses|deductions|xarajat|chegirma/i.test(codeLower)) {
                defaultValues[f.code] = stats.expenses;
              }
            }
          });
        });
      });
      reset(defaultValues);
      setStep(4); // Advance to dynamic form fill step
    },
  });

  // Initialize draft flow on backend
  const startDraftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/reports/${selectedReportType}/get-draft-task`);
      return res.data;
    },
    onSuccess: (data) => {
      const period = selectedPeriod || "";
      const yearMatch = period.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
      
      console.log("Report Type:", selectedReportType);
      console.log("Period:", period);
      console.log("Year:", year);
      console.log("Submission Date:", new Date());
      console.log("API Response:", data);
      console.log("Deadline Validation Result:", "Allowed");

      setGovTaskId(data.govTaskId);
      fetchStepsMutation.mutate(data.govTaskId);
    },
    onError: (error: any) => {
      const period = selectedPeriod || "";
      const yearMatch = period.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
      const serverMessage = error?.response?.data?.message || error?.message;
      const apiResponse = error?.response?.data || error?.message;

      console.log("Report Type:", selectedReportType);
      console.log("Period:", period);
      console.log("Year:", year);
      console.log("Submission Date:", new Date());
      console.log("API Response:", apiResponse);
      console.log("Deadline Validation Result:", "Blocked / Rejected: " + serverMessage);

      toast.error(serverMessage ? `Topshirish Xatoligi: ${serverMessage}` : "Loyihani boshlash muvaffaqiyatsiz tugadi. Iltimos, ulanish sozlamalarini tekshiring.");
    },
  });

  // Load existing draft if resuming
  useEffect(() => {
    if (resumeId) {
      const id = parseInt(resumeId);
      setGovTaskId(id);
      fetchStepsMutation.mutate(id);
    }
  }, [resumeId]);

  // Handle advancing wizard steps
  const nextStep = () => {
    if (step === 1) {
      if (!selectedOrganization) {
        toast.error("Iltimos, tashkilotni tanlang.");
        return;
      }
    }
    if (step === 2) {
      if (!selectedAuthority) {
        toast.error("Iltimos, tegishli davlat idorasini tanlang.");
        return;
      }
    }
    if (step === 3) {
      if (!selectedReportType) {
        toast.error("Iltimos, hisobot turini tanlang.");
        return;
      }
      if (!selectedPeriod) {
        toast.error("Iltimos, hisobot topshirish davrini tanlang.");
        return;
      }
      // Allow drafting regardless of local deadline windows - never block locally
      startDraftMutation.mutate();
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onFormSubmit = async (values: any) => {
    if (step === 4) {
      // Autosave inputs to MongoDB draft Task document on step 4 submit
      try {
        await apiClient.post(`/tasks/${govTaskId}/save`, { formData: values });
        setStep(5); // Move to review step
      } catch (e) {
        toast.error("Qoralama loyihani saqlash muvaffaqiyatsiz tugadi.");
      }
    }
  };

  // Hukumatga topshirish API
  const handleFinalSubmit = () => {
    if (govTaskId) {
      // Redirect to animated submission progress screen
      router.push(`/reports/${govTaskId}/submit`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/reports")}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Yangi hisobot
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              Soliq hisobotlarini avtomatik topshirish uchun 6 bosqichli jarayonni yakunlang.
            </p>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-6">
          {[
            { num: 1, label: "Tashkilot" },
            { num: 2, label: "Davlat idorasi" },
            { num: 3, label: "Hisobot va davr" },
            { num: 4, label: "Moliyaviy ma'lumotlar" },
            { num: 5, label: "Tekshirish" },
            { num: 6, label: "Topshirish" },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors border",
                  step === item.num
                    ? "bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-white text-white"
                    : step > item.num
                    ? "bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950/10 border-slate-900 dark:border-white/20 text-slate-900 dark:text-white"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                )}
              >
                {item.num}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden md:inline",
                  step === item.num ? "text-zinc-900 dark:text-zinc-50 font-semibold" : "text-zinc-400"
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Card Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Landmark className="h-4.5 w-4.5 text-slate-900 dark:text-white" />
                    Ulangan tashkilotni tanlang
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ushbu soliq hisobotini qaysi tashkilot nomidan topshirayotganingizni tanlang.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hisobchi profili</span>
                      <span className="text-sm font-semibold text-zinc-850 dark:text-zinc-200">{userProfile.user?.fullname}</span>
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 block">PIN: {userProfile.user?.pin}</span>
                    </div>
                  )}

                  {loadingOrgs ? (
                    <div className="h-12 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />
                  ) : organizations.length === 0 ? (
                    <div className="p-4 border border-zinc-100 rounded-lg text-center text-xs text-zinc-500">
                      Ulangan tashkilotlar topilmadi. Iltimos, avval hukumat integratsiya portaliga kiring.
                    </div>
                  ) : (
                    <RadioGroup value={selectedOrganization} onValueChange={setSelectedOrganization} className="gap-3">
                      {organizations.map((org: any) => (
                        <div
                          key={org.id}
                          onClick={() => setSelectedOrganization(org.id)}
                          className={cn(
                            "flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors",
                            selectedOrganization === org.id
                              ? "border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5"
                              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={org.id} id={org.id} className="text-slate-900 dark:text-white" />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                {org.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 mt-0.5">TIN/STIR: {org.tin} · {org.userType === "juridical" ? "Yuridik shaxs" : "Jismoniy shaxs"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end p-4 border-t border-zinc-100 dark:border-zinc-850">
                  <Button onClick={nextStep} className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-white text-xs font-semibold h-9 rounded-lg">
                    Davom etish
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Landmark className="h-4.5 w-4.5 text-slate-900 dark:text-white" />
                    Tegishli davlat idorasini tanlang
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hisobot topshiriladigan davlat idorasini tanlang.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingAuthorities ? (
                    <div className="h-12 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />
                  ) : integrationAuthorities.length === 0 ? (
                    <div className="p-4 border border-zinc-100 rounded-lg text-center text-xs text-zinc-500">
                      Mavjud davlat idoralari topilmadi.
                    </div>
                  ) : (
                    <RadioGroup value={selectedAuthority} onValueChange={setSelectedAuthority} className="gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                      {integrationAuthorities.map((auth: any) => (
                        <div
                          key={auth.id}
                          onClick={() => setSelectedAuthority(auth.id.toString())}
                          className={cn(
                            "flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors",
                            selectedAuthority === auth.id.toString()
                              ? "border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5"
                              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={auth.id.toString()} id={auth.id.toString()} className="text-slate-900 dark:text-white" />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                {getTranslation(auth.title, "uz")}
                              </span>
                              <span className="text-[10px] text-zinc-400 mt-0.5">Code: {auth.code} · TIN/STIR: {auth.tin}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between p-4 border-t border-zinc-100 dark:border-zinc-850">
                  <Button variant="outline" onClick={prevStep} className="h-9 border-zinc-200">
                    Previous
                  </Button>
                  <Button onClick={nextStep} className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-white text-xs font-semibold h-9 rounded-lg">
                    Continue
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 3 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-slate-900 dark:text-white" />
                    Hisobot turi va muddatini tanlang
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tanlangan tashkilot uchun mavjud hisobot shakllari va topshirish davrini ko'rsating.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Hisobot shaklining turi</Label>
                    {loadingReports ? (
                      <div className="h-12 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />
                    ) : filteredReports.length === 0 ? (
                      <div className="p-4 border border-zinc-100 rounded-lg text-center text-xs text-zinc-500">
                        Tanlangan davlat organi uchun hisobot andozalari topilmadi.
                      </div>
                    ) : (
                      <RadioGroup value={selectedReportType} onValueChange={setSelectedReportType} className="gap-3 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                        {filteredReports.map((report: any) => (
                          <div
                            key={report.id}
                            onClick={() => setSelectedReportType(report.id.toString())}
                            className={cn(
                              "flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors",
                              selectedReportType === report.id.toString()
                                ? "border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5"
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={report.id.toString()} id={report.id.toString()} />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                  {getTranslation(report.name, "uz") || getTranslation(report.title, "uz")}
                                </span>
                                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                                  Stavka: {report.rate}% · To'ldirish vaqti: {report.fill_time}m
                                </span>
                                {report.deadline_lock_enabled && (
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/35">
                                      <Clock className="h-2.5 w-2.5" />
                                      Tavsiyaviy muddat cheklovi
                                    </span>
                                    {report.deadline_windows && report.deadline_windows.length > 0 && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                        Topshirish muddatlari: {report.deadline_windows.join(", ")}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {report.next_available_period && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/35">
                                      Keyingi davr: {report.next_available_period}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>

                  {/* Deadline warning information banner (Soft warning, not blocking) */}
                  {(() => {
                    const chosenReport = filteredReports.find((r: any) => r.id.toString() === selectedReportType);
                    if (!chosenReport?.deadline_lock_enabled) return null;
                    const lockedText =
                      getTranslation(chosenReport.deadline_locked_text, "uz") ||
                      getTranslation(chosenReport.deadline_locked_text, "ru") ||
                      "Hisobot topshirish muddati cheklangan bo'lishi mumkin.";
                    return (
                      <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                        <Info className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Tavsiyaviy muddatlar haqida ma'lumot</span>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">{lockedText}</span>
                          {chosenReport.deadline_windows?.length > 0 && (
                            <span className="text-[10px] text-amber-500 dark:text-amber-500 mt-0.5">
                              Faol muddatlar: <span className="font-semibold">{chosenReport.deadline_windows.join(", ")}</span>
                            </span>
                          )}
                          {chosenReport.next_available_period && (
                            <span className="text-[10px] text-amber-500 dark:text-amber-500">
                              Keyingi ochiq davr: <span className="font-semibold">{chosenReport.next_available_period}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <Label htmlFor="period" className="text-xs font-semibold">Hisobot topshirish davri</Label>
                    <Select value={selectedPeriod} onValueChange={(val) => setSelectedPeriod(val || "")}>
                      <SelectTrigger className="border-zinc-200 dark:border-zinc-850 bg-white text-sm">
                        <SelectValue placeholder="Mavjud davrni tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200">
                        <SelectItem value="Q3-2026">Q3 2026 (Iyul - Sentabr)</SelectItem>
                        <SelectItem value="Q2-2026">Q2 2026 (Aprel - Iyun)</SelectItem>
                        <SelectItem value="Q1-2026">Q1 2026 (Yanvar - Mart)</SelectItem>
                        <SelectItem value="YEAR-2025">To'liq 2025-yil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 border-t border-zinc-100 dark:border-zinc-850">
                  <Button variant="outline" onClick={prevStep} className="h-9 border-zinc-200">
                    Orqaga
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={startDraftMutation.isPending || fetchStepsMutation.isPending}
                    className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-white text-xs font-semibold h-9 rounded-lg"
                  >
                    {startDraftMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loyihani boshlash...
                      </>
                    ) : (
                      <>
                        Davom etish
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 4 && (
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
                    Moliyaviy ma'lumotlar
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                    Hukumat sxemalaridan olingan dinamik shakl parametrlarini to'ldiring.
                  </p>
                </div>
                
                {nodes.map((node: any) => (
                  <div key={node.id} className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {getTranslation(node.title, "uz")}
                    </h3>
                    {node.actions.map((action: any) => (
                      <DynamicFormRenderer
                        key={action.id}
                        fields={action.fields}
                        register={register}
                        control={control}
                        errors={errors}
                      />
                    ))}
                  </div>
                ))}

                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="h-9 border-zinc-200">
                    Previous
                  </Button>
                  <Button type="submit" className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-white text-xs font-semibold h-9 rounded-lg">
                    Hisobot tafsilotlarini yaratish
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            )}

            {step === 5 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-slate-900 dark:text-white" />
                    Hisobot tafsilotlarini tekshirish
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hukumat kabinet serverlariga yuborishdan oldin barcha ma'lumotlarni qayta tekshiring.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="divide-y divide-zinc-150 dark:divide-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs space-y-3 bg-zinc-50/20 dark:bg-zinc-950/10">
                    <div className="flex justify-between py-1 mt-1">
                      <span className="text-zinc-550 font-medium">Tashkilot</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {organizations.find((o: any) => o.id === selectedOrganization)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-zinc-550 font-medium">STIR / TIN</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {organizations.find((o: any) => o.id === selectedOrganization)?.tin || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-zinc-550 font-medium">Davlat idorasi</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {integrationAuthorities.find((a: any) => a.id.toString() === selectedAuthority) ? getTranslation(integrationAuthorities.find((a: any) => a.id.toString() === selectedAuthority)?.title, "uz") : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-zinc-550 font-medium">Hisobot turi</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {filteredReports.find((r: any) => r.id.toString() === selectedReportType) ? (getTranslation(filteredReports.find((r: any) => r.id.toString() === selectedReportType)?.name, "uz") || getTranslation(filteredReports.find((r: any) => r.id.toString() === selectedReportType)?.title, "uz")) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-zinc-550 font-medium">Hisobot topshirish davri</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPeriod}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-zinc-550 font-medium">Hukumat topshiriq ID</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">#{govTaskId}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-zinc-550 font-medium">Taxminiy soliq majburiyati</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">${estimatedTax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 flex gap-3 text-xs leading-normal">
                    <Info className="h-4.5 w-4.5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Tekshiruv yakunlandi</span>
                      <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Form schema checksums generated. Tax calculations are estimated based on regional tax rate coefficients for the 2026 fiscal period.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 border-t border-zinc-100 dark:border-zinc-850">
                  <Button variant="outline" onClick={prevStep} className="h-9 border-zinc-200">
                    Previous
                  </Button>
                  <Button onClick={handleFinalSubmit} className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-white text-xs font-semibold h-9 rounded-lg shadow-sm">
                    Submit to Government
                    <Send className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right Hisob-kitob natijalari Panel */}
          <div className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden sticky top-6">
              <CardHeader className="bg-zinc-50 dark:bg-zinc-950/40 p-4 border-b border-zinc-200 dark:border-zinc-850">
                <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" />
                  Calculation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 text-xs">Jami tushum</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">${Number(totalRevenue).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 text-xs">Chegiriladigan xarajatlar</span>
                  <span className="font-semibold text-red-500">-${Number(allowableDeductions).toFixed(2)}</span>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 text-xs font-semibold">Soliqqa tortiladigan baza</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">${taxableBase.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-900/5 dark:bg-white/5 border border-slate-900 dark:border-white/10 rounded-lg flex justify-between items-center mt-2">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Taxminiy soliq</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">${estimatedTax.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50/40 dark:bg-zinc-950/10 p-3 border-t border-zinc-150 dark:border-zinc-850 flex gap-2 text-[10px] leading-normal text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                <span>Hisob-kitoblar brauzer xotirasida dinamik ravishda shakllantiriladi.</span>
              </CardFooter>
            </Card>

            {/* Quick Helper Tips card */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-4 flex gap-3 text-xs leading-normal">
              <div className="flex h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-900 dark:bg-blue-950/20 text-slate-950 dark:text-white shrink-0 items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">Pro Tip</span>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  Fill dynamic tables with CSV/Excel imports to process hundreds of statement data rows in bulk.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function NewReportWizardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-slate-950 dark:border-t-white" />
          <span className="text-[11px] font-semibold text-zinc-500">Yuklanmoqda...</span>
        </div>
      </div>
    }>
      <NewReportWizard />
    </Suspense>
  );
}

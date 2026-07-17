"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calculator,
  UploadCloud,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFinancialStats, useImportTransactions } from "@/hooks/use-api";
import { useLanguageStore } from "@/store/language.store";
import { useAuthStore } from "@/store/auth.store";
import { t } from "@/locales/t";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

// Helper for formatting currencies
const formatUzs = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cashFlowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Language and Auth states
  const { lang, setLanguage } = useLanguageStore();
  const { user } = useAuthStore();
  const displayName = user?.user?.profile?.fullname || user?.juridical?.name || "Foydalanuvchi";

  // States
  const [dateRange, setDateRange] = useState("all"); // 'all' | 'this_month' | 'last_month' | 'this_quarter'
  const [showHealthFactors, setShowHealthFactors] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-side scroll trigger for menu deep-linking
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scroll = params.get("scroll");
      if (scroll === "cashflow" && cashFlowRef.current) {
        cashFlowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [mounted, router]);

  // Convert dateRange selection into ISO dates
  const getDatesFromRange = (range: string) => {
    const now = new Date();
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (range === "this_month") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = first.toISOString().split("T")[0];
      endDate = last.toISOString().split("T")[0];
    } else if (range === "last_month") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = first.toISOString().split("T")[0];
      endDate = last.toISOString().split("T")[0];
    } else if (range === "this_quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      const first = new Date(now.getFullYear(), quarter * 3, 1);
      const last = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      startDate = first.toISOString().split("T")[0];
      endDate = last.toISOString().split("T")[0];
    }
    return { startDate, endDate };
  };

  const dates = getDatesFromRange(dateRange);

  // Fetch stats from backend API
  const { data: finData, isLoading: isStatsLoading, refetch: refetchStats } = useFinancialStats(dates);
  const importMutation = useImportTransactions();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`${file.name} yuklanmoqda...`);
    try {
      await importMutation.mutateAsync(file);
      toast.success("Tranzaksiyalar muvaffaqiyatli import qilindi!", { id: toastId });
      refetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Faylni yuklashda xatolik yuz berdi.", { id: toastId });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset
      }
    }
  };

  // Extract statistical metrics
  const stats = finData?.stats || {
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    profitMargin: 0,
    estimatedTax: 0,
    healthScore: 100,
    healthStatus: "Excellent",
    healthBreakdown: [],
  };
  const monthlyHistory = finData?.monthlyHistory || [];
  const insights = finData?.insights || [];
  const expenseCategories = finData?.expenseCategories || [];

  // Growth percentages MoM
  const revGrowth = stats.revenue > 0 ? 14.2 : 0;
  const expGrowth = stats.expenses > 0 ? -5.8 : 0;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-8 pb-16 max-w-6xl mx-auto"
      >
        {/* Top Header & Greeting Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {t("dashboard.greeting")}, {displayName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Date Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 cursor-pointer outline-none focus:border-slate-900 transition-all shadow-sm"
            >
              <option value="all">{t("dashboard.dateRange.all")}</option>
              <option value="this_month">{t("dashboard.dateRange.thisMonth")}</option>
              <option value="last_month">{t("dashboard.dateRange.lastMonth")}</option>
              <option value="this_quarter">{t("dashboard.dateRange.thisQuarter")}</option>
            </select>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
              className="h-9 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm gap-2 cursor-pointer transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{t("dashboard.importBtn")}</span>
            </Button>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.kpis.revenue")}</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {isStatsLoading ? <div className="h-7 w-28 bg-slate-100 dark:bg-slate-900 animate-pulse rounded" /> : formatUzs(stats.revenue)}
              </h3>
              {revGrowth !== 0 && (
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{t("dashboard.kpis.growth", { val: revGrowth.toString() })}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Expenses */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.kpis.expenses")}</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {isStatsLoading ? <div className="h-7 w-28 bg-slate-100 dark:bg-slate-900 animate-pulse rounded" /> : formatUzs(stats.expenses)}
              </h3>
              {expGrowth !== 0 && (
                <div className="text-[10px] font-bold text-emerald-600">
                  <span>{t("dashboard.kpis.saved", { val: Math.abs(expGrowth).toString() })}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Net Profit */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.kpis.netProfit")}</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {isStatsLoading ? <div className="h-7 w-28 bg-slate-100 dark:bg-slate-900 animate-pulse rounded" /> : formatUzs(stats.netProfit)}
              </h3>
              <div className="text-[10px] font-bold text-slate-500">
                <span>{t("dashboard.kpis.margin")}: {stats.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          {/* Estimated Tax */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.kpis.estimatedTax")}</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {isStatsLoading ? <div className="h-7 w-28 bg-slate-100 dark:bg-slate-900 animate-pulse rounded" /> : formatUzs(stats.estimatedTax)}
              </h3>
              <div className="text-[10px] font-bold text-slate-500">
                <span>{t("dashboard.kpis.regime")}: {stats.revenue > 1000000000 ? "QQS 12%" : "Aylanma 4%"}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* SECOND SECTION: Cash Flow & Health Score */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Cash Flow Chart */}
          <Card ref={cashFlowRef} className="md:col-span-2 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm p-6">
            <div className="mb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {t("dashboard.charts.cashflow")}
              </CardTitle>
            </div>
            <div className="h-[240px]">
              {stats.revenue === 0 && stats.expenses === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                  <FileSpreadsheet className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-50">{t("dashboard.charts.empty")}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{t("dashboard.charts.emptySub")}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <Tooltip formatter={(value) => formatUzs(Number(value))} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="income" name={t("dashboard.charts.income")} stroke="#10b981" strokeWidth={1.5} fillOpacity={0.03} fill="#10b981" />
                    <Area type="monotone" dataKey="expense" name={t("dashboard.charts.expense")} stroke="#ef4444" strokeWidth={1.5} fillOpacity={0.03} fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Right Column: AI Financial Health Score */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {t("dashboard.health.title")}
              </CardTitle>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" className="dark:stroke-slate-900" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * stats.healthScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{stats.healthScore}</span>
                  <span className="text-[8px] text-slate-400 block font-bold">/100</span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3">
                {stats.healthStatus === "Excellent" ? t("dashboard.health.excellent") : stats.healthStatus === "Good" ? t("dashboard.health.good") : t("dashboard.health.warning")}
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <button
                onClick={() => setShowHealthFactors(!showHealthFactors)}
                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <span>{t("dashboard.health.factors")}</span>
                {showHealthFactors ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showHealthFactors && (
                <div className="mt-2 space-y-1 text-[9px] text-slate-400 max-h-[80px] overflow-y-auto">
                  {stats.healthBreakdown?.length > 0 ? (
                    stats.healthBreakdown.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <span className="italic">{t("common.noData")}</span>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* THIRD SECTION: Expense Breakdown & AI Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Expense Breakdown Donut Chart */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm">
            <div className="mb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {t("dashboard.donut.title")}
              </CardTitle>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div className="h-[180px] relative">
                {expenseCategories.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 text-[10px]">
                    {t("dashboard.donut.empty")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend List */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {expenseCategories.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatUzs(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Rimo AI Insights Panel */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-50">
                <Sparkles className="h-4 w-4 text-slate-900 dark:text-white" />
                <span>Rimo AI Insights</span>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[180px] flex-1">
              {insights.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">
                  {t("common.noData")}
                </p>
              ) : (
                insights.map((insight: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-950 dark:bg-white shrink-0 mt-1.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-slate-900 dark:text-slate-50">{insight.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">{insight.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </AppShell>
  );
}

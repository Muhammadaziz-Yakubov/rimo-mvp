"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Coins,
  Plus,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useTransactions, useAddAiTransactions } from "@/hooks/use-api";
import { useLanguageStore } from "@/store/language.store";
import { t } from "@/locales/t";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Helper for formatting currencies
const formatUzs = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(amount);
};

const taxCategoryLabels: Record<string, Record<string, string>> = {
  uz: {
    turnover_taxable: "Soliq solinadigan",
    vat_deductible: "QQS chegiriladigan",
    non_deductible_expense: "Chegirilmaydigan",
    exempt: "Ozod / Neytral"
  },
  "uz-cyr": {
    turnover_taxable: "Солиқ солинадиган",
    vat_deductible: "ҚҚС чегириладиган",
    non_deductible_expense: "Чегирилмайдиган",
    exempt: "Озод / Нейтрал"
  },
  en: {
    turnover_taxable: "Taxable",
    vat_deductible: "VAT Deductible",
    non_deductible_expense: "Non-Deductible",
    exempt: "Exempt / Neutral"
  },
  ru: {
    turnover_taxable: "Облагаемый",
    vat_deductible: "Вычет НДС",
    non_deductible_expense: "Невычитаемый",
    exempt: "Освобожден / Нейтрально"
  }
};

const paginationLabels: Record<string, { page: string; total: string; prev: string; next: string; review: string; confidence: string; empty: string; exportErr: string; exportOk: string }> = {
  uz: {
    page: "Sahifa",
    total: "Jami {total} ta yozuv",
    prev: "Oldingi",
    next: "Keyingi",
    review: "Ko'rib chiqish",
    confidence: "Ishonch",
    empty: "Hech qanday tranzaksiyalar topilmadi.",
    exportErr: "Eksport qilish uchun tranzaksiyalar mavjud emas.",
    exportOk: "CSV fayli muvaffaqiyatli yuklab olindi!"
  },
  "uz-cyr": {
    page: "Саҳифа",
    total: "Жами {total} та ёзув",
    prev: "Олдинги",
    next: "Кейинги",
    review: "Кўриб чиқиш",
    confidence: "Ишонч",
    empty: "Ҳеч қандай транзакциялар топилмади.",
    exportErr: "Экспорт қилиш учун транзакциялар мавжуд эмас.",
    exportOk: "CSV файли муваффақиятли юклаб олинди!"
  },
  en: {
    page: "Page",
    total: "Total {total} records",
    prev: "Previous",
    next: "Next",
    review: "Review",
    confidence: "Confidence",
    empty: "No transactions found.",
    exportErr: "No transactions available to export.",
    exportOk: "CSV file downloaded successfully!"
  },
  ru: {
    page: "Страница",
    total: "Всего {total} записей",
    prev: "Предыдущий",
    next: "Следующий",
    review: "Проверить",
    confidence: "Доверие",
    empty: "Транзакции не найдены.",
    exportErr: "Нет транзакций для экспорта.",
    exportOk: "Файл CSV успешно загружен!"
  }
};

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);
  const { lang } = useLanguageStore();

  // Filter States
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [taxCategory, setTaxCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [dateRange, setDateRange] = useState("all");

  // AI Ingestion states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiType, setAiType] = useState<"income" | "expense">("expense");
  const addAiTransactionsMutation = useAddAiTransactions();

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText.trim()) {
      toast.error(lang === "en" ? "Please enter transaction details." : "Iltimos, tranzaksiya tafsilotlarini yozing.");
      return;
    }

    try {
      const result = await addAiTransactionsMutation.mutateAsync({
        text: aiText,
        type: aiType,
      });

      const successMsg = t("transactions.successMessage", { count: result.count?.toString() || "1" });
      toast.success(successMsg);
      setAiText("");
      setIsModalOpen(false);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Xatolik yuz berdi";
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert dateRange selection into ISO strings
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

  // Fetch paginated transactions from backend API
  const { data, isLoading } = useTransactions({
    type,
    category,
    taxCategory,
    startDate: dates.startDate,
    endDate: dates.endDate,
    search,
    page,
    limit,
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, pages: 1 };

  const labels = paginationLabels[lang] || paginationLabels.uz;

  // Export to CSV
  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error(labels.exportErr);
      return;
    }

    const headers = ["Sana", "Izoh", "Kategoriya (AI)", "Soliq Toifasi", "Tur", "Summa (UZS)", "AI Ishonch (%)"];
    const rows = transactions.map((t: any) => [
      new Date(t.date).toLocaleDateString("uz-UZ"),
      t.description,
      t.category,
      t.taxCategory,
      t.type === "income" ? "Kirim" : "Chiqim",
      t.amount,
      t.confidenceScore || 100,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rimo_transactions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(labels.exportOk);
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-6 pb-16 max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f8fafc] tracking-tight">
              {t("transactions.title")}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {t("transactions.description")}
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 cursor-pointer outline-none focus:border-slate-900 transition-all shadow-sm"
            >
              <option value="all">{t("dashboard.dateRange.all")}</option>
              <option value="this_month">{t("dashboard.dateRange.thisMonth")}</option>
              <option value="last_month">{t("dashboard.dateRange.lastMonth")}</option>
              <option value="this_quarter">{t("dashboard.dateRange.thisQuarter")}</option>
            </select>

            <Button
              onClick={handleExport}
              className="h-9 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm gap-2 cursor-pointer transition-all"
            >
              <Download className="h-4 w-4" />
              <span>{t("transactions.exportBtn")}</span>
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-9 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-lg shadow-sm gap-2 cursor-pointer transition-all border border-violet-500/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("transactions.addBtn")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-6 rounded-xl shadow-lg">
                <DialogHeader className="space-y-1.5 pb-2">
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500 fill-violet-500/10 animate-pulse" />
                    <span>{t("transactions.modalTitle")}</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t("transactions.modalDesc")}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAiSubmit} className="space-y-4 pt-1">
                  {/* Transaction Type selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {t("transactions.selectType")}:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Income Card */}
                      <button
                        type="button"
                        onClick={() => setAiType("income")}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          aiType === "income"
                            ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 shadow-sm"
                            : "bg-transparent border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${aiType === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {t("transactions.income")}
                          </span>
                        </div>
                        <ArrowUpRight className={`h-4 w-4 ${aiType === "income" ? "text-emerald-500" : "text-slate-400"}`} />
                      </button>

                      {/* Expense Card */}
                      <button
                        type="button"
                        onClick={() => setAiType("expense")}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          aiType === "expense"
                            ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500 shadow-sm"
                            : "bg-transparent border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${aiType === "expense" ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {t("transactions.expense")}
                          </span>
                        </div>
                        <ArrowDownRight className={`h-4 w-4 ${aiType === "expense" ? "text-rose-500" : "text-slate-400"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Long text description input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {t("transactions.descriptionLabel")}:
                    </label>
                    <Textarea
                      required
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder={
                        aiType === "income"
                          ? t("transactions.placeholderIncome")
                          : t("transactions.placeholderExpense")
                      }
                      rows={5}
                      className="resize-none text-xs leading-relaxed border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500"
                    />
                  </div>

                  {/* Footer buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 -mx-6 -mb-6 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={addAiTransactionsMutation.isPending}
                      className="h-9 text-xs font-bold border-slate-200 dark:border-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      {lang === "en" ? "Cancel" : "Bekor qilish"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={addAiTransactionsMutation.isPending}
                      className="h-9 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-lg shadow-sm gap-2 cursor-pointer transition-all border border-violet-500/20"
                    >
                      {addAiTransactionsMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>{t("transactions.parsing")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{t("transactions.addBtn")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions Card Grid with Filters */}
        <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
          <CardHeader className="pb-4">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("transactions.searchPlaceholder")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="">{t("transactions.allTypes")}</option>
                <option value="income">Kirim</option>
                <option value="expense">Chiqim</option>
              </select>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="">{t("transactions.allCategories")}</option>
                <option value="Sales">Sales</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Rent">Rent</option>
                <option value="Salaries">Salaries</option>
                <option value="Utilities">Utilities</option>
                <option value="Tax Payments">Tax Payments</option>
                <option value="Marketing">Marketing</option>
              </select>

              <select
                value={taxCategory}
                onChange={(e) => {
                  setTaxCategory(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="">{t("transactions.allTaxCategories")}</option>
                <option value="turnover_taxable">Aylanmadan olinadigan soliq</option>
                <option value="vat_deductible">QQS chegiriladigan</option>
                <option value="non_deductible_expense">Chegirilmaydigan xarajatlar</option>
                <option value="exempt">Ozod / Neytral</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 border-t border-slate-100 dark:border-slate-800/80">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/30">
                  <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800/80">
                    <TableHead className="text-[10px] font-bold py-3 pl-6 text-slate-400">{t("transactions.table.dateDesc")}</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">{t("transactions.table.category")}</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400">{t("transactions.table.taxStatus")}</TableHead>
                    <TableHead className="text-[10px] font-bold py-3 text-slate-400 text-right pr-6">{t("transactions.table.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-slate-100 dark:border-slate-800/80">
                        <TableCell colSpan={4} className="py-4 text-center pr-6">
                          <div className="h-5 w-full animate-pulse bg-slate-50 dark:bg-slate-900 rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-16 text-center text-slate-400 text-xs pr-6">
                        <div className="flex flex-col items-center gap-3">
                          <Coins className="h-6 w-6 text-slate-300" />
                          <span>{labels.empty}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx: any) => {
                      const isLowConfidence = tx.confidenceScore !== undefined && tx.confidenceScore < 70;
                      const catLabels = taxCategoryLabels[lang] || taxCategoryLabels.uz;
                      return (
                        <TableRow key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors border-b border-slate-100 dark:border-slate-800/80">
                          <TableCell className="py-3 pl-6">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-50 truncate max-w-[320px]">
                                {tx.description}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">
                                {new Date(tx.date).toLocaleDateString(lang === "en" ? "en-US" : "uz-UZ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex flex-col gap-1 items-start">
                              <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-slate-700 dark:text-slate-350">
                                {tx.category}
                              </Badge>
                              {tx.confidenceScore !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className={`text-[8px] font-semibold ${isLowConfidence ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                                    {labels.confidence}: {tx.confidenceScore}%
                                  </span>
                                  {isLowConfidence && (
                                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[7px] px-1 py-0.2 rounded hover:bg-amber-500/20 cursor-pointer">
                                      {labels.review}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              tx.taxCategory === "turnover_taxable"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : tx.taxCategory === "vat_deductible"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : tx.taxCategory === "non_deductible_expense"
                                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                  : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                            }`}>
                              {catLabels[tx.taxCategory] || tx.taxCategory}
                            </Badge>
                          </TableCell>
                          <TableCell className={`py-3 text-xs font-bold text-right pr-6 ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                            {tx.type === "income" ? "+" : "-"} {formatUzs(tx.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold">
                  {labels.page}: {pagination.page} / {pagination.pages} ({labels.total.replace("{total}", pagination.total.toString())})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-[10px] font-bold px-2 rounded-lg border-slate-200 dark:border-slate-850 cursor-pointer"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    {labels.prev}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.pages}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    className="h-8 text-[10px] font-bold px-2 rounded-lg border-slate-200 dark:border-slate-850 cursor-pointer"
                  >
                    {labels.next}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}

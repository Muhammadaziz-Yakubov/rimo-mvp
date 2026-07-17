"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  Sparkles,
  TrendingUp,
  Info,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFinancialStats } from "@/hooks/use-api";
import { useLanguageStore } from "@/store/language.store";
import { t } from "@/locales/t";
import { toast } from "react-hot-toast";

const formatUzs = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(amount);
};

const taxCalculatorLabels: Record<string, {
  title: string;
  desc: string;
  loadBalance: string;
  balanceSuccess: string;
  balanceError: string;
  regimeLabel: string;
  regimeTurnover: string;
  regimeGeneral: string;
  turnoverLabel: string;
  expensesLabel: string;
  salaryLabel: string;
  taxRateLabel: string;
  calculateBtn: string;
  legislationTipTitle: string;
  legislationTipDesc: string;
  resultsTitle: string;
  totalTaxLabel: string;
  totalTaxSub: string;
  netIncomeLabel: string;
  netIncomeSub: string;
  breakdownTitle: string;
  annualProjTitle: string;
  annualProjDesc: string;
  startPlaceholderTitle: string;
  startPlaceholderDesc: string;
}> = {
  uz: {
    title: "Soliq Kalkulyatori 2.0",
    desc: "O'zbekiston Respublikasi soliq tizimining barcha to'lovlarini modellashtirish va avtomatik prognoz qilish.",
    loadBalance: "Kompaniya balansidan yuklash",
    balanceSuccess: "Haqiqiy kompaniya tranzaksiya ma'lumotlari yuklandi!",
    balanceError: "Tranzaksiyalar ma'lumotlari topilmadi. Avval dashboard orqali Excel yuklang.",
    regimeLabel: "Soliq solish tartibi",
    regimeTurnover: "Aylanmadan soliq",
    regimeGeneral: "Umumiy tartib (QQS)",
    turnoverLabel: "Jami tushum (Aylanma)",
    expensesLabel: "Xarajatlar miqdori",
    salaryLabel: "Mehnatga haq to'lash (Ish haqi)",
    taxRateLabel: "Aylanmadan olinadigan soliq stavkasi",
    calculateBtn: "Soliqlarni hisoblash",
    legislationTipTitle: "Soliq qonunchiligi",
    legislationTipDesc: "Yillik oboroti 1 milliard so'mdan oshgan korxonalar avtomatik ravishda umumiy soliq tizimiga (QQS 12% va Foyda solig'i 15%) o'tishi shart.",
    resultsTitle: "Soliq tahlili natijasi",
    totalTaxLabel: "Jami soliq yuki",
    totalTaxSub: "Stavka: {rate}% aylanmadan",
    netIncomeLabel: "Sof daromad",
    netIncomeSub: "Rentabellik: {rate}%",
    breakdownTitle: "Batafsil yoyilma:",
    annualProjTitle: "Yillik soliq prognozi",
    annualProjDesc: "Ushbu ko'rsatkichlar asosida yillik prognoz qilingan aylanma: {turnover}, yillik kutilayotgan umumiy soliq yuki esa taxminan {tax} ni tashkil etadi.",
    startPlaceholderTitle: "Hisoblashni boshlang",
    startPlaceholderDesc: "Parametrlarni to'ldiring va \"Soliqlarni hisoblash\" tugmasini bosing."
  },
  "uz-cyr": {
    title: "Солиқ Калкулятори 2.0",
    desc: "Ўзбекистон Республикаси солиқ тизимининг барча тўловларини моделлаштириш ва автоматик прогноз қилиш.",
    loadBalance: "Компания балансидан юклаш",
    balanceSuccess: "Ҳақиқий компания транзакция маълумотлари юкланди!",
    balanceError: "Транзакциялар маълумотлари топилмади. Аввал dashboard орқали Excel юкланг.",
    regimeLabel: "Солиқ солиш тартиби",
    regimeTurnover: "Айланмадан солиқ",
    regimeGeneral: "Умумий тартиб (ҚҚС)",
    turnoverLabel: "Жами тушум (Айланма)",
    expensesLabel: "Харажатлар миқдори",
    salaryLabel: "Меҳнатга ҳақ тўлаш (Иш ҳақи)",
    taxRateLabel: "Айланмадан олинадиган солиқ ставкаси",
    calculateBtn: "Солиқларни ҳисоблаш",
    legislationTipTitle: "Солиқ қонунчилиги",
    legislationTipDesc: "Йиллик обороти 1 миллиард сўмдан ошган корхоналар автоматик равишда умумий солиқ тизимига (ҚҚС 12% ва Фойда солиғи 15%) ўтиши шарт.",
    resultsTitle: "Солиқ таҳлили натижаси",
    totalTaxLabel: "Жами солиқ юки",
    totalTaxSub: "Ставка: {rate}% айланмадан",
    netIncomeLabel: "Соф даромад",
    netIncomeSub: "Рентабеллик: {rate}%",
    breakdownTitle: "Батафсил ёйилма:",
    annualProjTitle: "Йиллик солиқ прогнози",
    annualProjDesc: "Ушбу кўрсаткичлар асосида йиллик прогноз қилинган айланма: {turnover}, йиллик кутилаётган умумий солиқ юки эса тахминан {tax} ни ташкил этади.",
    startPlaceholderTitle: "Ҳисоблашни бошланг",
    startPlaceholderDesc: "Параметрларни тўлдиринг ва \"Солиқларни ҳисоблаш\" тугмасини босинг."
  },
  en: {
    title: "Tax Calculator 2.0",
    desc: "Model and automatically project all tax payments under the tax system of the Republic of Uzbekistan.",
    loadBalance: "Load from Company Balance",
    balanceSuccess: "Real company transaction data loaded successfully!",
    balanceError: "Transaction data not found. Please upload an Excel sheet first.",
    regimeLabel: "Taxation Regime",
    regimeTurnover: "Turnover Tax",
    regimeGeneral: "General Regime (VAT)",
    turnoverLabel: "Total Revenue (Turnover)",
    expensesLabel: "Total Expenses",
    salaryLabel: "Salary Fund (Payroll)",
    taxRateLabel: "Turnover Tax Rate",
    calculateBtn: "Calculate Taxes",
    legislationTipTitle: "Tax Legislation",
    legislationTipDesc: "Companies with an annual turnover exceeding 1 billion UZS must transition to the general tax regime (12% VAT and 15% Profit Tax).",
    resultsTitle: "Tax Analysis Result",
    totalTaxLabel: "Total Tax Obligation",
    totalTaxSub: "Rate: {rate}% of turnover",
    netIncomeLabel: "Net Income",
    netIncomeSub: "Margin: {rate}%",
    breakdownTitle: "Detailed Tax Breakdown:",
    annualProjTitle: "Annual Tax Projection",
    annualProjDesc: "Based on these figures, projected annual turnover is: {turnover}, and projected annual tax obligation is approximately {tax}.",
    startPlaceholderTitle: "Start Calculation",
    startPlaceholderDesc: "Fill in the parameters and click the \"Calculate Taxes\" button."
  },
  ru: {
    title: "Налоговый калькулятор 2.0",
    desc: "Моделирование и автоматическое прогнозирование всех налоговых платежей Республики Узбекистан.",
    loadBalance: "Загрузить из баланса компании",
    balanceSuccess: "Реальные транзакционные данные компании успешно загружены!",
    balanceError: "Данные о транзакциях не найдены. Сначала загрузите Excel.",
    regimeLabel: "Режим налогообложения",
    regimeTurnover: "Налог с оборота",
    regimeGeneral: "Общий режим (НДС)",
    turnoverLabel: "Общая выручка (Оборот)",
    expensesLabel: "Сумма расходов",
    salaryLabel: "Фонд оплаты труда (Зарплата)",
    taxRateLabel: "Ставка налога с оборота",
    calculateBtn: "Рассчитать налоги",
    legislationTipTitle: "Налоговое законодательство",
    legislationTipDesc: "Предприятия с годовым оборотом более 1 миллиарда сумов обязаны перейти на общий режим (НДС 12% и налог на прибыль 15%).",
    resultsTitle: "Результаты анализа налогов",
    totalTaxLabel: "Общая налоговая нагрузка",
    totalTaxSub: "Ставка: {rate}% от оборота",
    netIncomeLabel: "Чистая прибыль",
    netIncomeSub: "Рентабельность: {rate}%",
    breakdownTitle: "Подробная расшифровка:",
    annualProjTitle: "Годовой налоговый прогноз",
    annualProjDesc: "На основе этих данных прогнозируемый годовой оборот составляет: {turnover}, а прогнозируемый годовой налог составит примерно {tax}.",
    startPlaceholderTitle: "Начать расчет",
    startPlaceholderDesc: "Заполните параметры и нажмите кнопку \"Рассчитать налоги\"."
  }
};

export default function TaxCalculatorPage() {
  const { data: finData } = useFinancialStats();
  const { lang } = useLanguageStore();

  const labels = taxCalculatorLabels[lang] || taxCalculatorLabels.uz;

  // Inputs
  const [regime, setRegime] = useState<"turnover" | "general">("turnover");
  const [turnover, setTurnover] = useState<number>(120000000); // 120 mln UZS
  const [expenses, setExpenses] = useState<number>(30000000); // 30 mln UZS
  const [salaryFund, setSalaryFund] = useState<number>(15000000); // 15 mln UZS
  const [turnoverRate, setTurnoverRate] = useState<number>(4); // 4% turnover tax
  const [isCalculated, setIsCalculated] = useState<boolean>(true);

  // Load actual numbers from database
  const loadLocalData = () => {
    if (!finData) {
      toast.error(labels.balanceError);
      return;
    }
    const stats = finData.stats || { revenue: 0, expenses: 0 };
    
    // Attempt to extract salaries or guess salary fund
    let salaries = 0;
    if (Array.isArray(finData.recentTransactions)) {
      finData.recentTransactions.forEach((t: any) => {
        if (t.type === "expense" && (t.category?.toLowerCase()?.includes("salary") || t.category?.toLowerCase()?.includes("maosh"))) {
          salaries += t.amount;
        }
      });
    }
    // Fallback: estimate salary fund as 15% of expenses if no specific salaries detected
    if (salaries === 0) {
      salaries = stats.expenses * 0.15;
    }

    setTurnover(stats.revenue || 0);
    setExpenses(stats.expenses || 0);
    setSalaryFund(salaries || 0);
    setRegime(stats.revenue > 1000000000 ? "general" : "turnover"); // Automatically switch to general regime if turnover > 1 billion UZS
    toast.success(labels.balanceSuccess);
  };

  // Computations
  // 1. Turnover Tax (Aylanmadan olinadigan soliq)
  const turnoverTax = regime === "turnover" ? (turnover * turnoverRate) / 100 : 0;
  
  // 2. VAT (QQS) - 12% on revenue, assuming 70% of expenses are VAT-deductible in general regime
  const vatRate = 12;
  const rawVat = (turnover * vatRate) / 100;
  const vatCredit = (expenses * 0.7 * vatRate) / 100;
  const vatTax = regime === "general" ? Math.max(0, rawVat - vatCredit) : 0;

  // 3. Corporate Profit Tax (Foyda solig'i) - 15% of profit in general regime
  const profitRate = 15;
  const grossProfit = Math.max(0, turnover - expenses);
  const profitTax = regime === "general" ? (grossProfit * profitRate) / 100 : 0;

  // 4. Social Tax (Ijtimoiy soliq) - 12% of salary fund
  const socialTaxRate = 12;
  const socialTax = (salaryFund * socialTaxRate) / 100;

  // 5. Personal Income Tax (JShDS) - 12% of salary fund
  const incomeTaxRate = 12;
  const incomeTax = (salaryFund * incomeTaxRate) / 100;

  // Total Tax
  const totalTax = turnoverTax + vatTax + profitTax + socialTax + incomeTax;
  const cleanIncome = turnover - expenses - totalTax;

  // Projections
  const annualProjectionMultiplier = 4;
  const projectedAnnualTax = totalTax * annualProjectionMultiplier;
  const projectedAnnualTurnover = turnover * annualProjectionMultiplier;

  // Breakdown lists
  const taxItems = [
    { name: regime === "turnover" ? "Aylanmadan olinadigan soliq (Turnover Tax)" : "Aylanmadan olinadigan soliq", amount: turnoverTax, active: regime === "turnover", rate: `${turnoverRate}%` },
    { name: "QQS (VAT - 12%)", amount: vatTax, active: regime === "general", rate: "12%" },
    { name: "Foyda solig'i (Corporate Profit Tax)", amount: profitTax, active: regime === "general", rate: "15%" },
    { name: "Ijtimoiy soliq (Social Tax)", amount: socialTax, active: salaryFund > 0, rate: "12%" },
    { name: "Daromad solig'i (Personal Income Tax)", amount: incomeTax, active: salaryFund > 0, rate: "12%" },
  ];

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-6xl mx-auto space-y-6 pb-16"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {labels.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-none">
              {labels.desc}
            </p>
          </div>
          
          <Button
            onClick={loadLocalData}
            variant="outline"
            className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Database className="h-4 w-4" />
            <span>{labels.loadBalance}</span>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Inputs Panel */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
              {/* Regime Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {labels.regimeLabel}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRegime("turnover")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                      regime === "turnover"
                        ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {labels.regimeTurnover}
                  </button>
                  <button
                    onClick={() => setRegime("general")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                      regime === "general"
                        ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {labels.regimeGeneral}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Turnover Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center justify-between uppercase tracking-wider">
                    <span>{labels.turnoverLabel}</span>
                    <span>UZS</span>
                  </label>
                  <input
                    type="number"
                    value={turnover === 0 ? "" : turnover}
                    onChange={(e) => setTurnover(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950 transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Expenses Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center justify-between uppercase tracking-wider">
                    <span>{labels.expensesLabel}</span>
                    <span>UZS</span>
                  </label>
                  <input
                    type="number"
                    value={expenses === 0 ? "" : expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950 transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Salary Fund Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center justify-between uppercase tracking-wider">
                    <span>{labels.salaryLabel}</span>
                    <span>UZS</span>
                  </label>
                  <input
                    type="number"
                    value={salaryFund === 0 ? "" : salaryFund}
                    onChange={(e) => setSalaryFund(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950 transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Turnover Rate Selector */}
                {regime === "turnover" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 flex items-center justify-between uppercase tracking-wider">
                      <span>{labels.taxRateLabel}</span>
                      <span>%</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={turnoverRate === 0 ? "" : turnoverRate}
                        onChange={(e) => setTurnoverRate(Number(e.target.value))}
                        className="w-14 h-9 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-950 transition-all"
                        placeholder="4"
                      />
                      {[1, 2, 3, 4, 7.5].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setTurnoverRate(rate)}
                          className={`flex-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                            turnoverRate === rate
                              ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
                              : "border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setIsCalculated(true)}
                  className="w-full h-10 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{labels.calculateBtn}</span>
                </Button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 p-5 space-y-2">
              <div className="flex gap-3">
                <Info className="h-4.5 w-4.5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider">
                    {labels.legislationTipTitle}
                  </h4>
                  <p className="text-[10px] text-slate-505 leading-normal">
                    {labels.legislationTipDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-3 space-y-6">
            {isCalculated ? (
              <div className="space-y-6">
                <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {labels.resultsTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{labels.totalTaxLabel}</span>
                        <span className="text-lg font-black text-red-500">{formatUzs(totalTax)}</span>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {labels.totalTaxSub.replace("{rate}", ((totalTax / (turnover || 1)) * 100).toFixed(1))}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{labels.netIncomeLabel}</span>
                        <span className="text-lg font-black text-emerald-500">{formatUzs(cleanIncome)}</span>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {labels.netIncomeSub.replace("{rate}", ((cleanIncome / (turnover || 1)) * 100).toFixed(1))}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{labels.breakdownTitle}</h4>
                      <div className="space-y-2">
                        {taxItems.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                              item.active
                                ? "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800"
                                : "opacity-30 border-dashed border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-50">{item.name}</span>
                              <span className="text-[9px] text-slate-400 block">Stavka: {item.rate}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-50">
                              {item.active ? formatUzs(item.amount) : "0 UZS"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projections block */}
                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <TrendingUp className="h-4 w-4" />
                        <span>{labels.annualProjTitle}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {labels.annualProjDesc
                          .replace("{turnover}", formatUzs(projectedAnnualTurnover))
                          .replace("{tax}", formatUzs(projectedAnnualTax))
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-[260px] rounded-xl border border-dashed border-slate-200 dark:border-slate-850 flex flex-col items-center justify-center text-center p-6 bg-slate-50/20">
                <Calculator className="h-6 w-6 text-slate-450 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50 mb-1">{labels.startPlaceholderTitle}</h4>
                <p className="text-[10px] text-slate-500 max-w-[280px]">
                  {labels.startPlaceholderDesc}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}

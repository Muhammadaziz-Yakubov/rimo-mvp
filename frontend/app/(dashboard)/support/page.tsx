"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiChat, useFinancialStats } from "@/hooks/use-api";
import { useLanguageStore } from "@/store/language.store";
import { useAuthStore } from "@/store/auth.store";
import { t } from "@/locales/t";
import { toast } from "react-hot-toast";

const formatUzs = (amount: number) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(amount);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const welcomeMessages: Record<string, string> = {
  uz: "Assalomu alaykum! Men Rimo AI — sizning shaxsiy moliyaviy yordamchingizman. Menga yuklangan tranzaksiyalar bo'yicha savollar berishingiz, soliqlar miqdorini so'rashingiz yoki oylik xarajatlar tahlilini so'rashingiz mumkin. Qanday yordam bera olaman?",
  "uz-cyr":
    "Ассалому алайкум! Мен Римо АИ — сизнинг шахсий молиявий ёрдамчингизман. Менга юкланган транзакциялар бўйича саволлар беришингиз, солиқлар миқдорини сўрашингиз ёки ойлик харажатлар таҳлилини сўрашингиз мумкин. Қандай ёрдам бера оламан?",
  en: "Hello! I am Rimo AI — your personal financial assistant. You can ask me questions about your uploaded transactions, estimate your taxes, or request a breakdown of monthly expenses. How can I help you today?",
  ru: "Здравствуйте! Я Rimo AI — ваш персональный финансовый помощник. Вы можете задать мне вопросы об импортированных транзакциях, оценить налоги или запросить анализ ежемесячных расходов. Чем я могу помочь?",
};

const suggestionsMap: Record<
  string,
  Array<{ q: string; label: string; emoji: string }>
> = {
  uz: [
    {
      q: "Eng katta xarajatim nima bo'ldi?",
      label: "Eng katta xarajat",
      emoji: "📉",
    },
    {
      q: "Aylanmadan olinadigan soliq miqdorini baholab ber.",
      label: "Aylanma soliq hisobi",
      emoji: "🧮",
    },
    {
      q: "QQS bo'yicha to'lovlarimni chegirish mumkinmi?",
      label: "QQS tahlili",
      emoji: "📋",
    },
    {
      q: "Tranzaksiyalarimda shubhali amallar bormi?",
      label: "Moliyaviy xavflar",
      emoji: "🔍",
    },
  ],
  "uz-cyr": [
    {
      q: "Энг катта харажатим нима бўлди?",
      label: "Энг катта харажат",
      emoji: "📉",
    },
    {
      q: "Айланмадан олинадиган солиқ миқдорини баҳолаб бер.",
      label: "Айланма солиқ ҳисоби",
      emoji: "🧮",
    },
    {
      q: "ҚҚС бўйича тўловларимни чегириш мумкинми?",
      label: "ҚҚС таҳлили",
      emoji: "📋",
    },
    {
      q: "Транзакцияларимда шубҳали амаллар борми?",
      label: "Молиявий хавфлар",
      emoji: "🔍",
    },
  ],
  en: [
    { q: "What was my largest expense?", label: "Largest Expense", emoji: "📉" },
    {
      q: "Estimate my turnover tax amount.",
      label: "Turnover Tax Estimate",
      emoji: "🧮",
    },
    { q: "Can I deduct my VAT payments?", label: "VAT Analysis", emoji: "📋" },
    {
      q: "Are there any suspicious transactions?",
      label: "Financial Risks",
      emoji: "🔍",
    },
  ],
  ru: [
    {
      q: "Какая была моя самая большая статья расходов?",
      label: "Самый крупный расход",
      emoji: "📉",
    },
    {
      q: "Оцени сумму налога с оборота.",
      label: "Расчет налога с оборота",
      emoji: "🧮",
    },
    {
      q: "Могу ли я вычесть платежи по НДС?",
      label: "Анализ НДС",
      emoji: "📋",
    },
    {
      q: "Есть ли подозрительные операции?",
      label: "Финансовые риски",
      emoji: "🔍",
    },
  ],
};

const supportLabels: Record<
  string,
  {
    title: string;
    placeholder: string;
    send: string;
    context: string;
    loading: string;
    errorToast: string;
    errorMsg: string;
  }
> = {
  uz: {
    title: "Rimo AI Yordamchi",
    placeholder: "Moliyaviy savolingizni yozing...",
    send: "Yuborish",
    context: "Moliyaviy Salomatlik (AI Audit)",
    loading: "Javob tayyorlanmoqda...",
    errorToast: "AI javob bera olmadi.",
    errorMsg:
      "Kechirasiz, GROQ AI ulanishida texnik xatolik yuz berdi.",
  },
  "uz-cyr": {
    title: "Rimo AI Ёрдамчи",
    placeholder: "Молиявий саволингизни ёзинг...",
    send: "Юбориш",
    context: "Молиявий Саломатлик (AI Аудит)",
    loading: "Жавоб тайёрланмоқда...",
    errorToast: "АИ жавоб бера олмади.",
    errorMsg:
      "Кечирасиз, GROQ АИ уланишида техник хатолик юз берди.",
  },
  en: {
    title: "Rimo AI Assistant",
    placeholder: "Ask about your financial data...",
    send: "Send",
    context: "Financial Health (AI Audit)",
    loading: "Preparing response...",
    errorToast: "AI failed to respond.",
    errorMsg:
      "Sorry, a technical error occurred with the GROQ AI connection.",
  },
  ru: {
    title: "Rimo AI Ассистент",
    placeholder: "Задайте вопрос о финансах...",
    send: "Отправить",
    context: "Финансовое здоровье (AI Аудит)",
    loading: "Подготовка ответа...",
    errorToast: "ИИ не смог ответить.",
    errorMsg:
      "Произошла техническая ошибка при подключении к GROQ AI.",
  },
};

export default function RimoAiPage() {
  const { lang } = useLanguageStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeText = welcomeMessages[lang] || welcomeMessages.uz;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
      },
    ]);
  }, [lang]);

  const { data: finData } = useFinancialStats();
  const chatMutation = useAiChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;
    if (!textToSend) setInput("");

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: queryText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const activeLabels = supportLabels[lang] || supportLabels.uz;

    try {
      const response = await chatMutation.mutateAsync({ query: queryText, history });
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: response.response || "Error loading AI response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error((supportLabels[lang] || supportLabels.uz).errorToast);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: activeLabels.errorMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const stats = finData?.stats || {
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    estimatedTax: 0,
    healthScore: 100,
    healthStatus: "Good",
    healthBreakdown: [] as string[],
  };
  const activeLabels = supportLabels[lang] || supportLabels.uz;
  const suggestions = suggestionsMap[lang] || suggestionsMap.uz;

  const score: number = stats.healthScore || 100;
  const scoreColor =
    score >= 88
      ? "bg-emerald-500"
      : score >= 65
      ? "bg-amber-500"
      : "bg-rose-500";
  const scoreTextColor =
    score >= 88
      ? "text-emerald-500"
      : score >= 65
      ? "text-amber-500"
      : "text-rose-500";

  const healthBadgeClass = (status: string) => {
    const k = status?.toLowerCase();
    if (k === "excellent")
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (k === "good")
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    if (k === "warning")
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  };

  const healthStatusText = (status: string) => {
    const k = status?.toLowerCase();
    if (k === "excellent") return "A'lo darajada";
    if (k === "good") return "Barqaror";
    if (k === "warning") return "Soliq yoki xarajat riski";
    return status;
  };

  const userInitials = (() => {
    const profile = (user as any)?.user?.profile;
    const fname = profile?.firstname || profile?.fullname || "";
    return fname.substring(0, 2).toUpperCase() || "ME";
  })();

  return (
    <AppShell>
      <div className="grid gap-6 md:grid-cols-4 h-[calc(100vh-100px)] max-w-6xl mx-auto pb-6">
        {/* ─── Chat Area ─── */}
        <div className="md:col-span-3 flex flex-col h-full rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 overflow-hidden border border-violet-100 dark:border-violet-900/40">
                <Brain className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  {activeLabels.title}
                  {/* Online pulse */}
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[8px] px-1.5 py-0 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider"
                  >
                    PRO
                  </Badge>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  InFast AI Assistant
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 select-text">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex gap-3 max-w-[88%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {m.role === "user" ? (
                      <div className="h-7 w-7 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 text-[9px] font-extrabold shadow-sm">
                        {userInitials}
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-0.5 flex items-center justify-center">
                        <img
                          src="/rimo.png"
                          alt="Rimo"
                          className="h-full w-full object-contain rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col gap-1 max-w-full min-w-0">
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        m.role === "user"
                          ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-tr-none font-medium"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/40 rounded-tl-none"
                      }`}
                    >
                      {m.role === "user" ? (
                        <p>{m.content}</p>
                      ) : (
                        <div className="space-y-1.5">
                          {m.content.split("\n").map((line, idx) => {
                            if (line.match(/^#{1,3}\s/)) {
                              return (
                                <p
                                  key={idx}
                                  className="font-bold text-slate-900 dark:text-slate-50 mt-2 first:mt-0"
                                >
                                  {line.replace(/^#+\s/, "")}
                                </p>
                              );
                            }
                            if (
                              line.startsWith("- ") ||
                              line.startsWith("• ") ||
                              line.startsWith("* ")
                            ) {
                              return (
                                <li
                                  key={idx}
                                  className="ml-4 list-disc leading-relaxed"
                                >
                                  {line.substring(2)}
                                </li>
                              );
                            }
                            if (
                              line.includes("|") &&
                              line.trim().startsWith("|")
                            ) {
                              const cells = line
                                .split("|")
                                .map((c) => c.trim())
                                .filter(Boolean);
                              if (cells.length >= 2 && !line.includes("---")) {
                                return (
                                  <div
                                    key={idx}
                                    className="flex gap-3 py-1.5 px-3 bg-slate-100/60 dark:bg-slate-800/30 rounded-lg mt-1 font-mono text-[10px] justify-between"
                                  >
                                    {cells.map((cell, ci) => (
                                      <span
                                        key={ci}
                                        className={
                                          ci === 0
                                            ? "font-bold text-slate-700 dark:text-slate-300 truncate"
                                            : "text-right text-slate-900 dark:text-slate-100 shrink-0"
                                        }
                                      >
                                        {cell}
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            }
                            if (line.trim() === "" || line.match(/^-+$/))
                              return <div key={idx} className="h-1" />;
                            return <p key={idx}>{line}</p>;
                          })}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[8px] font-bold text-slate-400 px-1 ${
                        m.role === "user" ? "text-right" : ""
                      }`}
                    >
                      {m.timestamp.toLocaleTimeString(
                        lang === "en" ? "en-US" : "uz-UZ",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI typing indicator */}
            {chatMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="h-7 w-7 shrink-0 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden p-0.5 flex items-center justify-center">
                  <img
                    src="/rimo.png"
                    alt="Rimo"
                    className="h-full w-full object-contain rounded-full"
                  />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-3 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 flex items-center gap-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600 dark:text-violet-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    {activeLabels.loading}
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            {/* Suggestions — only shown on first (welcome) message */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.q)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-violet-500 dark:hover:border-violet-500 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex gap-2 p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus-within:border-violet-500 dark:focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder={activeLabels.placeholder}
                disabled={chatMutation.isPending}
                className="flex-1 h-9 border-0 focus-visible:ring-0 bg-transparent px-2 text-xs"
              />
              <Button
                onClick={() => handleSend()}
                disabled={chatMutation.isPending || !input.trim()}
                className="h-9 w-9 p-0 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-lg shrink-0 cursor-pointer transition-all flex items-center justify-center border-0 shadow-sm"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Right Panel ─── */}
        <div className="space-y-4 overflow-y-auto">
          {/* AI Health Score Card */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-900/60">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-500" />
                {activeLabels.context}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    AI Salomatlik
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[8px] font-extrabold px-2 py-0.5 rounded ${healthBadgeClass(
                      stats.healthStatus
                    )}`}
                  >
                    {healthStatusText(stats.healthStatus)}
                  </Badge>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span
                    className={`text-2xl font-black tabular-nums ${scoreTextColor}`}
                  >
                    {score}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold mb-0.5">
                    100 balldan
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${scoreColor} rounded-full transition-all duration-700`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              {stats.healthBreakdown &&
                (stats.healthBreakdown as string[]).length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                      Tahlil omillari:
                    </span>
                    {(stats.healthBreakdown as string[])
                      .slice(0, 5)
                      .map((item: string, idx: number) => {
                        const isNeg = /[-]|\d+.*ball/.test(item);
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                                isNeg ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                            />
                            <span>{item}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* KPI Metrics Card */}
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm">
            <CardContent className="p-4 space-y-0 divide-y divide-slate-100 dark:divide-slate-800/80">
              {[
                {
                  label: t("dashboard.kpis.revenue"),
                  val: stats.revenue,
                  Icon: TrendingUp,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
                },
                {
                  label: t("dashboard.kpis.expenses"),
                  val: stats.expenses,
                  Icon: TrendingDown,
                  color: "text-rose-500",
                  bg: "bg-rose-500/10 dark:bg-rose-500/5",
                },
                {
                  label: t("dashboard.kpis.netProfit"),
                  val: stats.netProfit,
                  Icon: Activity,
                  color: "text-violet-500",
                  bg: "bg-violet-500/10 dark:bg-violet-500/5",
                },
                {
                  label: t("dashboard.kpis.estimatedTax"),
                  val: stats.estimatedTax,
                  Icon: Percent,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10 dark:bg-amber-500/5",
                },
              ].map(({ label, val, Icon, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      {label}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-50 text-[12px] tabular-nums">
                      {formatUzs(val)}
                    </span>
                  </div>
                  <div
                    className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

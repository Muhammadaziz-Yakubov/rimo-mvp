"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiChat, useFinancialStats } from "@/hooks/use-api";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const welcomeMessages: Record<string, string> = {
  uz: "Assalomu alaykum! Men Rimo AI — sizning shaxsiy moliyaviy yordamchingizman. Menga yuklangan tranzaksiyalar bo'yicha savollar berishingiz, soliqlar miqdorini so'rashingiz yoki oylik xarajatlar tahlilini so'rashingiz mumkin. Qanday yordam bera olaman?",
  "uz-cyr": "Ассалому алайкум! Мен Римо АИ — сизнинг шахсий молиявий ёрдамчингизман. Менга юкланган транзакциялар бўйича саволлар беришингиз, солиқлар миқдорини сўрашингиз ёки ойлик харажатлар таҳлилини сўрашингиз мумкин. Қандан ёрдам бера оламан?",
  en: "Hello! I am Rimo AI — your personal financial assistant. You can ask me questions about your uploaded transactions, estimate your taxes, or request a breakdown of monthly expenses. How can I help you today?",
  ru: "Здравствуйте! Я Rimo AI — ваш персональный финансовый помощник. Вы можете задать мне вопросы об импортированных транзакциях, оценить налоги или запросить анализ ежемесячных расходов. Чем я могу помочь?"
};

const suggestionsMap: Record<string, Array<{ q: string; label: string }>> = {
  uz: [
    { q: "Eng katta xarajatim nima bo'ldi?", label: "Eng katta xarajat" },
    { q: "Aylanmadan olinadigan soliq miqdorini baholab ber.", label: "Aylanma soliq hisobi" },
    { q: "QQS bo'yicha to'lovlarimni chegirish mumkinmi?", label: "QQS tahlili" },
    { q: "Tranzaksiyalarimda shubhali amallar bormi?", label: "Moliyaviy xavflar" },
  ],
  "uz-cyr": [
    { q: "Энг катта харажатим нима бўлди?", label: "Энг катта харажат" },
    { q: "Айланмадан олинадиган солиқ миқдорини баҳолаб бер.", label: "Айланма солиқ ҳисоби" },
    { q: "ҚҚС бўйича тўловларимни чегириш мумкинми?", label: "ҚҚС таҳлили" },
    { q: "Транзакцияларимда шубҳали амаллар борми?", label: "Молиявий хавфлар" },
  ],
  en: [
    { q: "What was my largest expense?", label: "Largest Expense" },
    { q: "Estimate my turnover tax amount.", label: "Turnover Tax Estimate" },
    { q: "Can I deduct my VAT payments?", label: "VAT Analysis" },
    { q: "Are there any suspicious transactions?", label: "Financial Risks" },
  ],
  ru: [
    { q: "Какая была моя самая большая статья расходов?", label: "Самый крупный расход" },
    { q: "Оцени сумму налога с оборота.", label: "Расчет налога с оборота" },
    { q: "Могу ли я вычесть платежи по НДС?", label: "Анализ НДС" },
    { q: "Есть ли подозрительные операции в моих транзакциях?", label: "Финансовые риски" },
  ]
};

const supportLabels: Record<string, { title: string; placeholder: string; send: string; context: string; loading: string; errorToast: string; errorMsg: string }> = {
  uz: {
    title: "Rimo AI Assistent",
    placeholder: "Moliyaviy ma'lumotlaringiz bo'yicha savol bering...",
    send: "Yuborish",
    context: "Kompaniya holati (Context)",
    loading: "Javob tayyorlanmoqda...",
    errorToast: "AI javob bera olmadi. Tarmoq sozlamalarini tekshiring.",
    errorMsg: "Kechirasiz, hukumat portali yoki GROQ AI ulanishida texnik xatolik yuz berdi. Sozlamalaringiz to'g'ri sozlanganligini tekshiring."
  },
  "uz-cyr": {
    title: "Rimo AI Ассистент",
    placeholder: "Молиявий маълумотларингиз бўйича савол беринг...",
    send: "Юбориш",
    context: "Корхона ҳолати (Context)",
    loading: "Жавоб тайёрланмоқда...",
    errorToast: "АИ жавоб бера олмади. Тармоқ созламаларини теширинг.",
    errorMsg: "Кечирасиз, ҳукумат портали ёки GROQ АИ уланишида техник хатолик юз берди. Созламаларингиз тўғри созланганлигини текширинг."
  },
  en: {
    title: "Rimo AI Assistant",
    placeholder: "Ask about your financial data...",
    send: "Send",
    context: "Company Status (Context)",
    loading: "Preparing response...",
    errorToast: "AI failed to respond. Check network settings.",
    errorMsg: "Sorry, a technical error occurred with the government portal or GROQ AI connection. Please verify that your credentials are set correctly."
  },
  ru: {
    title: "Rimo AI Ассистент",
    placeholder: "Задайте вопрос о финансовых данных...",
    send: "Отправить",
    context: "Состояние компании (Контекст)",
    loading: "Подготовка ответа...",
    errorToast: "ИИ не смог ответить. Проверьте сетевое соединение.",
    errorMsg: "Извините, произошла техническая ошибка при подключении к государственному порталу или GROQ AI. Проверьте правильность настроек."
  }
};

export default function RimoAiPage() {
  const { lang } = useLanguageStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize/reset welcome message when language changes
  useEffect(() => {
    const welcomeText = welcomeMessages[lang] || welcomeMessages.uz;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
      }
    ]);
  }, [lang]);

  // Fetch stats to display key context metrics on the sidebar
  const { data: finData } = useFinancialStats();
  const chatMutation = useAiChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    if (!textToSend) setInput("");

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: queryText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Format chat history for backend request
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const activeLabels = supportLabels[lang] || supportLabels.uz;

    try {
      const response = await chatMutation.mutateAsync({
        query: queryText,
        history,
      });

      // Add assistant response
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: response.response || "Error loading AI response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      toast.error(activeLabels.errorToast);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: activeLabels.errorMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const stats = finData?.stats || { revenue: 0, expenses: 0, netProfit: 0, estimatedTax: 0 };
  const activeLabels = supportLabels[lang] || supportLabels.uz;
  const suggestions = suggestionsMap[lang] || suggestionsMap.uz;

  return (
    <AppShell>
      <div className="grid gap-6 md:grid-cols-4 h-[calc(100vh-100px)] max-w-6xl mx-auto">
        {/* Chat area */}
        <div className="md:col-span-3 flex flex-col h-full rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-950 dark:text-slate-50 flex items-center gap-1.5">
                  {activeLabels.title}
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-555 font-bold uppercase tracking-wider">
                    PRO
                  </Badge>
                </h3>
              </div>
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-4 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`rounded-xl p-4 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-tr-none font-medium"
                      : "bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/40 rounded-tl-none"
                  }`}>
                    {m.content.split("\n").map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                        {line}
                      </p>
                    ))}
                    <span className={`text-[8px] font-bold block mt-2 opacity-50 ${m.role === "user" ? "text-right" : ""}`}>
                      {m.timestamp.toLocaleTimeString(lang === "en" ? "en-US" : "uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {chatMutation.isPending && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="rounded-xl rounded-tl-none p-4 text-xs bg-slate-50 dark:bg-slate-900/50 text-slate-505 border border-slate-100 dark:border-slate-800/40 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950 dark:text-white" />
                  <span>{activeLabels.loading}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/5 space-y-3">
            {/* Quick Suggestions row */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1 pb-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.q)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-semibold text-slate-600 dark:text-slate-350 hover:border-slate-950 dark:hover:border-white transition-all text-left cursor-pointer"
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2.5">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={activeLabels.placeholder}
                disabled={chatMutation.isPending}
                className="flex-1 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none transition-all"
              />
              <Button
                onClick={() => handleSend()}
                disabled={chatMutation.isPending || !input.trim()}
                className="h-10 px-4 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <span>{activeLabels.send}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Context panel */}
        <div className="space-y-4">
          <Card className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-50">
                {activeLabels.context}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t("dashboard.kpis.revenue")}</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-50">
                  {formatUzs(stats.revenue)}
                </span>
              </div>
              <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t("dashboard.kpis.expenses")}</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-50">
                  {formatUzs(stats.expenses)}
                </span>
              </div>
              <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t("dashboard.kpis.netProfit")}</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-50">
                  {formatUzs(stats.netProfit)}
                </span>
              </div>
              <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t("dashboard.kpis.estimatedTax")}</span>
                <span className="font-extrabold text-slate-950 dark:text-white">
                  {formatUzs(stats.estimatedTax)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

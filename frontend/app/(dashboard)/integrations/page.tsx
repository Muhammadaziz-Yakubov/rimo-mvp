"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, CheckCircle2, Database, Globe, Lock } from "lucide-react";
import { t } from "@/locales/t";

const INTEGRATIONS = [
  {
    id: "hisobot",
    name: "api.hisobot.gov.uz",
    description: "Soliq hisobotlarini topshirish uchun rasmiy hukumat API integratsiyasi",
    icon: Globe,
    status: "active",
    version: "v1.0",
    endpoints: ["POST /integration/auth/login", "GET /integration/report/task/list", "POST /integration/report/task/submit"],
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    description: "Ish maydoni, foydalanuvchilar va topshiriq ma'lumotlar bazasi",
    icon: Database,
    status: "active",
    version: "7.x",
    endpoints: ["Task", "Workspace", "AuditLog", "Notification"],
  },
  {
    id: "jwt",
    name: "JWT Authentication",
    description: "Hukumat API JWT tokenlarini boshqarish va avtomatik yangilash",
    icon: Lock,
    status: "active",
    version: "HS256",
    endpoints: ["Bearer Token", "Auto-refresh", "Secure storage"],
  },
];

export default function IntegrationsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("integrations.title")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {t("integrations.description")}
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {INTEGRATIONS.map((integ) => (
            <Card
              key={integ.id}
              className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <integ.icon className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{integ.name}</CardTitle>
                      <CardDescription className="text-[10px] mt-0.5">
                        {integ.version}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 shrink-0">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Faol
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {integ.description}
                </p>
                <div className="space-y-1">
                  {integ.endpoints.map((ep) => (
                    <div
                      key={ep}
                      className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md"
                    >
                      {ep}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info note */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 shadow-none rounded-xl">
          <CardContent className="p-5 flex items-start gap-3">
            <Link2 className="h-5 w-5 text-[#0B7A3B] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Rimo faqat rasmiy integratsiyalardan foydalanadi
              </p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Barcha ma'lumot almashinuvi O'zbekiston davlat soliq qo'mitasining rasmiy API manzillari orqali amalga oshiriladi.
                Hech qanday uchinchi tomon servislarga ma'lumot uzatilmaydi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

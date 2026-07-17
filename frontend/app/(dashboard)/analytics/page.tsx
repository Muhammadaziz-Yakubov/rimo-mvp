"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  FileCheck,
  BarChart3,
} from "lucide-react";
import { StatCard } from "@/components/data-display/stat-card";
import { useAnalytics } from "@/hooks/use-api";
import { t } from "@/locales/t";
import { formatUzNumber } from "@/utils/format-uz";

const COLORS = ["#0B7A3B", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  const hasData = analytics && analytics.tasksCount > 0;

  const pieData = hasData
    ? [
        { name: "Yuborilgan", value: analytics.tasksByStatus?.submitted || 0 },
        { name: "Jarayonda", value: analytics.tasksByStatus?.processing || 0 },
        { name: "Qoralama", value: analytics.tasksByStatus?.draft || 0 },
        { name: "Rad etilgan", value: analytics.tasksByStatus?.rejected || 0 },
      ].filter((d) => d.value > 0)
    : [];

  const monthlyData = analytics?.monthlyHistory || [];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("analytics.title")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {t("analytics.description")}
          </p>
        </div>

        {!isLoading && !hasData ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-zinc-400">
            <BarChart3 className="h-16 w-16 opacity-20" />
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-zinc-500">{t("analytics.noData")}</p>
              <p className="text-xs">Hisobot topshirgach, bu yerda tahlil ma'lumotlari ko'rinadi.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={t("analytics.totalFiled")}
                value={isLoading ? "-" : formatUzNumber(analytics?.tasksCount)}
                description="Jami yaratilgan hisobotlar"
                icon={FileCheck}
                loading={isLoading}
              />
              <StatCard
                title={t("analytics.successRate")}
                value={isLoading ? "-" : analytics?.tasksCount
                  ? `${Math.round(((analytics.tasksByStatus?.submitted || 0) / analytics.tasksCount) * 100)}%`
                  : "0%"}
                description="Muvaffaqiyatli topshirilgan"
                icon={Award}
                loading={isLoading}
              />
              <StatCard
                title="Qoralama soni"
                value={isLoading ? "-" : formatUzNumber(analytics?.tasksByStatus?.draft)}
                description="Yakunlanmagan hisobotlar"
                icon={Clock}
                loading={isLoading}
              />
              <StatCard
                title="Rad etilgan"
                value={isLoading ? "-" : formatUzNumber(analytics?.tasksByStatus?.rejected)}
                description="Qayta ko'rib chiqilishi kerak"
                icon={TrendingUp}
                loading={isLoading}
                className={analytics?.tasksByStatus?.rejected > 0 ? "border-red-200 dark:border-red-950/40" : ""}
              />
            </div>

            {/* Monthly Chart */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold">{t("analytics.submissionHistory")}</CardTitle>
                <CardDescription className="text-xs">
                  Hisobot topshirishlar oyma-oy dinamikasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0B7A3B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0B7A3B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
                        formatter={(value: any) => [value, "Hisobotlar"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#0B7A3B"
                        strokeWidth={2}
                        fill="url(#colorFiled)"
                        dot={{ fill: "#0B7A3B", r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            {pieData.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Holat bo'yicha taqsimot</CardTitle>
                    <CardDescription className="text-xs">Hozirgi hisobotlar statistikasi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {pieData.map((entry: any, index: number) => (
                        <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {entry.name}: {entry.value}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Oylik taqqoslama</CardTitle>
                    <CardDescription className="text-xs">Hisobotlar soni (joriy yil)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={monthlyData} barSize={16}>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }}
                          formatter={(value: any) => [value, "Hisobotlar"]}
                        />
                        <Bar dataKey="count" fill="#0B7A3B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

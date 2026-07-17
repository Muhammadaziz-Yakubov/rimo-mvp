"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building2, Sun, Moon, Globe } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useLanguageStore } from "@/store/language.store";
import { t } from "@/locales/t";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Yorug'", icon: Sun },
  { value: "dark", label: "Qorong'u", icon: Moon },
] as const;

export default function SettingsPage() {
  const { user, workspace, role } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { lang, setLanguage } = useLanguageStore();

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {t("settings.title")}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("settings.description")}
          </p>
        </div>

        {/* Profile Section */}
        <Card className="border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <User className="h-4.5 w-4.5 text-slate-400" />
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-50">{t("settings.profile")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("settings.username")}</Label>
              <Input
                value={user?.credential?.username || user?.pin || ""}
                disabled
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("settings.role")}</Label>
              <Input
                value={role || ""}
                disabled
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed capitalize"
              />
            </div>
          </CardContent>
        </Card>

        {/* Workspace Section */}
        <Card className="border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4.5 w-4.5 text-slate-400" />
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-50">{t("settings.workspace")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("settings.workspaceName")}</Label>
              <Input
                value={workspace?.name || "—"}
                disabled
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed"
              />
            </div>
            {workspace?.tin && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STIR</Label>
                <Input
                  value={workspace.tin}
                  disabled
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 rounded-lg cursor-not-allowed font-mono"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-4.5 w-4.5 text-slate-400" />
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-50">Tizim tili (Language)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: "uz", label: "O'zbekcha (Lotin)" },
                { value: "uz-cyr", label: "Ўзбекча (Крил)" },
                { value: "en", label: "English" },
                { value: "ru", label: "Русский" },
              ].map((option) => {
                const isSelected = lang === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setLanguage(option.value as any)}
                    className={cn(
                      "flex items-center justify-center h-10 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                      isSelected
                        ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                    )}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card className="border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Sun className="h-4.5 w-4.5 text-slate-400" />
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-50">{t("settings.theme")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                      isSelected
                        ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

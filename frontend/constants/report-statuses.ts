export interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const REPORT_STATUSES: Record<string, StatusConfig> = {
  draft: {
    label: "Qoralama",
    variant: "secondary",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    textColor: "text-zinc-800 dark:text-zinc-200",
    borderColor: "border-zinc-200 dark:border-zinc-700",
  },
  submitted: {
    label: "Yuborilgan",
    variant: "success",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-800 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-900/30",
  },
  processing: {
    label: "Jarayonda",
    variant: "info",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-800 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-900/30",
  },
  rejected: {
    label: "Rad etilgan",
    variant: "destructive",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-800 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-900/30",
  },
  archived: {
    label: "Arxivlangan",
    variant: "outline",
    bgColor: "bg-transparent",
    textColor: "text-zinc-500",
    borderColor: "border-zinc-200 dark:border-zinc-800",
  },
};

export const AUTHORITY_STATUSES: Record<string, StatusConfig> = {
  connected: {
    label: "Ulangan",
    variant: "success",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-800 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-900/30",
  },
  syncing: {
    label: "Sinxronizatsiya",
    variant: "info",
    bgColor: "bg-sky-50 dark:bg-sky-950/20",
    textColor: "text-sky-800 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-900/30",
  },
  error: {
    label: "Xatolik",
    variant: "destructive",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-800 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-900/30",
  },
  disconnected: {
    label: "Ulanmagan",
    variant: "secondary",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    textColor: "text-zinc-800 dark:text-zinc-200",
    borderColor: "border-zinc-200 dark:border-zinc-700",
  },
};

import { format } from "date-fns";
import { uz } from "date-fns/locale";

export function formatUzDate(dateString?: string | Date, formatStr = "yyyy-yil d-MMMM"): string {
  if (!dateString) return "-";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return format(date, formatStr, { locale: uz });
  } catch (error) {
    return "-";
  }
}

export function formatUzDateTime(dateString?: string | Date): string {
  return formatUzDate(dateString, "yyyy-yil d-MMMM, HH:mm");
}

export function formatUzNumber(num?: number | string): string {
  if (num === undefined || num === null || num === "") return "0";
  const parsed = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(parsed)) return "0";
  return new Intl.NumberFormat("fr-FR").format(parsed);
}

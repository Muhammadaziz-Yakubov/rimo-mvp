import { format } from "date-fns";

export function formatDate(dateString?: string | Date, formatStr = "dd.MM.yyyy"): string {
  if (!dateString) return "-";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    return "-";
  }
}

export function formatDateTime(dateString?: string | Date): string {
  return formatDate(dateString, "dd.MM.yyyy HH:mm");
}

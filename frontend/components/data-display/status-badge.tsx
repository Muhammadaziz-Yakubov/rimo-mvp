"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { REPORT_STATUSES, AUTHORITY_STATUSES } from "@/constants/report-statuses";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "report" | "authority";
  className?: string;
}

export function StatusBadge({ status, type = "report", className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = type === "report" 
    ? REPORT_STATUSES[normalizedStatus] 
    : AUTHORITY_STATUSES[normalizedStatus];

  if (!config) {
    return (
      <Badge variant="outline" className={cn("capitalize rounded-md", className)}>
        {status}
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full shrink-0", 
        normalizedStatus === "submitted" || normalizedStatus === "connected" ? "bg-emerald-500" :
        normalizedStatus === "processing" || normalizedStatus === "syncing" ? "bg-blue-500" :
        normalizedStatus === "rejected" || normalizedStatus === "error" ? "bg-red-500" :
        "bg-zinc-400"
      )} />
      {config.label}
    </span>
  );
}

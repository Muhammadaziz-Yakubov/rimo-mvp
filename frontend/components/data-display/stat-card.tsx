"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<any>;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
  };
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-xl", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-4 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2 bg-zinc-100 dark:bg-zinc-800" />
          <Skeleton className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-xl hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-850 flex items-center justify-center text-zinc-500">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  trend.direction === "up"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                    : trend.direction === "down"
                    ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                )}
              >
                {trend.direction === "up" && <ArrowUpRight className="mr-0.5 h-3 w-3 shrink-0" />}
                {trend.direction === "down" && <ArrowDownRight className="mr-0.5 h-3 w-3 shrink-0" />}
                {trend.direction === "neutral" && <Minus className="mr-0.5 h-3 w-3 shrink-0" />}
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-zinc-450 dark:text-zinc-500 truncate">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

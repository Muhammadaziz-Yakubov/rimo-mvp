import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Error loading data",
  message = "An error occurred while fetching information from the backend.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/5 min-h-[300px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Request
        </Button>
      )}
    </div>
  );
}

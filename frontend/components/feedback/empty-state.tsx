import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm min-h-[300px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#0B7A3B] hover:bg-[#096631] text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
